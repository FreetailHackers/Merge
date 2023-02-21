import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { logoutUser, setCurrentUser } from "../actions/authActions";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import ChatMissing from "../components/ChatsMissing";
import PropTypes from "prop-types";
import io from "socket.io-client";
import "./Chat.css";

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeChatIndex: 0,
      chats: [],
      messages: [],
      creatingNewChat: false,
      newChatInput: [],
      editingTitle: false,
      titleInput: "",
      userMap: {},
      otherUsers: [],
      blockedByMe: [],
    };
    this.socket = io(process.env.REACT_APP_CHAT_URL, {
      transports: ["websocket"],
    });
  }

  getMessages(index) {
    let chat = this.state.chats[index];
    this.setState({ editingTitle: false, titleInput: chat.name });
    axios
      .get(process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/messages`)
      .then(async (res) => {
        chat.seen = true;
        const messages = res.data;

        // fill in missing profiles (needed if someone leaves the chat)
        const authors = [...new Set(messages.map((message) => message.author))];
        for (const author of authors) {
          if (!(author in chat.profiles)) {
            chat.profiles[author] = this.state.userMap[author];
          }
        }
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

  async componentDidMount() {
    this.socket.emit("new-connection", { userID: this.props.userID.id });
    await axios
      .get(process.env.REACT_APP_API_URL + "/api/users/list", {
        params: {
          start: 0,
          limit: 0,
          filters: {
            _id: this.props.userID.id,
          },
        },
      })
      .then((res) => {
        this.setState({ blockedByMe: res.data[0].blockList });
      });

    axios
      .get(process.env.REACT_APP_API_URL + "/api/users/list")
      .then((res) => {
        this.setState({
          userMap: Object.fromEntries(
            res.data.map((i) => [
              i._id,
              { name: i.name, profilePicture: i.profile[0]?.profilePictureUrl },
            ])
          ),
          otherUsers: [
            ...res.data.filter(
              (user) => user._id && user._id !== this.props.userID.id
            ),
          ],
        });
      })
      .then(() => {
        axios
          .get(process.env.REACT_APP_API_URL + "/api/chats")
          .then(async (res) => {
            for (const chat of res.data) {
              // join websocket room
              this.socket.emit("join-room", { id: chat._id });
              chat.profiles = Object.fromEntries(
                chat.users.map((id) => [id, this.state.userMap[id]])
              );
              chat.seen = chat.readBy.includes(this.props.userID.id);
            }
            this.setState({ chats: res.data });
            if (res.data.length > 0) {
              this.getMessages(0);
            }
          })
          .then(() => {
            if (this.props.location.data) {
              this.setState(
                { newChatInput: this.props.location.data },
                this.createChat
              );
              this.props.location.data = null;
            }
          });
      });

    this.socket.on("broadcast-message", this.broadcastMessageWS);
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
    this.socket.on("chat-deleted", (deletedChat) => {
      this.removeChatFromClient(deletedChat);
    });
    this.socket.on("user-left", this.userLeftWS);
    this.socket.on("blocked-by", this.blockedWS);
  }

  broadcastMessageWS = (data) => {
    if (this.state.blockedByMe.includes(data.author)) return;
    this.setState({ messages: [...this.state.messages, data] });
    let chatIndex = this.state.chats.map((e) => e._id).indexOf(data.chat);
    const chat = this.state.chats[chatIndex];
    if (chatIndex !== this.state.activeChatIndex) {
      chat.seen = false;
    } else {
      axios.post(process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/read`);
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
            .scrollTo(0, document.getElementById("chatScrollBox").scrollHeight);
      }
    );
  };

  userLeftWS = (data) => {
    if (data.user === this.props.userID.id) {
      this.removeChatFromClient(
        this.state.chats.find((chat) => chat._id === data.chatID)
      );
    } else {
      let chatIndex = this.state.chats.map((e) => e._id).indexOf(data.chatID);
      if (chatIndex >= 0) {
        let chat = this.state.chats[chatIndex];
        chat.users = [...chat.users.filter((user) => user !== data.user)];
        this.setState({ chats: this.chatStateCopy(chat, false, chatIndex) });
      }
    }
  };

  blockedWS = (data) => {
    let index = this.state.otherUsers.findIndex((u) => u._id === data.userID);
    if (index > -1) {
      let newUserObj = { ...this.state.otherUsers[index] };
      newUserObj.blockList.push(this.props.userID.id);
      let newOthUsers = [
        ...this.state.otherUsers.slice(0, index),
        newUserObj,
        ...this.state.otherUsers.slice(index + 1),
      ];
      this.setState({ otherUsers: newOthUsers });
    }
  };

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
        this.socket.emit("new-message", message);
        chat.lastMessage = res.data;
        const chatStateCopy = [...this.state.chats];
        chatStateCopy.splice(this.state.activeChatIndex, 1);
        this.setState({ activeChatIndex: 0, chats: [chat, ...chatStateCopy] });
      });
  };

  async createChat() {
    const users = this.state.newChatInput;
    for (const user of users) {
      if (!(user in this.state.userMap)) {
        const { data } = await axios.get(
          process.env.REACT_APP_API_URL + "/api/users/" + user
        );
        const profile = {
          name: data.name,
          profilePicture: data.profile[0]?.profilePictureUrl,
        };
        let newUserMap = { ...this.state.userMap };
        newUserMap[user] = profile;
        this.setState({ userMap: newUserMap });
      }
    }
    axios
      .post(process.env.REACT_APP_API_URL + `/api/chats/new`)
      .then(async (res) => {
        let chat = res.data;
        chat.seen = true;
        chat.users = [...chat.users, ...users];
        for (const user of users) {
          axios.post(
            process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/add`,
            { user }
          );
        }
        chat.profiles = Object.fromEntries(
          chat.users.map((id) => [id, this.state.userMap[id]])
        );
        chat.lastMessage = null;
        this.socket.emit("create-room", {
          _id: chat._id,
          otherUsers: users,
          chat: chat,
        });
        this.setState({
          chats: [...this.state.chats, chat],
          newChatInput: [],
          creatingNewChat: false,
          activeChatIndex: this.state.chats.length,
        });
      });
  }

  addUsers(newUserIDs) {
    const chat = this.state.chats[this.state.activeChatIndex];
    for (const user of newUserIDs) {
      axios
        .post(process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/add`, {
          user,
        })
        .then(() => {
          chat.profiles[user] = this.state.userMap[user];
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

  removeChatFromClient(deletedChat) {
    const newChats = [...this.state.chats].filter(
      (chat) => chat._id !== deletedChat._id
    );
    const chatIndex = this.state.chats
      .map((chat) => chat._id)
      .indexOf(deletedChat._id);
    let newIndex = this.state.activeChatIndex;
    if (
      chatIndex < this.state.activeChatIndex ||
      (newIndex === newChats.length && newChats.length > 0)
    ) {
      newIndex--;
    }
    this.setState({ activeChatIndex: newIndex, chats: newChats });
    if (newChats.length > 0) {
      this.getMessages(newIndex);
    }
  }

  deleteChat() {
    const deletedChat = this.state.chats[this.state.activeChatIndex];
    axios
      .post(
        process.env.REACT_APP_API_URL + `/api/chats/${deletedChat._id}/delete`
      )
      .then(() => {
        this.socket.emit("delete-chat", deletedChat);
        this.removeChatFromClient(deletedChat);
      });
  }

  leaveChat() {
    const deletedChat = this.state.chats[this.state.activeChatIndex];
    axios
      .post(
        process.env.REACT_APP_API_URL + `/api/chats/${deletedChat._id}/remove`,
        { user: this.props.userID.id }
      )
      .then(() => {
        this.socket.emit("leave-chat", {
          chatID: deletedChat._id,
          user: this.props.userID.id,
        });
        this.removeChatFromClient(deletedChat);
      });
  }

  blockUsers(users) {
    this.setState({
      blockedByMe: [...new Set([...this.state.blockedByMe, ...users])],
    });
    this.socket.emit("block-users", { users });
  }

  render() {
    return (
      <div style={{ display: "flex", width: "100%" }}>
        <ChatSidebar
          chats={this.state.chats}
          changeChat={this.getMessages.bind(this)}
          activeChatIndex={this.state.activeChatIndex}
          createChat={this.createChat.bind(this)}
          creatingNewChat={this.state.creatingNewChat}
          setCreatingNewChat={(val) => this.setState({ creatingNewChat: val })}
          newChatInput={this.state.newChatInput}
          updateNewChatInput={(values) => {
            this.setState({ newChatInput: values });
          }}
          otherUsers={this.state.otherUsers.filter(
            (user) =>
              !this.state.blockedByMe.includes(user._id) &&
              !user.blockList.includes(this.props.userID.id)
          )}
        />
        {this.state.chats.length === 0 ? (
          <ChatMissing />
        ) : (
          <ChatWindow
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
                  ) &&
                  !this.state.blockedByMe.includes(user._id) &&
                  !user.blockList.includes(this.props.userID.id)
              )
            }
            chat={this.state.chats[this.state.activeChatIndex]}
            deleteChat={this.deleteChat.bind(this)}
            leaveChat={this.leaveChat.bind(this)}
            blockedByMe={this.state.blockedByMe}
            blockUsers={this.blockUsers.bind(this)}
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
  location: PropTypes.object,
};

export default connect(mapStateToProps, { logoutUser, setCurrentUser })(Chat);
