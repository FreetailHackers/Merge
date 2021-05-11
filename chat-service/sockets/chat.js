const Message = require('../models/Chat');

module.exports = {

//TODO: get previous chats from database
addChatRoutes (socket) {
   socket.on('request chats', (data) => {
      console.log('Got request chats socket message');
      const parsed = JSON.parse(data)
      const userId = socket._connectedUserId;
      const chats = parsed.chatIds
      // TODO change from original Message chat db to Chat based db
      const mongoRequests = chats.map(chat => [
         { "$match": { "userIds": { $has: userId } } },
         { "$sort": { "date": -1 } },
         { "$group": { 
            "_id": {[`${pair[1]}`]: `$${pair[1]}`},
            "otherUserId": { "$first": `$${pair[1]}` },
            "message": { "$first": "$message" },
            "date": { "$first": "$date" },
            "original_id": { "$first": "$_id" }
         }},

      ]);
      
      Message.aggregate(mongoRequests[0])
      .then(firstResults => {
         Message.aggregate(mongoRequests[1])
         .then(secondsResults => {
            // this will return the last message sent from A to B as well as B to A
            // we should clean it up so we only send the newest of the two messages
            socket.emit('chats', JSON.stringify([...firstResults, ...secondsResults]));
         });
      })
   });

   console.log('Added chat routes');
}

}
