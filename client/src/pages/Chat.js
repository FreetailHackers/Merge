import React, { Component } from 'react';
import io from 'socket.io-client';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import ChatMissing from "../components/ChatsMissing";

const filterOutSelfFromChat = (chat) => {
   const chatCopy = JSON.parse(JSON.stringify(chat));
   const selfId = "0"; // todo: get this from redux
   const selfIndexInChat = chat.userIds.indexOf(selfId);
   chatCopy.userIds.splice(selfIndexInChat, 1);
   chatCopy.userNames.splice(selfIndexInChat, 1);
   chatCopy.userImages.splice(selfIndexInChat, 1);
   return chatCopy;
}

const getIdToProfileMap = (chats) => {
   const profiles = {};
   for (const chat of chats) {
      for (const key in chat.userIds) {
         profiles[chat.userIds[key]] = {
            image: chat.userImages[key],
            name: chat.userNames[key]
         }
      }
   }
   return profiles;
}
var socket = io("http://localhost:5001", { transports: ["websocket"] });
class Chat extends Component {
   constructor (props) {
      super(props);
      const tempMessages = [
         // temp data while socketio team works
         {
            _id: "0",
            userIds: ["1", "0"],
            userNames: ["Raffer", "Ben"],
            userImages: ["https://www.animalspot.net/wp-content/uploads/2017/03/Chinstrap-Penguin.jpg", "https://th.bing.com/th/id/Rbb7e9c68670b8fde1ad6d3d25650b8fa?rik=29F1dKYOdJDuwg&riu=http%3a%2f%2f4.bp.blogspot.com%2f-BfVzqdb71vY%2fTmxNj_ILPrI%2fAAAAAAAAA4A%2fXgJvH2HN_-4%2fs1600%2fpenguin_1.jpg&ehk=UkBnTpiw5MJu1e9zoszx0kjQsIMOGqFTGIiQq3j2ZBA%3d&risl=&pid=ImgRaw"],
            messages: [{
               fromUserId: "1",
               message: "Hello, world!",
               date: (new Date() - 1000 * 60 * 60 * 4.3),
               seen: false
            },
            {
               fromUserId: "0",
               message: "Hi!",
               date: (new Date() - 1000 * 60 * 60 * 4.4),
               seen: false
            },
            {
               fromUserId: "0",
               message: "Tilo is Awesome!",
               date: (new Date() - 1000 * 60 * 60 * 4.4),
               seen: false
            }]
         },
         {
            _id: "1",
            userIds: ["2", "0"],
            userNames: ["Jason", "Ben"],
            userImages: ["https://th.bing.com/th/id/Rd9accff7c37684e159f050d299998c7b?rik=KPh19WNdTrp3yw&riu=http%3a%2f%2fweknowyourdreams.com%2fimages%2fpenguin%2fpenguin-12.jpg&ehk=GOxVirbOiTqX4u20wBBKB8fW9Kjt3N1ht1vKGt9O58A%3d&risl=&pid=ImgRaw", "https://th.bing.com/th/id/Rbb7e9c68670b8fde1ad6d3d25650b8fa?rik=29F1dKYOdJDuwg&riu=http%3a%2f%2f4.bp.blogspot.com%2f-BfVzqdb71vY%2fTmxNj_ILPrI%2fAAAAAAAAA4A%2fXgJvH2HN_-4%2fs1600%2fpenguin_1.jpg&ehk=UkBnTpiw5MJu1e9zoszx0kjQsIMOGqFTGIiQq3j2ZBA%3d&risl=&pid=ImgRaw"],
            messages: [{
               fromUserId: "2",
               message: "Hey!",
               date: (new Date() - 1000 * 60 * 60 * 4.5),
               seen: true
            },
            {
               fromUserId: "0",
               message: "Hi!",
               date: (new Date() - 1000 * 60 * 60 * 4.8),
               seen: true
            },
            {
               fromUserId: "0",
               message: "According to all known laws of aviation, there is no way a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway because bees don't care what humans think is impossible.",
               date: (new Date() - 1000 * 60 * 60 * 5.1),
               seen: true
            },
            {
               fromUserId: "0",
               message: "Hi 3!",
               date: (new Date() - 1000 * 60 * 60 * 5.2),
               seen: true
            },
            {
               fromUserId: "2",
               message: "Hi 4!",
               date: (new Date() - 1000 * 60 * 60 * 5.4),
               seen: true
            },
            {
               fromUserId: "2",
               message: "According to all known laws of aviation, there is no way a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway because bees don't care what humans think is impossible.",
               date: (new Date() - 1000 * 60 * 60 * 5.5),
               seen: true
            }]
         },
         {
            _id: "2",
            userIds: ["0", "4"],
            userNames: ["Ben", "Ryan"],
            userImages: ["https://th.bing.com/th/id/Rbb7e9c68670b8fde1ad6d3d25650b8fa?rik=29F1dKYOdJDuwg&riu=http%3a%2f%2f4.bp.blogspot.com%2f-BfVzqdb71vY%2fTmxNj_ILPrI%2fAAAAAAAAA4A%2fXgJvH2HN_-4%2fs1600%2fpenguin_1.jpg&ehk=UkBnTpiw5MJu1e9zoszx0kjQsIMOGqFTGIiQq3j2ZBA%3d&risl=&pid=ImgRaw", "https://artprojectsforkids.org/wp-content/uploads/2019/08/Penguin-Easy-1.jpg"],
            messages: [{
               fromUserId: "0",
               message: "Penguins are pretty cool, do you like penguins?",
               date: (new Date() - 1000 * 60 * 60 * 4.7),
               seen: false
            },
            {
               fromUserId: "0",
               message: "Hi!",
               date: (new Date() - 1000 * 60 * 60 * 4.9),
               seen: false
            }]
         }
      ]
      const tempMessages1 = []
      this.state = {
         activeChatIndex: 0,
         chats: tempMessages
      };
   }
   
