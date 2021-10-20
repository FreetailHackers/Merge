import React, { Component } from 'react';
import Message from './Message';
import './ChatWindow.css';

class ChatWindow extends Component {
   constructor (props) {
      super(props);

      this.state = {
         newMessage: ''
      }
   }

   onType = (e) => {
      this.setState({
         [e.target.name]: e.target.value
      });
   }

   onKeyDown = (e) => {
      if (e.key.toLowerCase() === "enter") {
         this.props.sendMessage(e.target.value);
         this.setState({
            [e.target.name]: ''
         });
      }
   }

   sendMessageButton = () => {
      let message = document.getElementById('newMessageInput').value;
      if (message === '') return;
      this.props.sendMessage(message);
      this.setState({
         ['update']: ''
      })
   }

   render = () => (
      <div className='chatWindow'>
         {
            this.props.chat.messages.map((message, index) => {
               console.log(this.props);
               const profile = this.props.profiles[message.fromUserId];
               const image = profile ? profile.image : '';
               const name = profile ? profile.name : 'Profile missing';
               return (<Message
                  fromSelf={message.fromUserId === "0" /*TODO: use redux user id*/}
                  content={message.message}
                  image={image}
                  name={name}
                  mergeTop={index > 0 && message.fromUserId === this.props.chat.messages[index - 1].fromUserId}
                  mergeBottom={index < this.props.chat.messages.length - 1 && message.fromUserId === this.props.chat.messages[index + 1].fromUserId}
               />)
            })
         }
         <div className='newMessageBox'>
            <input id='newMessageInput' name='newMessage' type='text' value={this.state.newMessage} placeholder='Aa' onChange={this.onType} onKeyDown={this.onKeyDown} />
            <p onClick={() => {this.props.sendMessage('❤️'); this.setState({['update']: ''})}}>❤️</p>
            <p onClick={this.sendMessageButton}>➡️</p>
         </div>
      </div>
   );
}

export default ChatWindow;
