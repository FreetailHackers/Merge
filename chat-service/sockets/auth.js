module.exports = {

authenticate (socket, jwt) {
   // todo:
   // make request to auth service (ask milestone 1 merge-api team)
   if (1) {
      console.log('Client authenticated');
      socket._connectedUserId = '0'; // set this to the user id given by the server
      return true;
   } else {
      socket.disconnect();
      return false
   }
}

}