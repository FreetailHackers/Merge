

module.exports = {

   addMessageRoutes (socket) {
      //Put query
      const mongoose = require("mongoose");
      const ChatSchema = require('../models/Chat');
      const mongoURI = require("../config/keys.secret").mongoURI;

      mongoose.connect(mongoURI, { useNewUrlParser: true }).then(() => {
         console.log("MongoDB successfully connected")
      }).catch(err => console.log(err));

      socket.on('send message', async (data) => {
         console.log("Recieved Message")
         const parsed = JSON.parse(data);
         const chatId = parsed.chatId;
         const fromUser = parsed.fromUser;
         const incomingMessage = parsed.message;
         // // chatId = 1
         // // fromUser = "11"
         // const incomingMessage = "Hello Raffer"
         var Chat = mongoose.model("chat", ChatSchema, "chats");
         Chat.findByIdAndUpdate(
            chatId,
            {$push: {"messages": {fromUserID: fromUser, message: incomingMessage, data: Date.now()}}},
            {safe: true, upsert: true},
            function(err, model) {
               if(err) console.log(err);
           }
         )
      });
   

   socket.on('request messages', async (data) => {
      console.log("Requesting Messages")
      const parsed = JSON.parse(data);
      const userId = socket._connectedUserId;
      const msgPerPage = 25;  //Change as needed
      // const chatId = parsed.chatID;
      // const page = parsed.page;
      const chatId = 0
      const page = 0
      var Chat = mongoose.model("chat", ChatSchema, "chats");
      var messages = []
      var userIds = []
      Chat.findOne({_id: chatId}, "messages userIds", (err, chat) => {
         if(err) return console.log(err);
         console.log("%s", chat.messages[0].message)
         messages = chat.messages
         userIds = chat.userIds
         console.log(messages[0])
      })
   });

   socket.emit('messages', () => {
      JSON.stringify({chatMessage: chat.messages})
      
   });

   console.log('Added message routes');
}

}
