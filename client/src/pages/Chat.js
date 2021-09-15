import React, { Component } from 'react';
import socket from 'socket.io-client';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';

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

class Chat extends Component {
   constructor (props) {
      super(props);

      this.state = {
         activeChatIndex: 0,
         chats: [
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
      };
   }

   componentDidMount () {
      console.log('connecting to socket');
      this.socket = socket('http://localhost:5001');
      this.socket.on('chats', data => {
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
      this.socket.disconnect();
   }

   sendMessage = (message) => {
      const activeChat = this.state.chats[this.state.activeChatIndex];
      this.socket.emit('send message', JSON.stringify({
         chatId: activeChat._id,
         message
      }));
   }

   render = () => (
      <div style={{ display: 'flex', width: '100%' }}>
         <ChatSidebar chats={this.state.chats.map(chat => filterOutSelfFromChat(chat))} setActiveChatIndex={(i) => this.setState({ activeChatIndex: i })} activeChatIndex={this.state.activeChatIndex} />
         <ChatWindow profiles={this.state.profiles || []} chat={this.state.chats[this.state.activeChatIndex]} sendMessage={this.sendMessage} />
      </div>
   )
}

export default Chat;
