import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import ChatMissing from "../components/chat/ChatsMissing";
import PropTypes from "prop-types";
<<<<<<< HEAD
import "./Chat.css";
import {
  createRoom,
  newMessage,
  listenForNewMessages,
  listenForRoomRename,
  readMessage,
  addUser,
  removeUsers,
  blockUsers,
  unblockUsers,
  listenForBlockAndUnblock,
  renameRoom,
  leaveRoom,
  deleteRoom,
  listenForRoomAdditions,
  listenForRoomDeletions,
  listenForUserAdditions,
  listenForUserRemovals,
} from "../utils/firebase";
import { useOutletContext } from "react-router-dom";

function Chat(props) {
  const [chats, setChats] = useState([]);

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

  useEffect(() => {
    async function setupAPICalls() {
      let res = await axios.get(
        process.env.REACT_APP_API_URL + "/api/chats/reachableUsers"
      );
      setOtherUsers(res.data);
    }

    setupAPICalls();
  }, [userID]);

  useEffect(() => {
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
      const chat = chats.find((e) => e._id === selectedChat);
      if (chat.users.indexOf(userId) === -1) {
        chat.users.push(userId);
      }
      updateChat(selectedChat, chat);
    };

    const userRemWS = async (userId) => {
      // FIXME: Concurrency issues?
      const chat = chats.find((e) => e._id === selectedChat);
      const idx = chat.users.indexOf(userId);
      if (idx > 0) {
        chat.users.splice(idx, 1);
      }
      updateChat(selectedChat, chat);
    };

    const renamedWS = (data) => {
      setChats((prev) => {
        let index = prev.map((e) => e._id).indexOf(data.chatID);
        if (index != -1) {
          let newArr = [...prev];
          newArr[index].name = data.newName;
          return newArr;
        }
        return prev;
      });
    };

    const blockedUnblockedWS = async (data) => {
      if (data.type === "block") {
        setOtherUsers((prev) => [...prev.filter((e) => e._id !== data.userID)]);
      } else {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/conciseInfo/${data.userID}`
        );
        setOtherUsers((prev) => [...prev, { _id: data.userID, ...res.data }]);
      }
    };

    setChats((prev) => {
      if (selectedChat === null) return prev;
      let chatIndex = prev.map((e) => e._id).indexOf(selectedChat);
      if (chatIndex === -1) return prev;
      const chat = prev[chatIndex];
      chat.seen = true;
      return [
        ...prev.slice(0, chatIndex),
        chat,
        ...prev.slice(chatIndex + 1, prev.length),
      ];
    });

    setMessages([]);
    var lfnmCleanup = listenForNewMessages(
      { roomId: selectedChat, userId: userID },
      broadcastMessageWS
    );
    var lfrCleanup = listenForRoomRename({ roomId: selectedChat }, renamedWS);
    var lfuaCleanup = listenForUserAdditions(selectedChat, userAddWS);
    var lfurCleanup = listenForUserRemovals(selectedChat, userRemWS);
    var lfbauCleanup = listenForBlockAndUnblock(
      selectedChat,
      blockedUnblockedWS
    );
    return () => {
      lfnmCleanup();
      lfuaCleanup();
      lfurCleanup();
      lfrCleanup();
      lfbauCleanup();
    };
  }, [selectedChat]);

  useEffect(() => {
    const addedWS = async (chat) => {
      setChats((prev) => [...prev, chat]);
    };
    const deletedWS = (deletedChat) => {
      setSelectedChat((prev) => (prev === deletedChat._id ? null : prev));
      setChats((prev) => [...prev.filter((e) => e._id !== deletedChat._id)]);
    };

    var lfraCleanup = listenForRoomAdditions(userID, addedWS);
    var lfrdCleanup = listenForRoomDeletions(userID, deletedWS);

    return () => {
      lfraCleanup();
      lfrdCleanup();
    };
  }, []);

  async function createChat(users) {
    let chat = {
      users: [userID, ...users],
      profiles: {},
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
    addUser({ roomId: chat._id, users: newUserIDs });
  }

  function setTitle(newTitle) {
    let chat = chats[activeChatIndex];
    console.log(chat);
    renameRoom({ chatId: chat._id, name: newTitle });
  }

  function deleteChat() {
    const deletedChat = { ...chats[activeChatIndex] };
    deleteRoom(deletedChat._id);
  }

  function leaveChat() {
    const leftChat = { ...chats[activeChatIndex] };
    leaveRoom({ _id: leftChat._id, userId: userID });
  }

  async function blockUnblockUsers(blocking, unblocking) {
    for (const user of blocking) {
      await axios.post(
        process.env.REACT_APP_API_URL + "/api/users/" + user + "/block"
      );
    }
    if (blocking.length > 0) {
      blockUsers(chats[activeChatIndex]._id, blocking);
    }
    for (const user of unblocking) {
      await axios.post(
        process.env.REACT_APP_API_URL + "/api/users/" + user + "/unblock"
      );
    }
    if (unblocking.length > 0) {
      unblockUsers(chats[activeChatIndex]._id, unblocking);
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
