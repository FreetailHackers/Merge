import React, { Component } from "react";
import axios from "axios";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import ChatMissing from "../components/ChatsMissing";
import PropTypes from "prop-types";
import io from "socket.io-client";
import "./Chat.css";
import {
  createRoom,
  newMessage,
  listenForNewMessages,
  readMessage,
  addUser,
  // blockUsers,
  // unblockUsers,
  renameRoom,
  leaveRoom,
  // removeUsers,
  deleteRoom,
  listenForRoomAdditions,
  listenForRoomDeletions,
  // listenForUserAdditions,
  // listenForUserRemovals,
  // listenForNameChanges,
} from "../utils/firebase";

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
      displayWindow: false,
    };
    this.socket = io(process.env.REACT_APP_CHAT_URL, {
      transports: ["websocket"],
      query: { token: localStorage.jwtToken },
    });
  }

  // getMessages(index, newChats = null) {
  //   let chat = newChats ? newChats[index] : this.state.chats[index];
  //   this.setState({ editingTitle: false, titleInput: chat.name });
  //   axios
  //     .get(process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/messages`)
  //     .then(async (res) => {
  //       chat.seen = true;
  //       const messages = res.data;

  //       // fill in missing profiles (needed if someone leaves the chat)
  //       const authors = [...new Set(messages.map((message) => message.author))];
  //       for (const author of authors) {
  //         if (!(author in chat.profiles)) {
  //           chat.profiles[author] = this.state.userMap[author];
  //         }
  //       }
  //       this.setState({
  //         chats: this.chatStateCopy(chat, false, index),
  //         activeChatIndex: index,
  //         messages: res.data,
  //       });
  //     });
  //   document.getElementById("newMessageInput") &&
  //     document.getElementById("newMessageInput").focus();
  // }

  async componentDidMount() {
    this.socket.emit("new-connection", { userID: this.props.userID });
    await axios
      .get(process.env.REACT_APP_API_URL + "/api/users/list", {
        params: {
          start: 0,
          limit: 0,
          id: this.props.userID,
          filters: {
            _id: this.props.userID,
          },
        },
      })
      .then((res) => {
        this.setState({ blockedByMe: res.data[0].blockList });
      });

    let userMap;
    await axios
      .get(process.env.REACT_APP_API_URL + "/api/users/list", {
        params: {
          id: this.props.userID,
        },
      })
      .then((res) => {
        userMap = Object.fromEntries(
          res.data.map((i) => [
            i._id,
            {
              name: i.name,
              profilePicture: i.profile[0]?.profilePictureUrl,
            },
          ])
        );
        this.setState({
          userMap: userMap,
          otherUsers: [
            ...res.data.filter(
              (user) => user._id && user._id !== this.props.userID
            ),
          ],
        });
      });

    this.detachRoomDeletionsListener = listenForRoomDeletions(
      this.props.userID,
      (room) => {
        // console.log("removed room", room);
      }
    );
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
    this.socket.on("removed-from", (data) => {
      const index = this.state.chats.findIndex((e) => e._id === data.chatID);
      if (index >= 0) {
        this.removeChatFromClient(this.state.chats[index]);
      }
    });
    this.socket.on("blocked-by", (data) => this.blockedWS(data, true));
    this.socket.on("unblocked-by", (data) => this.blockedWS(data, false));
    this.detachRoomAdditionsListener = listenForRoomAdditions(
      this.props.userID,
      (data) => {
        data.seen = data.readBy.includes(this.props.userID);
        data.lastMessage = null;
        data.profiles = Object.fromEntries(
          data.users.map((id) => [id, userMap[id]])
        );
        data.detachNewMessagesListener = listenForNewMessages(
          { roomId: data._id, userId: this.props.userID },
          (message) => {
            this.broadcastMessageWS(message);
          }
        );
        this.setState((prevState) => {
          return { chats: [...prevState.chats, data] };
        });
      }
    );
  }

  broadcastMessageWS = (data) => {
    this.setState({ messages: [...this.state.messages, data] });
    let chatIndex = this.state.chats.map((e) => e._id).indexOf(data.chat);
    const chat = this.state.chats[chatIndex];
    if (chatIndex !== this.state.activeChatIndex) {
      chat.seen = false;
    } else {
      readMessage(data.chat, this.props.userID);
    }
    if (!this.state.blockedByMe.includes(data.author)) {
      chat.lastMessage = data;
    }
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
    this.setState({
      chats: chatStateCopy,
      activeChatIndex: newActiveChatIndex,
    });
  };

  userLeftWS = (data) => {
    if (data.user === this.props.userID) {
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

  blockedWS = (data, blocked) => {
    let index = this.state.otherUsers.findIndex((u) => u._id === data.userID);
    if (index > -1) {
      let newUserObj = { ...this.state.otherUsers[index] };
      if (blocked) {
        newUserObj.blockList.push(this.props.userID);
      } else {
        newUserObj.blockList = [
          ...newUserObj.blockList.filter((e) => e !== this.props.userID),
        ];
      }
      let newOthUsers = [
        ...this.state.otherUsers.slice(0, index),
        newUserObj,
        ...this.state.otherUsers.slice(index + 1),
      ];
      this.setState({ otherUsers: newOthUsers });
    }
  };

  componentWillUnmount() {
    this.socket.disconnect({ userID: this.props.userID });
    this.detachRoomAdditionsListener();
    this.detachRoomDeletionsListener();
  }

  sendMessage = (contents) => {
    if (contents === "") return;
    const chat = this.state.chats[this.state.activeChatIndex];
    const message = {
      author: this.props.userID,
      contents: contents,
      recipients: chat.users,
      timestamp: new Date().toISOString(),
    };
    this.setState({ messages: [...this.state.messages, message] });
    newMessage(chat._id, message);
    message.chat = chat._id;
    chat.lastMessage = message;
    const chatStateCopy = [...this.state.chats];
    chatStateCopy.splice(this.state.activeChatIndex, 1);
    this.setState({ activeChatIndex: 0, chats: [chat, ...chatStateCopy] });
  };

  async createChat(users) {
    if (users.length > 5) return;
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
    users.push(this.props.userID);
    let chat = {
      users: users,
      owner: this.props.userID,
      name: "",
      readBy: [this.props.userID],
    };
    createRoom(chat);
    chat.profiles = Object.fromEntries(
      chat.users.map((id) => [id, this.state.userMap[id]])
    );
    chat.lastMessage = null;
    console.log(chat);

    this.setState({
      chats: [...this.state.chats, chat],
      newChatInput: [],
      creatingNewChat: false,
      activeChatIndex: this.state.chats.length,
    });
    if (this.props.swipedUser) {
      this.props.setSwipedUser(null);
    }
    // axios
    //   .post(process.env.REACT_APP_API_URL + `/api/chats/new`)
    //   .then(async (res) => {
    //     let chat = res.data;
    //     chat.users = [...chat.users, ...users];
    //     createRoom({
    //       chatId: chat._id,
    //       users: users,
    //       name: chat.name,
    //       owner: chat.owner,
    //     });
    // this.socket.emit("create-room", {
    //   _id: chat._id,
    //   otherUsers: users,
    //   chat: chat,
    // });
    //   });
  }

  addUsers(newUserIDs) {
    const chat = this.state.chats[this.state.activeChatIndex];
    if (chat.users.length + newUserIDs.length > 5) return;
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
          addUser({ roomId: chat._id, userId: user });
          // tell the others!!
        });
    }
  }

  setTitle(newTitle) {
    let chat = this.state.chats[this.state.activeChatIndex];
    // axios
    //   .post(process.env.REACT_APP_API_URL + `/api/chats/${chat._id}/rename`, {
    //     name: newTitle,
    //   })
    //   .then(() => {
    //     chat.name = newTitle;
    //     this.socket.emit("rename-chat", {
    //       chatID: chat._id,
    //       newName: chat.name,
    //     });
    //   });
    renameRoom({ chatId: chat._id, name: newTitle });
    this.setState({ chats: this.chatStateCopy(chat, true, 0) });
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
    deletedChat.detachNewMessagesListener();
    deletedChat.detachUserAdditionsListener();
    deletedChat.detachUserRemovalsListener();
    deletedChat.detachNameChangesListener();

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
  }

  deleteChat() {
    const deletedChat = this.state.chats[this.state.activeChatIndex];
    axios
      .post(
        process.env.REACT_APP_API_URL + `/api/chats/${deletedChat._id}/delete`
      )
      .then(() => {
        this.socket.emit("delete-chat", deletedChat);
        deleteRoom(deletedChat._id);
        this.removeChatFromClient(deletedChat);
      });
  }

  async kickUsers(users, chatID) {
    await axios.post(
      process.env.REACT_APP_API_URL + `/api/chats/${chatID}/remove`,
      { users }
    );
    this.socket.emit("remove-users", {
      chatID: chatID,
      users: users,
    });
    for (const user of users) {
      this.userLeftWS({ user: user, chatID: chatID });
    }
  }

  leaveChat(chatIndex) {
    const leftChat = this.state.chats[chatIndex];
    axios
      .post(process.env.REACT_APP_API_URL + `/api/chats/${leftChat._id}/leave`)
      .then(() => {
        this.socket.emit("leave-chat", {
          chatID: leftChat._id,
          user: this.props.userID,
        });
        leaveRoom({ roomId: leftChat._id, userId: this.props.userID });
        this.removeChatFromClient(leftChat);
      });
  }

  async blockUnblockUsers(blocking, unblocking) {
    for (const user of blocking) {
      await axios.post(
        process.env.REACT_APP_API_URL + "/api/users/" + user + "/block",
        { userID: this.props.userID }
      );
    }
    if (blocking.length > 0) {
      this.socket.emit("block-users", { users: blocking });
    }
    for (const user of unblocking) {
      await axios.post(
        process.env.REACT_APP_API_URL + "/api/users/" + user + "/unblock",
        { userID: this.props.userID }
      );
    }
    if (unblocking.length > 0) {
      this.socket.emit("unblock-users", { users: unblocking });
    }
    this.setState({
      blockedByMe: [
        ...[...new Set([...this.state.blockedByMe, ...blocking])].filter(
          (u) => !unblocking.includes(u)
        ),
      ],
    });
  }

  render() {
    return (
      <div className="chat">
        {(this.props.wideScreen || !this.state.displayWindow) && (
          <ChatSidebar
            chats={this.state.chats}
            changeChat={(i) =>
              this.setState({ activeChatIndex: i, displayWindow: true })
            }
            activeChatIndex={this.state.activeChatIndex}
            createChat={() => this.createChat(this.state.newChatInput)}
            creatingNewChat={this.state.creatingNewChat}
            setCreatingNewChat={(val) =>
              this.setState({ creatingNewChat: val })
            }
            flipDisplaySidebar={this.props.flipDisplaySidebar}
            wideScreen={this.props.wideScreen}
            newChatInput={this.state.newChatInput}
            updateNewChatInput={(values) => {
              this.setState({ newChatInput: values });
            }}
            otherUsers={this.state.otherUsers.filter(
              (user) =>
                !this.state.blockedByMe.includes(user._id) &&
                !user.blockList.includes(this.props.userID)
            )}
            selfID={this.props.userID}
          />
        )}
        {(this.props.wideScreen || this.state.displayWindow) &&
          (this.state.chats.length === 0 ? (
            <ChatMissing
              flipDisplaySidebar={() => this.setState({ displayWindow: false })}
              wideScreen={this.props.wideScreen}
            />
          ) : (
            <ChatWindow
              messages={this.state.messages.filter(
                (message) =>
                  message.chat ===
                  this.state.chats[this.state.activeChatIndex]._id
              )}
              getMessages={() => this.getMessages(this.state.activeChatIndex)}
              sendMessage={this.sendMessage}
              selfID={this.props.userID}
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
                    !this.state.chats[
                      this.state.activeChatIndex
                    ].users.includes(user._id) &&
                    !this.state.blockedByMe.includes(user._id) &&
                    !user.blockList.includes(this.props.userID)
                )
              }
              chat={this.state.chats[this.state.activeChatIndex]}
              deleteChat={this.deleteChat.bind(this)}
              leaveChat={() => this.leaveChat(this.state.activeChatIndex)}
              blockedByMe={this.state.blockedByMe}
              blockUnblockUsers={this.blockUnblockUsers.bind(this)}
              kickUsers={this.kickUsers.bind(this)}
              flipDisplaySidebar={() => this.setState({ displayWindow: false })}
              wideScreen={this.props.wideScreen}
            />
          ))}
      </div>
    );
  }
}

Chat.propTypes = {
  userID: PropTypes.string.isRequired,
  swipedUser: PropTypes.string,
  setSwipedUser: PropTypes.func,
  wideScreen: PropTypes.bool,
  flipDisplaySidebar: PropTypes.func,
};

export default Chat;
