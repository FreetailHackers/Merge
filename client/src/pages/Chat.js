import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { logoutUser, setCurrentUser } from "../actions/authActions";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import ChatMissing from "../components/ChatsMissing";
import PropTypes from "prop-types";
import io from "socket.io-client";

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeChatIndex: 0,
      chats: [],
      messages: [],
      newChatInput: [],
      editingTitle: false,
      titleInput: "",
      otherUsers: [],
    };
    this.socket = io.connect(process.env.REACT_APP_CHAT_URL, {
      transports: ["websocket"],
    });
  }

  getMessages(index) {
    const chat = this.state.chats[index];
    this.setState({ editingTitle: false, titleInput: chat.name });
    axios
      .get(process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/messages`)
      .then((res) => {
        chat.seen = true;
        this.setState(
          {
            chats: this.chatStateCopy(chat, false, index),
            activeChatIndex: index,
            messages: res.data,
          },
          () => {
            document
              .getElementById("chatScrollBox")
              .scrollTo(
                0,
                document.getElementById("chatScrollBox").scrollHeight
              );
          }
        );
      });
    document.getElementById("newMessageInput").focus();
  }

  componentDidMount() {
    axios.get(process.env.REACT_APP_API_URL + "/api/users/list").then((res) => {
      this.setState({
        otherUsers: res.data.filter(
          (user) => user._id && user._id !== this.props.userID.id
        ),
      });
    });
    this.socket.emit("new-connection", { userID: this.props.userID.id });
    axios
      .get(process.env.REACT_APP_API_URL + "/api/chats")
      .then(async (res) => {
        for (const chat of res.data) {
          // join websocket room
          this.socket.emit("join-room", { id: chat._id });

          chat.profiles = {};
          for (const user of chat.users) {
            const { data } = await axios.get(
              process.env.REACT_APP_API_URL + "/api/users/" + user
            );
            chat.profiles[user] = {
              id: data._id,
              name: data.name,
              profilePicture: data.profile[0]?.profilePictureUrl,
            };
          }
          chat.seen = chat.readBy.includes(this.props.userID.id);
        }
        this.setState({ chats: res.data });
        if (res.data.length > 0) {
          this.getMessages(0);
        }
      });

    this.socket.on("broadcast-message", (data) => {
      this.setState({ messages: [...this.state.messages, data] });
      let chatIndex = this.state.chats.map((e) => e._id).indexOf(data.chat);
      const chat = this.state.chats[chatIndex];
      if (chatIndex !== this.state.activeChatIndex) {
        chat.seen = false;
      } else {
        axios.post(
          process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/read`
        );
      }
      chat.lastMessage = data;
      let chatStateCopy = [
        chat,
        ...this.state.chats.slice(0, chatIndex),
        ...this.state.chats.slice(chatIndex + 1, this.state.chats.length),
      ];
      let newActiveChatIndex = this.state.activeChatIndex;
      if (chatIndex === this.state.activeChatIndex) {
        newActiveChatIndex = 0;
      } else if (chatIndex > this.state.activeChatIndex) {
        newActiveChatIndex++;
      }
      this.setState(
        { chats: chatStateCopy, activeChatIndex: newActiveChatIndex },
        () => {
          newActiveChatIndex === 0 &&
            document
              .getElementById("chatScrollBox")
              .scrollTo(
                0,
                document.getElementById("chatScrollBox").scrollHeight
              );
        }
      );
    });
    this.socket.on("added-to-room", async (chat) => {
      chat.seen = false;
      this.socket.emit("join-room", { id: chat._id });
      this.setState({ chats: [...this.state.chats, chat] });
    });
    this.socket.on("new-user-added", async (chat) => {
      let chatIndex = this.state.chats.map((e) => e._id).indexOf(chat._id);
      this.setState({ chats: this.chatStateCopy(chat, false, chatIndex) });
    });
    this.socket.on("chat-renamed", (data) => {
      let chatIndex = this.state.chats.map((e) => e._id).indexOf(data.chatID);
      let chat = this.state.chats[chatIndex];
      chat.name = data.newName;
      this.setState({ chats: this.chatStateCopy(chat, false, chatIndex) });
    });
  }

  componentWillUnmount() {
    this.socket.disconnect({ userID: this.props.userID.id });
  }

  sendMessage = (contents) => {
    if (contents === "") return;
    const chat = this.state.chats[this.state.activeChatIndex];
    const message = {
      author: this.props.userID.id,
      contents: contents,
      chat: chat._id,
      recipients: chat.users,
      timestamp: new Date().toISOString(),
    };
    this.setState({ messages: [...this.state.messages, message] }, () => {
      document
        .getElementById("chatScrollBox")
        .scrollTo(0, document.getElementById("chatScrollBox").scrollHeight);
    });
    axios
      .post(process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/messages`, {
        contents,
      })
      .then((res) => {
        // Update the last message of the chat and move it to the top
        //this.setState({ messages: [...this.state.messages, res.data] });
        this.socket.emit("new-message", message);
        chat.lastMessage = res.data;
        const chatStateCopy = [...this.state.chats];
        chatStateCopy.splice(this.state.activeChatIndex, 1);
        this.setState({ activeChatIndex: 0, chats: [chat, ...chatStateCopy] });
      });
  };

  createChat() {
    const name = "New Chat";
    axios
      .post(process.env.REACT_APP_API_URL + `/api/chats/new`, { name })
      .then(async (res) => {
        let chat = res.data;
        chat.seen = true;
        chat.profiles = {};
        const users = this.state.newChatInput.map((u) => u.trim());
        chat.users = [...chat.users, ...users];

        for (const user of [...users, this.props.userID.id]) {
          axios.post(
            process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/add`,
            { user }
          );
          const { data } = await axios.get(
            process.env.REACT_APP_API_URL + "/api/users/" + user
          );
          chat.profiles[user] = {
            id: data._id,
            name: data.name,
            profilePicture: data.profile[0]
              ? data.profile[0].profilePictureUrl
              : "",
          };
        }
        chat.lastMessage = null;

        this.socket.emit("create-room", {
          _id: chat._id,
          otherUsers: users,
          chat: chat,
        });
        this.setState({ chats: [...this.state.chats, chat], newChatInput: [] });
      });
  }

  addUsers(newUserIDs) {
    const chat = this.state.chats[this.state.activeChatIndex];
    for (const user of newUserIDs) {
      axios
        .post(process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/add`, {
          user,
        })
        .then(async () => {
          const { data } = await axios.get(
            process.env.REACT_APP_API_URL + "/api/users/" + user
          );
          chat.profiles[user] = {
            id: data._id,
            name: data.name,
            profilePicture: data.profile[0]
              ? data.profile[0].profilePictureUrl
              : "",
          };
          chat.users.push(user);
          const chatStateCopy = [...this.state.chats];
          chatStateCopy.splice(this.state.activeChatIndex, 1);
          this.setState({
            activeChatIndex: 0,
            chats: [chat, ...chatStateCopy],
          });
          this.socket.emit("add-user", { userID: user, chat: chat });
          // tell the others!!
        });
    }
  }

  setTitle(newTitle) {
    let chat = this.state.chats[this.state.activeChatIndex];
    axios
      .post(process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/rename`, {
        name: newTitle,
      })
      .then(() => {
        chat.name = newTitle;
        this.setState({ chats: this.chatStateCopy(chat, true, 0) });
        this.socket.emit("rename-chat", {
          chatID: chat._id,
          newName: chat.name,
        });
      });
  }

  chatStateCopy(chat, isActive, index) {
    return isActive
      ? [
          ...this.state.chats.slice(0, this.state.activeChatIndex),
          chat,
          ...this.state.chats.slice(this.state.activeChatIndex + 1),
        ]
      : [
          ...this.state.chats.slice(0, index),
          chat,
          ...this.state.chats.slice(index + 1),
        ];
  }

  render() {
    return (
      <div style={{ display: "flex", width: "100%" }}>
        <ChatSidebar
          chats={this.state.chats}
          changeChat={this.getMessages.bind(this)}
          activeChatIndex={this.state.activeChatIndex}
          createChat={this.createChat.bind(this)}
          newChatInput={this.state.newChatInput}
          updateNewChatInput={(values) => {
            this.setState({ newChatInput: values }, () =>
              console.log(this.state.newChatInput)
            );
          }}
          otherUsers={this.state.otherUsers}
        />
        {this.state.chats.length === 0 ? (
          <ChatMissing />
        ) : (
          <ChatWindow
            profile={this.state.chats[this.state.activeChatIndex].profiles}
            messages={this.state.messages.filter(
              (message) =>
                message.chat ===
                this.state.chats[this.state.activeChatIndex]._id
            )}
            sendMessage={this.sendMessage}
            selfID={this.props.userID.id}
            addUsers={this.addUsers.bind(this)}
            title={this.state.chats[this.state.activeChatIndex].name}
            titleInput={this.state.titleInput}
            editingTitle={this.state.editingTitle}
            setEditingTitle={(editingTitle) =>
              this.setState({ editingTitle: editingTitle })
            }
            setTitleInput={(newTitleInput) =>
              this.setState({ titleInput: newTitleInput })
            }
            setTitle={(newTitle) => this.setTitle(newTitle)}
            otherUsers={
              this.state.otherUsers &&
              this.state.otherUsers.filter(
                (user) =>
                  !this.state.chats[this.state.activeChatIndex].users.includes(
                    user._id
                  )
              )
            }
            chat={this.state.chats[this.state.activeChatIndex]}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userID: state.auth.userID,
});

Chat.propTypes = {
  userID: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, { logoutUser, setCurrentUser })(Chat);
