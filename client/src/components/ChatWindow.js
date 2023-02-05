import React, { Component } from "react";
import axios from "axios";
import Message from "./Message";
import "./ChatWindow.css";
import PropTypes from "prop-types";
import { MultiSelect } from "@mantine/core";

class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newMessage: "",
      newUserIDs: [],
      reportPressed: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.chat &&
      this.props.chat &&
      prevProps.chat._id !== this.props.chat._id
    ) {
      this.setState({ newUserIDs: [], reportPressed: false });
    }
  }

  onType = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  onKeyDown = (e) => {
    if (e.key.toLowerCase() === "enter") {
      this.props.sendMessage(e.target.value);
      this.setState({
        [e.target.name]: "",
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
    let message = document.getElementById("newMessageInput").value;
    if (message === "") return;
    this.props.sendMessage(message);
  };

  showReport = () => {
    this.setState({ reportPressed: true, newUserIDs: [] });
  };

  report = () => {
    const contents = document.getElementById("reason").value;
    for (const user of this.state.newUserIDs) {
      axios.post(
        process.env.REACT_APP_API_URL + "/api/users/" + user + "/report",
        { contents }
      );
    }
    document.getElementById("reason").value = "";
    this.setState({ reportPressed: false, newUserIDs: [] });
  };

  render = () => (
    <div className="chatWindow">
      <div id="chatScrollBox" className="chatScrollBox">
        {this.props.messages.map((message, index) => {
          return (
            <Message
              key={message._id}
              fromSelf={message.author === this.props.selfID}
              content={message.contents}
              image={this.props.profile[message.author].profilePicture}
              name={this.props.profile[message.author].name}
              timestamp={new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
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
      {
        <div
          id="reportFloatingWindow"
          className={
            this.state.reportPressed ? "reportFloatingWindow" : "hidden"
          }
        >
          <button
            id="exit"
            className="exitButton"
            onClick={() =>
              this.setState({ reportPressed: false, newUserIDs: [] })
            }
          >
            ✖
          </button>
          <MultiSelect
            value={this.state.newUserIDs}
            onChange={(values) => this.setState({ newUserIDs: values })}
            placeholder="Search for people"
            searchable
            data={this.props.chat.users.map((userID) => ({
              value: userID,
              label: this.props.chat.profiles[userID].name,
            }))}
          />
          <textarea id="reason" placeholder="Reason for reporting" />
          <button id="submit" className="submitButton" onClick={this.report}>
            ➡️
          </button>
        </div>
      }
      <div className="newMessageBox">
        <input
          id="newMessageInput"
          autoComplete="off"
          name="newMessage"
          type="text"
          value={this.state.newMessage}
          placeholder="Aa"
          onChange={this.onType}
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
      <div className="chatWindowHeader">
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
            onClick={() => this.props.setEditingTitle(true)}
          >
            {this.props.title}
          </h3>
        )}
        <MultiSelect
          value={this.state.newUserIDs}
          onChange={(values) => this.setState({ newUserIDs: values })}
          placeholder="Search for people"
          searchable
          data={
            this.props.otherUsers &&
            this.props.otherUsers.map((user) => ({
              value: user._id,
              label: user.name,
              image:
                user.profile &&
                user.profile[0] &&
                user.profile[0].profilePictureUrl &&
                user.profile[0].profilePictureUrl,
            }))
          }
        />
        <button
          onClick={() => {
            this.props.addUsers(this.state.newUserIDs);
            this.setState({ newUserIDs: [] });
          }}
        >
          Add User
        </button>
        {this.props.chat.users.length > 1 && (
          <button
            type="button"
            id="block"
            onClick={
              this.props.chat.users.length === 2
                ? this.block
                : this.props.leaveChat
            }
          >
            {this.props.chat.users.length === 2 ? "Block" : "Leave"}
          </button>
        )}
        <button type="button" id="report" onClick={this.showReport}>
          Report
        </button>
        {this.props.chat.owner === this.props.selfID && (
          <button type="button" id="delete" onClick={this.props.deleteChat}>
            Delete Chat
          </button>
        )}
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
  otherUsers: PropTypes.arrayOf(PropTypes.object),
  addUsers: PropTypes.func.isRequired,
  setEditingTitle: PropTypes.func.isRequired,
  setTitleInput: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
  selfID: PropTypes.string.isRequired,
  profile: PropTypes.object.isRequired,
  titleInput: PropTypes.string.isRequired,
  editingTitle: PropTypes.bool.isRequired,
  leaveChat: PropTypes.func,
  deleteChat: PropTypes.func,
};

export default ChatWindow;
