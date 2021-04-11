import React, { Component } from 'react';
import socket from 'socket.io-client';

class Chat extends Component {
   constructor (props) {
      super(props);

      this.state = {
         chats: []
      };
   }

   componentDidMount () {
      console.log('connecting to socket');
      this.socket = socket('http://localhost:5001');
      this.socket.on('chats', data => {
         console.log('chats', data);
         this.setState({
            chats: JSON.stringify(data)
         });
      });
      
   }

   componentWillUnmount () {
      console.log('disconnecting from socket');
      this.socket.disconnect();
   }

   render = () => (
      <div>
         <p onClick={() => {this.socket.emit('request chats', '');}}>click</p>
         {/* todo */}
      </div>
   )
}

export default Chat;
