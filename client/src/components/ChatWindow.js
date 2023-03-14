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
  kickChecked: false,
  leavingDeleting: false,
};

class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.state = { ...defaultState };
  }

  componentDidMount() {
    this.props.getMessages();
  }

  componentDidUpdate(prevProps) {
    if (
      (!prevProps.chat && this.props.chat) ||
      (prevProps.chat &&
        this.props.chat &&
        prevProps.chat._id !== this.props.chat._id)
    ) {
      this.setState({ ...defaultState });
      this.props.getMessages();
    }
    if (
      (!prevProps.messages && this.props.messages) ||
      (prevProps.messages &&
        this.props.messages &&
        prevProps.messages[prevProps.messages.length - 1] !==
          this.props.messages[this.props.messages.length - 1])
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
    this.setState({ reportPressed: true, newUserIDs: [], addingUsers: false });
    this.props.setEditingTitle(false);
  };

  submitReport = async () => {
    if (this.state.reportChecked) {
      const contents = document.getElementById("reason").value;
      for (const user of this.state.newUserIDs) {
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
    if (this.state.blockChecked) {
      const allBlocked = this.state.newUserIDs.every((e) =>
        this.props.blockedByMe.includes(e)
      );
      const allNotBlocked = this.state.newUserIDs.every(
        (e) => !this.props.blockedByMe.includes(e)
      );
      if (allBlocked || allNotBlocked) {
        for (const user of this.state.newUserIDs) {
          axios.post(
            process.env.REACT_APP_API_URL +
              "/api/users/" +
              user +
              `/${allBlocked ? "un" : ""}block`,
            { userID: this.props.selfID }
          );
        }
        if (allBlocked) {
          this.props.unblockUsers(this.state.newUserIDs);
        } else {
          this.props.blockUsers(this.state.newUserIDs);
        }
      }
    }

    if (
      this.state.kickChecked &&
      this.state.newUserIDs.every((e) => this.props.chat.users.includes(e))
    ) {
      await axios.post(
        process.env.REACT_APP_API_URL +
          `/api/chats/${this.props.chat._id}/remove`,
        { users: this.state.newUserIDs }
      );
      this.props.kickUsers(this.state.newUserIDs, this.props.chat._id);
    }

    this.setState({
      reportPressed: false,
      newUserIDs: [],
      reportChecked: false,
      blockChecked: false,
      kickChecked: false,
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
              onClick={() => {
                if (!this.state.addingUsers && !this.state.reportPressed) {
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
              this.props.chat.users.length < 5 &&
              (!this.state.addingUsers || this.state.newUserIDs.length > 0) && (
                <button
                  className="themeButton"
                  onClick={() => {
                    if (this.state.addingUsers) {
                      this.props.addUsers(this.state.newUserIDs);
                      this.setState({ newUserIDs: [], addingUsers: false });
                    } else {
                      this.setState({ addingUsers: true });
                      this.props.setEditingTitle(false);
                    }
                  }}
                >
                  Add Users
                </button>
              )}
          </div>
          {this.state.addingUsers && (
            <MultiSelect
              style={{ width: "100%" }}
              value={this.state.newUserIDs}
              onChange={(values) =>
                this.setState({
                  newUserIDs:
                    values.length + this.props.chat.users.length > 5
                      ? values.slice(
                          0,
                          5 - values.length - this.props.chat.users.length
                        )
                      : values,
                })
              }
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
            Manage Users
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
              this.setState({
                reportPressed: false,
                newUserIDs: [],
                reportChecked: false,
                blockChecked: false,
                kickChecked: false,
              })
            }
          >
            Cancel
          </button>

          <div className="reportWindowUserSelect">
            <h3>Select Users</h3>
            <p style={{ marginTop: 15 }}>
              {this.props.chat.profiles[this.props.selfID].name} (you)
            </p>
            {this.props.chat &&
              this.props.chat.profiles &&
              Object.entries(this.props.chat.profiles)
                .filter((entry) => entry[0] !== this.props.selfID)
                .map((entry, i) => (
                  <div key={i}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (this.state.newUserIDs.includes(entry[0])) {
                          this.setState({
                            newUserIDs: [
                              ...this.state.newUserIDs.filter(
                                (id) => id !== entry[0]
                              ),
                            ],
                          });
                        } else {
                          this.setState({
                            newUserIDs: [...this.state.newUserIDs, entry[0]],
                          });
                        }
                      }}
                      checked={this.state.newUserIDs.includes(entry[0])}
                    />
                    <p>
                      {entry[1].name}{" "}
                      {!this.props.chat.users.includes(entry[0]) &&
                        "(not present)"}
                      {this.props.blockedByMe.includes(entry[0]) && "(blocked)"}
                    </p>
                  </div>
                ))}
          </div>

          {this.state.newUserIDs.length > 0 && (
            <div className="reportWindowCheckbox">
              {(this.state.newUserIDs.every((e) =>
                this.props.blockedByMe.includes(e)
              ) ||
                this.state.newUserIDs.every(
                  (e) => !this.props.blockedByMe.includes(e)
                )) && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginRight: "15%",
                  }}
                >
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      this.setState({ blockChecked: e.target.checked })
                    }
                    checked={this.state.blockChecked}
                  />
                  <p>
                    {this.state.newUserIDs.every((e) =>
                      this.props.blockedByMe.includes(e)
                    )
                      ? "Unblock"
                      : "Block"}{" "}
                    users?
                  </p>
                </div>
              )}
              {this.props.chat.owner === this.props.selfID &&
                this.state.newUserIDs.every((e) =>
                  this.props.chat.users.includes(e)
                ) && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      marginRight: "15%",
                    }}
                  >
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        this.setState({ kickChecked: e.target.checked })
                      }
                      checked={this.state.kickChecked}
                    />
                    <p>Remove users?</p>
                  </div>
                )}
              <input
                type="checkbox"
                onChange={(e) =>
                  this.setState({ reportChecked: e.target.checked })
                }
                checked={this.state.reportChecked}
              />
              <p>Report users?</p>
            </div>
          )}

          {this.state.reportChecked && (
            <textarea id="reason" placeholder="Reason for reporting" />
          )}
          {this.state.newUserIDs.length > 0 &&
            (this.state.blockChecked ||
              this.state.reportChecked ||
              (this.state.kickChecked &&
                this.state.newUserIDs.every((e) =>
                  this.props.chat.users.includes(e)
                ))) && (
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
  blockUsers: PropTypes.func,
  unblockUsers: PropTypes.func,
  blockedByMe: PropTypes.array,
  kickUsers: PropTypes.func,
};

export default ChatWindow;
