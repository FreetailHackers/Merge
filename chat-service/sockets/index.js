module.exports = {

configureSockets (server) {
   const io = require('socket.io')(server);
   const auth = require('./auth');
   const message = require('./message');

   io.sockets.on('connection', socket => {
      if (auth.authenticate(socket, socket.handshake.query.token)) {
         message.addMessageRoutes(socket);
      }
   });

   console.log('Configured Socket.io');
}

};
