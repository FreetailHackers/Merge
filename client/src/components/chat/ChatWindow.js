import React, { useState, useEffect } from "react";
import axios from "axios";
import Message from "./Message";
import PropTypes from "prop-types";
import ChatSettings from "./ChatSettings";

function ChatWindow(props) {
  const [newMessage, setNewMessage] = useState("");
  const [reportPressed, setReportPressed] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(props.title);
  const [lockScroll, setLockScroll] = useState(true);

  const messageCount = props.messages.length;
  useEffect(() => {
    const scrollBox = document.getElementById("chatScrollBox");
    if (lockScroll) {
      scrollBox.scrollTo(0, scrollBox.scrollHeight);
    }
  }, [lockScroll, messageCount]);

  useEffect(() => {
    const scrollBox = document.getElementById("chatScrollBox");
    const handleScroll = (e) => {
      setLockScroll(
        scrollBox.scrollTop + 10 >=
          scrollBox.scrollHeight - scrollBox.offsetHeight
      );
    };
    scrollBox.addEventListener("scroll", handleScroll);
    return () => {
      scrollBox.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const onKeyDown = (e) => {
    if (e.key.toLowerCase() === "enter") {
      props.sendMessage(e.target.value);
      setNewMessage("");
    }
  };

  const titleOnKeyDown = (e) => {
    const key = e.key.toLowerCase();
    if (key === "escape") {
      setEditingTitle(false);
      setTitleInput(props.title ?? "");
    } else if (key === "enter") {
      setEditingTitle(false);
      props.setTitle(titleInput);
    }
  };

  const sendMessageButton = () => {
    let message = newMessage;
    if (message === "") return;
    props.sendMessage(message);
    setNewMessage("");
  };

  const showReport = () => {
    setEditingTitle(false);
    setReportPressed(true);
  };

  const submitReport = async (
    kicking,
    blocking,
    unblocking,
    reporting,
    leavingDeleting
  ) => {
    if (reporting.length > 0) {
      const contents = document.getElementById("reason").value;
      axios.post(process.env.REACT_APP_API_URL + "/api/users/report", {
        contents: contents,
        reported: reporting,
        chatID: props.chat._id,
      });
      document.getElementById("reason").value = "";
    }
    if (blocking.length > 0 || unblocking.length > 0) {
      await props.blockUnblockUsers(blocking, unblocking);
    }

    if (props.selfID === props.chat.owner) {
      if (leavingDeleting) {
        props.deleteChat();
      } else if (kicking.length > 0) {
        await props.kickUsers(kicking, props.chat._id);
      }
    } else if (leavingDeleting) {
      props.leaveChat();
    }
    setReportPressed(false);
  };

  return (
    <div className="chatWindow">
      <div className="chatWindowHeader">
        {!props.wideScreen && (
          <div className="windowToggleHolder">
            <button onClick={props.displaySidebar} className="toggleSidebar">
              ←
            </button>
          </div>
        )}
        <div className="chatWindowTitle">
          {editingTitle ? (
            <input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={titleOnKeyDown}
              placeholder="New Chat Title"
              autoComplete="off"
            ></input>
          ) : (
            <h3
              className="chatTitle"
              onClick={() => {
                if (!reportPressed) {
                  setEditingTitle(true);
                }
              }}
            >
              {props.title
                ? props.title
                : String(
                    props.chat.users.map(
                      (id) => `${props.chat.profiles[id].name}`
                    )
                  ).replaceAll(",", ", ")}
            </h3>
          )}
        </div>
        <button
          className="themeButton"
          type="button"
          id="block"
          onClick={showReport}
        >
          Settings
        </button>
      </div>
      <div id="chatScrollBox" className="chatScrollBox">
        {props.messages
          .filter((m) => !props.blockedByMe.includes(m.author))
          .map((message, index) => {
            const msgDate = new Date(message.timestamp);
            const nowDate = new Date();
            return (
              <Message
                key={index}
                fromSelf={message.author === props.selfID}
                content={message.contents}
                image={props.chat.profiles[message.author].profilePictureUrl}
                name={props.chat.profiles[message.author].name}
                timestamp={
                  (msgDate.getDate() !== nowDate.getDate() ||
                  msgDate.getMonth() !== nowDate.getMonth() ||
                  msgDate.getFullYear() !== nowDate.getFullYear()
                    ? msgDate.toDateString().slice(4) + " "
                    : "") +
                  msgDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                mergeTop={
                  index > 0 &&
                  message.author === props.messages[index - 1].author
                }
                mergeBottom={
                  index < props.messages.length - 1 &&
                  message.author === props.messages[index + 1].author
                }
              />
            );
          })}
      </div>
      {reportPressed && (
        <ChatSettings
          exit={() => setReportPressed(false)}
          submitReport={submitReport}
          chat={props.chat}
          selfID={props.selfID}
          blockedByMe={props.blockedByMe}
          otherUsers={
            props.otherUsers &&
            props.otherUsers.filter(
              (user) => !props.chat.users.includes(user._id)
            )
          }
          addUsers={props.addUsers}
          title={
            props.title
              ? props.title
              : String(
                  props.chat.users.map(
                    (id) => `${props.chat.profiles[id].name}`
                  )
                ).replaceAll(",", ", ")
          }
          wideScreen={props.wideScreen}
        />
      )}
      <div className="newMessageBox">
        <input
          id="newMessageInput"
          autoComplete="off"
          name="newMessage"
          type="text"
          value={newMessage}
          placeholder="Aa"
          onChange={(e) => {
            if (e.target.value.length > 1500) {
              setNewMessage(e.target.value.slice(0, 1500));
            } else {
              setNewMessage(e.target.value);
            }
          }}
          onKeyDown={onKeyDown}
        />
        <p
          onClick={() => {
            props.sendMessage("❤️");
          }}
        >
          ❤️
        </p>
        <p onClick={sendMessageButton}>➡️</p>
      </div>
    </div>
  );
}

ChatWindow.propTypes = {
  chat: PropTypes.object.isRequired,
  sendMessage: PropTypes.func.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object),
  otherUsers: PropTypes.arrayOf(PropTypes.object),
  addUsers: PropTypes.func.isRequired,
  key: PropTypes.string,
  title: PropTypes.string,
  setTitle: PropTypes.func.isRequired,
  selfID: PropTypes.string.isRequired,
  leaveChat: PropTypes.func,
  deleteChat: PropTypes.func,
  blockUnblockUsers: PropTypes.func,
  blockedByMe: PropTypes.array,
  kickUsers: PropTypes.func,
  wideScreen: PropTypes.bool,
  displaySidebar: PropTypes.func,
};

export default ChatWindow;
