import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import ChatMissing from "../components/ChatsMissing";
import PropTypes from "prop-types";
import { useOutletContext } from "react-router-dom";
import "./Chat.css";
import {
  createRoom,
  newMessage,
  listenForNewMessages,
  readMessage,
  addUser,
  removeUsers,
  //// blockUsers,
  //// unblockUsers,
  //renameRoom,
  leaveRoom,
  deleteRoom,
  listenForRoomAdditions,
  listenForRoomDeletions,
  listenForUserAdditions,
  listenForUserRemovals,
  listenForNameChanges,
} from "../utils/firebase";

function Chat(props) {
  const [chats, setChats] = useState([]);
  const socket = useOutletContext();

  const updateChat = (id, newValue) => {
    setChats((prev) => {
      const index = prev.findIndex((e) => e._id === id);
      let newArr = [...prev];
      newArr[index] = newValue;
      return newArr;
    });
  };
  const [selectedChat, setSelectedChat] = useState(null);
  const activeChatIndex = chats.findIndex((e) => e._id === selectedChat);
  const [messages, setMessages] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [blockedByMe, setBlockedByMe] = useState(props.blockList ?? []);
  const [displayWindow, setDisplayWindow] = useState(false);

  const { userID } = props;

  const connected = socket?.connected;
  useEffect(() => {
    async function setupAPICalls() {
      let res = await axios.get(
        process.env.REACT_APP_API_URL + "/api/chats/reachableUsers"
      );
      setOtherUsers(res.data);
    }

    if (connected) {
      setupAPICalls();
    }

    return () => {
      if (connected) {
        socket.emit("leave-chat-rooms");
      }
    };
  }, [socket, connected, userID]);

  useEffect(()=> {
    const broadcastMessageWS = (data) => {
      setMessages((prev) => [...prev, data]);
      if (data.chat === selectedChat) {
        readMessage(data.chat, userID); 
      }
      setChats((prev) => {
        let chatIndex = prev.map((e) => e._id).indexOf(data.chat);
        const chat = prev[chatIndex];
        if (data.chat !== selectedChat) {
          chat.seen = false;
        }
        if (!blockedByMe.includes(data.author)) {
          chat.lastMessage = data;
        }
        return [
          ...prev.slice(0, chatIndex),
          chat,
          ...prev.slice(chatIndex + 1, prev.length),
        ];
      });
    };

    const userAddWS = async (userId) => {
      // FIXME: Concurrency issues?
      const chat = chats.find((e) => e._id === selectedChat);
      if (chat.users.indexOf(userId) === -1) {
        chat.users.push(userId);
      }
      updateChat(selectedChat, chat);
    };
    
    const userRemWS = async (userId) => {
      // FIXME: Concurrency issues?
      const chat = chats.find((e) => e._id === selectedChat);
      const idx = chat.users.indexOf(userId)
      if (idx > 0) {
        chat.users.splice(idx, 1);
      }
      updateChat(selectedChat, chat);
    };
    
    const renamedWS = (data) => {
      return;
      setChats((prev) => {
        let index = prev.map((e) => e._id).indexOf(data.chatID);
        let newArr = [...prev];
        newArr[index].name = data.newName;
        return newArr;
      });
    };

    setChats((prev) => {
      if(selectedChat === null) return prev;
        let chatIndex = prev.map((e) => e._id).indexOf(selectedChat);
        const chat = prev[chatIndex];
        chat.seen = true;
        return [
          ...prev.slice(0, chatIndex),
          chat,
          ...prev.slice(chatIndex + 1, prev.length),
        ];
      });

    setMessages([])
    var lfnmCleanup = listenForNewMessages({ roomId: selectedChat, userId: userID}, broadcastMessageWS);
    var lfuaCleanup = listenForUserAdditions(selectedChat, userAddWS)
    var lfurCleanup = listenForUserRemovals(selectedChat, userRemWS)
    var lfncCleanup = listenForNameChanges(selectedChat, renamedWS)
    return () => {
      lfnmCleanup();
      lfuaCleanup();
      lfurCleanup();
      lfncCleanup();
    }
  }, [selectedChat])

  useEffect(() => {
    const addedWS = async (chat) => {
      setChats((prev) => [...prev, chat]);
     };
       const deletedWS = (deletedChat) => {
      setSelectedChat((prev) => (prev === deletedChat._id ? null : prev));
      setChats((prev) => [...prev.filter((e) => e._id !== deletedChat._id)]);
    };

    const blockedWS = (data) => {
      setOtherUsers((prev) => [...prev.filter((e) => e._id !== data.userID)]);
    };

    const unblockedWS = async (data) => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/conciseInfo/${data.userID}`
      );
      setOtherUsers((prev) => [...prev, { _id: data.userID, ...res.data }]);
    };

    var lfraCleanup = listenForRoomAdditions(userID, addedWS);
    var lfrdCleanup = listenForRoomDeletions(userID, deletedWS);
    socket.on("blocked-by", blockedWS);
    socket.on("unblocked-by", unblockedWS);
    return () => {
      lfraCleanup();
      lfrdCleanup();
      socket.off("blocked-by", blockedWS);
      socket.off("unblocked-by", unblockedWS);
    };
  }, [socket]);

  useEffect(() => {
    const userLeftWS = (data) => {
      if (data.user === userID) {
        setSelectedChat((prev) => (prev === data.chatID ? null : prev));
        setChats((prev) => [...prev.filter((e) => e._id !== data.chatID)]);
      } else {
        setChats((prev) => {
          let index = prev.findIndex((e) => e._id === data.chatID);
          let newArr = [...prev];
          newArr[index].users = [
            ...newArr[index].users.filter((e) => e !== data.user),
          ];
          return newArr;
        });
      }
    };

    socket.on("user-left", userLeftWS);

    return () => {
      socket.off("user-left", userLeftWS);
    };
  }, [socket, userID]);

  async function createChat(users) {
    let chat = {
      users: [userID, ...users],
      profiles: {}
    };

    for (const userId of chat.users) {
      const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/conciseInfo/${userId}`
        );

      chat.profiles[userId] = res.data;
    }

    chat.seen = true;
    chat.lastMessage = null;
    createRoom(chat); 
    setSelectedChat(chat._id);
  }

  function sendMessage(contents) {
    if (contents === "") return;
    const chat = chats[activeChatIndex];
    const message = {
      author: userID,
      contents: contents,
      chat: chat._id,
      recipients: chat.users,
      timestamp: new Date().toISOString(),
    };
    newMessage(message);
  }

  function addUsers(newUserIDs) {
    const chat = chats[activeChatIndex];
    addUser({ roomId: chat._id, users: newUserIDs});
  }

  function setTitle(newTitle) {
    let chat = chats[activeChatIndex];
    axios
      .post(process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/rename`, {
        name: newTitle,
      })
      .then(() => {
        chat.name = newTitle;
        updateChat(chat._id, chat);
        socket.emit("rename-chat", {
          chatID: chat._id,
          newName: chat.name,
        });
      });
  }

  function deleteChat() {
    const deletedChat = { ...chats[activeChatIndex] };
    deleteRoom(deletedChat._id);
  }

  function leaveChat() {
    const leftChat = { ...chats[activeChatIndex] };
    leaveRoom({ _id: leftChat._id, userId: userID});
  }

  async function blockUnblockUsers(blocking, unblocking) {
    for (const user of blocking) {
      await axios.post(
        process.env.REACT_APP_API_URL + "/api/users/" + user + "/block"
      );
    }
    if (blocking.length > 0) {
      socket.emit("block-users", { users: blocking });
    }
    for (const user of unblocking) {
      await axios.post(
        process.env.REACT_APP_API_URL + "/api/users/" + user + "/unblock"
      );
    }
    if (unblocking.length > 0) {
      socket.emit("unblock-users", { users: unblocking });
    }
    const res = await axios.get(
      process.env.REACT_APP_API_URL + "/api/chats/reachableUsers"
    );
    setOtherUsers(res.data);
    setBlockedByMe((prev) => [
      ...[...new Set([...prev, ...blocking])].filter(
        (u) => !unblocking.includes(u)
      ),
    ]);
  }

  async function kickUsers(users, chatID) {
    removeUsers(chatID, users); 
  }

  return (
    <div className="chat">
      {(props.wideScreen || !displayWindow) && (
        <ChatSidebar
          chats={chats}
          changeChat={(id) => {
            setDisplayWindow(true);
            setSelectedChat(id);
          }}
          selectedChat={selectedChat}
          createChat={createChat}
          flipDisplaySidebar={props.flipDisplaySidebar}
          wideScreen={props.wideScreen}
          otherUsers={otherUsers}
          selfID={userID}
        />
      )}
      {(props.wideScreen || displayWindow) &&
        (activeChatIndex === -1 ? (
          <ChatMissing
            hasChats={chats.length > 0}
            flipDisplaySidebar={() => setDisplayWindow(false)}
            wideScreen={props.wideScreen}
          />
        ) : (
          <ChatWindow
            messages={messages.filter(
              (message) => message.chat === selectedChat
            )}
            key={selectedChat._id}
            sendMessage={sendMessage}
            selfID={userID}
            addUsers={addUsers}
            title={chats[activeChatIndex].name}
            setTitle={(newTitle) => setTitle(newTitle)}
            otherUsers={otherUsers}
            chat={chats[activeChatIndex]}
            deleteChat={deleteChat}
            leaveChat={leaveChat}
            blockedByMe={blockedByMe}
            blockUnblockUsers={blockUnblockUsers}
            kickUsers={kickUsers}
            flipDisplaySidebar={() => setDisplayWindow(false)}
            wideScreen={props.wideScreen}
          />
        ))}
    </div>
  );
}

Chat.propTypes = {
  userID: PropTypes.string.isRequired,
  wideScreen: PropTypes.bool,
  flipDisplaySidebar: PropTypes.func,
  blockList: PropTypes.array,
};

export default Chat;
