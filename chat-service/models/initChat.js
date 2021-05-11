 
import { v4 as uuidv4 } from 'uuid';

const { db } = require('./chat');
const Chat = require('./chat');

module.exports = {

addMessageRoutes (socket) {
   //Make a chat?
   socket.on('create chat', data => {
      const parsed = JSON.parse(data);
      // const thisChatId = uuidv4();
      const theseUsers = parsed.users;
      const message = new Chat({
         _id = ObjectId(),
         chatID: thisChatID,
         userIds = theseUsers,
         messages: null
      });
      message.save();
      return _id;
   });

   //TODO: (4/29/21: 7:33pm)
   //Implement Adduser, removeUser, deleteChat






   //delte a chat
   socket.on('request messages', data => {
      const msgPerPage = 25;  //Change as needed
      const parsed = JSON.parse(data);
      const chatId = parsed.chatID;
      const page = parsed.page;
      const chat = db.chats.find({_id : chatId})
      const messagesOut = [];
      for(i = chat.messages.size - ((page + 1) * msgPerpage); i < chat.messages.size - (pages* msgPerpage); i++){
         messagesOut.add(chat.messages[i]);
      }
      // socket.emit("messages")
      socket.broadcast.to(socketid).emit('message', messagesOut);
   });

   console.log('Added message routes');
}

}