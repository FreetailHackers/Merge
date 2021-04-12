import React, { Component } from 'react';
import socket from 'socket.io-client';
import ChatSidebar from '../components/ChatSidebar';

import './Chat.css';

const filterOutSelfFromChat = (chat) => {
   const selfId = "0"; // todo: get this from redux
   const selfIndexInChat = chat.userIds.indexOf(selfId);
   chat.userIds.splice(selfIndexInChat, 1);
   chat.userNames.splice(selfIndexInChat, 1);
   chat.userImages.splice(selfIndexInChat, 1);
   return chat;
}

class Chat extends Component {
   constructor (props) {
      super(props);

      this.state = {
         chats: [
            // temp data while socketio team works
            {
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
               }]
            },
            {
               userIds: ["0", "4"],
               userNames: ["Ben", "Ryan"],
               userImages: ["https://th.bing.com/th/id/Rbb7e9c68670b8fde1ad6d3d25650b8fa?rik=29F1dKYOdJDuwg&riu=http%3a%2f%2f4.bp.blogspot.com%2f-BfVzqdb71vY%2fTmxNj_ILPrI%2fAAAAAAAAA4A%2fXgJvH2HN_-4%2fs1600%2fpenguin_1.jpg&ehk=UkBnTpiw5MJu1e9zoszx0kjQsIMOGqFTGIiQq3j2ZBA%3d&risl=&pid=ImgRaw", "https://artprojectsforkids.org/wp-content/uploads/2019/08/Penguin-Easy-1.jpg"],
               messages: [{
                  fromUserId: "0",
                  message: "Penguins are cool",
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
         ].map(chat => filterOutSelfFromChat(chat))
      };
   }

   componentDidMount () {
      console.log('connecting to socket');
      this.socket = socket('http://localhost:5001');
      this.socket.on('chats', data => {
         console.log('chats', data);
         this.setState({
            chats: JSON.parse(data).map(chat => filterOutSelfFromChat(chat))
         });
      });
   }

   componentWillUnmount () {
      console.log('disconnecting from socket');
      this.socket.disconnect();
   }

   render = () => (
      <div>
         <ChatSidebar chats={this.state.chats} />
      </div>
   )
}

export default Chat;
