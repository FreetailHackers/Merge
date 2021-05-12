module.exports = {

authenticate (socket, jwt) {
   // makes request to auth service

   let header = {
      headers: {
          "X-Auth-Token": jwt
      }
   };
  
  axios.get(REACT_APP_API_URL + "/api/chat/userid", header).then(function(response) {
      socket._connectedUserId = response._id; // set this to the user id given by the server
      return true;
  }).catch(function(error) {
      socket.disconnect();
      return false
  });

}

}
