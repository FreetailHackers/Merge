const Message = require('../models/message');

module.exports = {

addMessageRoutes (socket) {
   socket.on('send message', data => {
      const parsed = JSON.parse(data);
      const fromUserId = socket._connectedUserId;
      const toUserId = parsed.toUserId;

      // TODO change from original Message chat db to Chat based db
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

      // TODO change from original Message chat db to Chat based db
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
            messages: JSON.stringify(messages)
         });
      });
   });

   console.log('Added message routes');
}

}
