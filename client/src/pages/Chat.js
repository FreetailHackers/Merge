import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import ChatMissing from "../components/chat/ChatsMissing";
import PropTypes from "prop-types";
import { useOutletContext } from "react-router-dom";

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
      res = await axios.get(process.env.REACT_APP_API_URL + "/api/chats");
      let chatList = res.data;
      for (const chat of chatList) {
        // join websocket room
        socket.emit("join-room", { id: chat._id });
        chat.seen = chat.readBy.includes(userID);
      }
      setChats(chatList);
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

  useEffect(() => {
    const broadcastMessageWS = (data) => {
      setMessages((prev) => [...prev, data]);
      if (data.chat === selectedChat) {
        axios.post(
          process.env.REACT_APP_API_URL + `/api/chats/${data.chat}/read`
        );
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
          chat,
          ...prev.slice(0, chatIndex),
          ...prev.slice(chatIndex + 1, prev.length),
        ];
      });
    };

    socket.on("broadcast-message", broadcastMessageWS);

    return () => {
      socket.off("broadcast-message", broadcastMessageWS);
    };
  }, [socket, selectedChat, blockedByMe]);

  useEffect(() => {
    const addedWS = async (chat) => {
      chat.seen = false;
      socket.emit("join-room", { id: chat._id });
      setChats((prev) => [...prev, chat]);
    };

    const newUserWS = async (chat) => {
      updateChat(chat._id, chat);
    };

    const renamedWS = (data) => {
      setChats((prev) => {
        let index = prev.map((e) => e._id).indexOf(data.chatID);
        let newArr = [...prev];
        newArr[index].name = data.newName;
        return newArr;
      });
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

    const kickedWS = (data) => {
      setSelectedChat((prev) => (prev === data.chatID ? null : prev));
      setChats((prev) => [...prev.filter((e) => e._id !== data.chatID)]);
    };

    socket.on("added-to-room", addedWS);
    socket.on("new-user-added", newUserWS);
    socket.on("chat-renamed", renamedWS);
    socket.on("chat-deleted", deletedWS);
    socket.on("blocked-by", blockedWS);
    socket.on("unblocked-by", unblockedWS);
    socket.on("removed-from", kickedWS);

    return () => {
      socket.off("added-to-room", addedWS);
      socket.off("new-user-added", newUserWS);
      socket.off("chat-renamed", renamedWS);
      socket.off("chat-deleted", deletedWS);
      socket.off("blocked-by", blockedWS);
      socket.off("unblocked-by", unblockedWS);
      socket.off("removed-from", kickedWS);
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
    const res = await axios.post(
      process.env.REACT_APP_API_URL + `/api/chats/new`,
      {
        otherUsers: users,
      }
    );
    let chat = res.data;
    chat.seen = true;
    chat.lastMessage = null;
    socket.emit("create-room", {
      _id: chat._id,
      otherUsers: users,
      chat: chat,
    });
    setChats((prev) => [...prev, chat]);
    setSelectedChat(chat._id);
  }

  async function getMessages(chatID) {
    let chat = chats[chats.findIndex((e) => e._id === chatID)];
    const res = await axios.get(
      process.env.REACT_APP_API_URL + `/api/chats/${chatID}/messages`
    );
    chat.seen = true;
    const messageList = res.data;
    // fill in missing profiles (needed if someone leaves the chat)
    const authors = [...new Set(messageList.map((message) => message.author))];
    for (const author of authors) {
      if (!(author in chat.profiles)) {
        const res2 = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/conciseInfo/${author}`
        );
        chat.profiles[author] = res2.data;
      }
    }
    updateChat(chatID, chat);
    setMessages(res.data);
  }

  function sendMessage(contents) {
    if (contents === "") return;
    const chat = chats[activeChatIndex];
    const message = {
      author: userID,
      contents: contents,
      chat: chat._id,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, message]);
    axios
      .post(process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/messages`, {
        contents,
      })
      .then((res) => {
        // Update the last message of the chat and move it to the top
        socket.emit("new-message", message);
        chat.lastMessage = res.data;
        setChats((prev) => [
          chat,
          ...prev.filter((e) => e._id !== selectedChat),
        ]);
      });
  }

  function addUsers(newUserIDs) {
    const chat = chats[activeChatIndex];
    axios
      .post(process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/add`, {
        users: newUserIDs,
      })
      .then((res) => {
        let newChat = {
          ...res.data,
          lastMessage: chat.lastMessage,
          seen: chat.seen,
        };
        updateChat(chat._id, newChat);
        socket.emit("add-users", { userIDs: newUserIDs, chat: newChat });
      });
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
    axios
      .post(
        process.env.REACT_APP_API_URL + `/api/chats/${deletedChat._id}/delete`
      )
      .then(() => {
        socket.emit("delete-chat", deletedChat);
        setSelectedChat(null);
        setChats((prev) => [...prev.filter((e) => e._id !== deletedChat._id)]);
      });
  }

  function leaveChat() {
    const leftChat = { ...chats[activeChatIndex] };
    axios
      .post(process.env.REACT_APP_API_URL + `/api/chats/${leftChat._id}/leave`)
      .then(() => {
        socket.emit("leave-chat", {
          chatID: leftChat._id,
          user: userID,
        });
        setSelectedChat(null);
        setChats((prev) => [...prev.filter((e) => e._id !== leftChat._id)]);
      });
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
    await axios.post(
      process.env.REACT_APP_API_URL + `/api/chats/${chatID}/remove`,
      { users }
    );
    socket.emit("remove-users", {
      chatID: chatID,
      users: users,
    });
    let chat = chats[activeChatIndex];
    chat.users = [...chat.users.filter((e) => !users.includes(e))];
    updateChat(selectedChat, chat);
  }

  return (
    <div className="chat">
      {(props.wideScreen || !displayWindow) && (
        <ChatSidebar
          chats={chats}
          changeChat={(id) => {
            setDisplayWindow(true);
            setSelectedChat(id);
            getMessages(id);
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
        <div id='mobile-nav-space' style={{height: '17vw'}}/>
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