   componentDidMount () {
      // load previous chats into left bar
      console.log('connecting to socket');
      socket.on("connect", () => {
         console.log(socket.id); // x8WIv7-mJelg7on_ALbx
       });
      socket.on('connect_error', function(err) {
         console.log("client connect_error: ", err);
      });
      
      socket.on('connect_timeout', function(err) {
         console.log("client connect_timeout: ", err);
      });
      console.log("check 1 ", socket.connected)
      socket.on('chats', data => {
         console.log('chats', data);
         this.setState({
            chats: JSON.parse(data),
            profiles: getIdToProfileMap(JSON.parse(data))
         });
      });

      this.setState({
         profiles: getIdToProfileMap(this.state.chats)
      })
   }

   componentWillUnmount () {
      console.log('disconnecting from socket');
      socket.on("disconnect", () => {
         console.log(socket.id); // undefined
       });
      socket.disconnect();
   }

   getMessages() {
      const activeChat = this.state.chats[this.state.activeChatIndex];
      socket.emit('request messages', JSON.stringify({
         chatId: activeChat._id,
         page: 1
      }))
      socket.on('messages', (data) => {
            console.log(data)
            console.log("in messages")
            const parsed = JSON.parse(data)
            const messages = parsed.chatMessages
            console.log(messages)
            return messages
      })
   }

   sendMessage = (message) => {
      // push one more message onto chat document
      console.log(message)
      const activeChat = this.state.chats[this.state.activeChatIndex];
      console.log(activeChat._id)

      var messages = {
         fromUserId: "0",
         message: message,
         date: (new Date() - 1000 * 60 * 60 * 4.3),
         seen: false
      }
      this.state.chats[0].messages.push(messages)

      socket.emit('send message', JSON.stringify({
         chatId: activeChat._id,
         userId: "10",
         message: message
      }));
   }

  

   render() {
      if (this.state.chats.length === 0) {
         return <div style={{display: 'flex', width: '100%'}}>
            <ChatMissing/>
         </div>;
      }
      return <div style={{ display: 'flex', width: '100%' }}>
         <ChatSidebar chats={this.state.chats.map(chat => filterOutSelfFromChat(chat))} setActiveChatIndex={(i) => this.setState({ activeChatIndex: i })} activeChatIndex={this.state.activeChatIndex} />
         <ChatWindow profiles={this.state.profiles || []} chat={this.state.chats[this.state.activeChatIndex]} sendMessage={this.sendMessage} />
      </div>
   }
}

export default Chat;
