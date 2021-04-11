const Message = require('../models/message');

module.exports = {

addMessageRoutes (socket) {
   socket.on('send message', data => {
      const parsed = JSON.parse(data);
      const fromUserId = socket._connectedUserId;
      const toUserId = parsed.toUserId;

      const message = new Message({
         fromUserId,
         toUserId,
         message: parsed.message
      });
      
      message.save();
   });

   socket.on('request messages', data => {
      const parsed = JSON.parse(data);
      const userId = socket._connectedUserId;
      const otherUserId = parsed.otherUsedId;

      Message.find({
         $or: [
            {
               fromUserId: userId,
               toUserId: otherUserId
            },
            {
               toUserId: userId,
               fromUserId: otherUserId
            }
         ]
      }).then(messages => {
         socket.emit('messages', {
            messages
         });
      });
   });
}

}
