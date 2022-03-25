

module.exports = {

configureSockets (server) {

   const io = require('socket.io')(server, {
      cors: {
         origin: "http://localhost:3000",
         methods: ["GET", "POST"]
      }
   })
   const auth = require('./auth');
   const message = require('./message');
   const chat = require('./chat');

   io.on('connection', socket => {
      console.log('Client connected to socket');
      if (auth.authenticate(socket, socket.handshake.query.token)) {
         message.addMessageRoutes(socket);
         chat.addChatRoutes(socket);
      }
   });

   io.on('disconnect', socket => {
      console.log('Client disconnected from socket');
   });

   io.on('connect_error', function(err) {
      console.log("client connect_error: ", err);
   });
   
   io.on('connect_timeout', function(err) {
      console.log("client connect_timeout: ", err);
   });

   console.log('Configured Socket.io');
}

};
