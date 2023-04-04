import React, { Component } from "react";
import axios from "axios";
import Message from "./Message";
import "./ChatWindow.css";
import PropTypes from "prop-types";
import ChatSettings from "./ChatSettings";

const defaultState = {
  newMessage: "",
  reportPressed: false,
};

class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.state = { ...defaultState };
  }

  componentDidMount() {
    // this.props.getMessages();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.chat &&
      this.props.chat &&
      prevProps.chat._id !== this.props.chat._id
    ) {
      this.setState({ ...defaultState });
      // this.props.getMessages();
    }
    if (
      prevProps.messages &&
      this.props.messages &&
      prevProps.messages[prevProps.messages.length - 1] !==
        this.props.messages[this.props.messages.length - 1]
    ) {
      document
        .getElementById("chatScrollBox")
        .scrollTo(0, document.getElementById("chatScrollBox").scrollHeight);
    }
  }

  onKeyDown = (e) => {
    if (e.key.toLowerCase() === "enter") {
      this.props.sendMessage(e.target.value);
      this.setState({
        newMessage: "",
      });
    }
  };

  titleOnKeyDown = (e) => {
    const key = e.key.toLowerCase();
    if (key === "escape") {
      this.props.setEditingTitle(false);
      this.props.setTitleInput(this.props.title ? this.props.title : "");
    } else if (key === "enter") {
      this.props.setEditingTitle(false);
      this.props.setTitle(this.props.titleInput);
    }
  };

  sendMessageButton = () => {
    let message = this.state.newMessage;
    if (message === "") return;
    this.props.sendMessage(message);
    this.setState({ newMessage: "" });
  };

  showReport = () => {
    this.setState({ reportPressed: true });
    this.props.setEditingTitle(false);
  };

  submitReport = async (
    kicking,
    blocking,
    unblocking,
    reporting,
    leavingDeleting
  ) => {
    if (reporting.length > 0) {
      const contents = document.getElementById("reason").value;
      for (const user of reporting) {
        axios.post(
          process.env.REACT_APP_API_URL + "/api/users/" + user + "/report",
          {
            contents: contents,
            reporter: this.props.selfID,
            chatID: this.props.chat._id,
          }
        );
      }
      document.getElementById("reason").value = "";
    }
    if (blocking.length > 0 || unblocking.length > 0) {
      await this.props.blockUnblockUsers(blocking, unblocking);
    }

    if (this.props.selfID === this.props.chat.owner) {
      if (leavingDeleting) {
        this.props.deleteChat();
      } else if (kicking.length > 0) {
        await this.props.kickUsers(kicking, this.props.chat._id);
      }
    } else if (leavingDeleting) {
      this.props.leaveChat();
    }
    this.setState({ reportPressed: false });
  };

  render = () => (
    <div className="chatWindow">
      <div className="chatWindowHeader">
        {!this.props.wideScreen && (
          <div className="windowToggleHolder">
            <button
              className="toggleSidebar"
              onClick={this.props.flipDisplaySidebar}
            >
              ←
            </button>
          </div>
        )}
        <div className="chatWindowTitle">
          {this.props.editingTitle ? (
            <input
              value={this.props.titleInput}
              onChange={(e) => this.props.setTitleInput(e.target.value)}
              onKeyDown={this.titleOnKeyDown}
              placeholder="New Chat Title"
              autoComplete="off"
            ></input>
          ) : (
            <h3
              className="chatTitle"
              onClick={() => {
                if (!this.state.reportPressed) {
                  this.props.setEditingTitle(true);
                }
              }}
            >
              {this.props.title
                ? this.props.title
                : String(
                    this.props.chat.users.map(
                      (id) => `${this.props.chat.profiles[id].name}`
                    )
                  ).replaceAll(",", ", ")}
            </h3>
          )}
        </div>
        <button
          className="themeButton"
          type="button"
          id="block"
          onClick={this.showReport}
        >
          Settings
        </button>
      </div>
      <div id="chatScrollBox" className="chatScrollBox">
        {this.props.messages
          .filter((m) => !this.props.blockedByMe.includes(m.author))
          .map((message, index) => {
            const msgDate = new Date(message.timestamp);
            const nowDate = new Date();
            return (
              <Message
                key={message._id}
                fromSelf={message.author === this.props.selfID}
                content={message.contents}
                image={this.props.chat.profiles[message.author].profilePicture}
                name={this.props.chat.profiles[message.author].name}
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
                  message.author === this.props.messages[index - 1].author
                }
                mergeBottom={
                  index < this.props.messages.length - 1 &&
                  message.author === this.props.messages[index + 1].author
                }
              />
            );
          })}
      </div>
      {this.state.reportPressed && (
        <ChatSettings
          exit={() => this.setState({ reportPressed: false })}
          submitReport={this.submitReport}
          chat={this.props.chat}
          selfID={this.props.selfID}
          blockedByMe={this.props.blockedByMe}
          otherUsers={this.props.otherUsers}
          addUsers={this.props.addUsers}
          title={
            this.props.title
              ? this.props.title
              : String(
                  this.props.chat.users.map(
                    (id) => `${this.props.chat.profiles[id].name}`
                  )
                ).replaceAll(",", ", ")
          }
          wideScreen={this.props.wideScreen}
        />
      )}
      <div className="newMessageBox">
        <input
          id="newMessageInput"
          autoComplete="off"
          name="newMessage"
          type="text"
          value={this.state.newMessage}
          placeholder="Aa"
          onChange={(e) => {
            if (e.target.value.length > 1500) {
              this.setState({ newMessage: e.target.value.slice(0, 1500) });
            } else {
              this.setState({ newMessage: e.target.value });
            }
          }}
          onKeyDown={this.onKeyDown}
        />
        <p
          onClick={() => {
            this.props.sendMessage("❤️");
          }}
        >
          ❤️
        </p>
        <p onClick={this.sendMessageButton}>➡️</p>
      </div>
    </div>
  );
}

ChatWindow.propTypes = {
  chat: PropTypes.object.isRequired,
  sendMessage: PropTypes.func.isRequired,
  profiles: PropTypes.array,
  title: PropTypes.string.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object),
  getMessages: PropTypes.func,
  otherUsers: PropTypes.arrayOf(PropTypes.object),
  addUsers: PropTypes.func.isRequired,
  setEditingTitle: PropTypes.func.isRequired,
  setTitleInput: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
  selfID: PropTypes.string.isRequired,
  titleInput: PropTypes.string.isRequired,
  editingTitle: PropTypes.bool.isRequired,
  leaveChat: PropTypes.func,
  deleteChat: PropTypes.func,
  blockUnblockUsers: PropTypes.func,
  blockedByMe: PropTypes.array,
  kickUsers: PropTypes.func,
  flipDisplaySidebar: PropTypes.func,
  wideScreen: PropTypes.bool,
};

export default ChatWindow;
