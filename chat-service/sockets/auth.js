module.exports = {

authenticate (socket, jwt) {
   // todo:
   // make request to auth service (ask milestone 1 merge-api team)
   var quillURL = "localhost:4000/api/chat/userid"

   let header = {
      headers: {
          "X-Auth-Token": jwt,
      }
   };
  
  axios.get(quillURL, header).then(function(response) {
      socket._connectedUserId = response._id; // set this to the user id given by the server
      return true;
  }).catch(function(error) {
      socket.disconnect();
      return false
  });

}

}