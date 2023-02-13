import React, { Component } from "react";
import axios from "axios";
import Message from "./Message";
import "./ChatWindow.css";
import PropTypes from "prop-types";
import { MultiSelect } from "@mantine/core";

const defaultState = {
  newMessage: "",
  newUserIDs: [],
  addingUsers: false,
  reportPressed: false,
  reportChecked: false,
  blockChecked: false,
  leavingDeleting: false,
};

class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.state = { ...defaultState };
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.chat &&
      this.props.chat &&
      prevProps.chat._id !== this.props.chat._id
    ) {
      this.setState({ ...defaultState });
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
    this.setState({ reportPressed: true, newUserIDs: [], addingUsers: false });
  };

  submitReport = () => {
    if (this.state.reportChecked) {
      const contents = document.getElementById("reason").value;
      for (const user of this.state.newUserIDs) {
        axios.post(
          process.env.REACT_APP_API_URL + "/api/users/" + user + "/report",
          { contents }
        );
      }
      document.getElementById("reason").value = "";
    }
    if (this.state.blockChecked) {
      // need to modify the backend heavily
    }
    this.setState({
      reportPressed: false,
      newUserIDs: [],
      reportChecked: false,
      blockChecked: false,
    });
  };

  render = () => (
    <div className="chatWindow">
      <div className="chatWindowHeader">
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
              onClick={() => this.props.setEditingTitle(true)}
            >
              {this.props.title}
            </h3>
          )}
        </div>
        <div
          className="userAddition"
          style={this.state.addingUsers ? { width: "30%", marginRight: 8 } : {}}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginBottom: this.state.addingUsers ? 10 : 0,
            }}
          >
            {this.state.addingUsers && (
              <button
                className="themeButton"
                onClick={() => {
                  this.setState({ addingUsers: false, newUserIDs: [] });
                }}
              >
                Cancel
              </button>
            )}
            {!this.state.reportPressed &&
              (!this.state.addingUsers || this.state.newUserIDs.length > 0) && (
                <button
                  className="themeButton"
                  onClick={() => {
                    if (this.state.addingUsers) {
                      this.props.addUsers(this.state.newUserIDs);
                      this.setState({ newUserIDs: [], addingUsers: false });
                    } else {
                      this.setState({ addingUsers: true });
                    }
                  }}
                >
                  Add User
                </button>
              )}
          </div>
          {this.state.addingUsers && (
            <MultiSelect
              style={{ width: "100%" }}
              value={this.state.newUserIDs}
              onChange={(values) => this.setState({ newUserIDs: values })}
              placeholder="Search for people"
              searchable
              data={
                this.props.otherUsers &&
                this.props.otherUsers.map((user) => ({
                  value: user._id,
                  label: user.name,
                  image: user.profile && user.profile[0]?.profilePictureUrl,
                }))
              }
            />
          )}
        </div>
        {this.props.chat.users.length > 1 && (
          <button
            className="themeButton"
            type="button"
            id="block"
            onClick={this.showReport}
          >
            {"Block/Report"}
          </button>
        )}
        {this.state.leavingDeleting && (
          <button
            className="themeButton"
            onClick={() => this.setState({ leavingDeleting: false })}
          >
            Cancel
          </button>
        )}
        <button
          className="themeButton"
          type="button"
          id="delete"
          onClick={
            !this.state.leavingDeleting
              ? () => this.setState({ leavingDeleting: true })
              : this.props.chat.owner === this.props.selfID
              ? this.props.deleteChat
              : this.props.leaveChat
          }
        >
          {this.state.leavingDeleting
            ? `Confirm ${
                this.props.chat.owner === this.props.selfID
                  ? "Deleting"
                  : "Leaving"
              }?`
            : `${
                this.props.chat.owner === this.props.selfID ? "Delete" : "Leave"
              } Chat`}
        </button>
      </div>
      <div id="chatScrollBox" className="chatScrollBox">
        {this.props.messages.map((message, index) => {
          return (
            <Message
              key={message._id}
              fromSelf={message.author === this.props.selfID}
              content={message.contents}
              image={this.props.chat.profiles[message.author].profilePicture}
              name={this.props.chat.profiles[message.author].name}
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
            Cancel
          </button>

          <MultiSelect
            value={this.state.newUserIDs}
            onChange={(values) => this.setState({ newUserIDs: values })}
            placeholder="Search for people"
            searchable
            data={this.props.chat.users
              .filter((user) => user !== this.props.selfID)
              .map((userID) => ({
                value: userID,
                label: this.props.chat.profiles[userID].name,
              }))}
          />
          <div className="reportWindowCheckbox">
            <input
              type="checkbox"
              onChange={(e) =>
                this.setState({ blockChecked: e.target.checked })
              }
              checked={this.state.blockChecked}
            />
            <p style={{ marginRight: "15%" }}>Block users?</p>
            <input
              type="checkbox"
              onChange={(e) =>
                this.setState({ reportChecked: e.target.checked })
              }
              checked={this.state.reportChecked}
            />
            <p>Report users?</p>
          </div>
          {this.state.reportChecked && (
            <textarea id="reason" placeholder="Reason for reporting" />
          )}
          {this.state.newUserIDs.length > 0 &&
            (this.state.blockChecked || this.state.reportChecked) && (
              <button
                id="submit"
                className="submitButton themeButton"
                onClick={this.submitReport}
              >
                Submit
              </button>
            )}
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
          onChange={(e) => this.setState({ newMessage: e.target.value })}
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
};

export default ChatWindow;
