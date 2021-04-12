import React, { Component } from 'react';
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

   render = () => (
      <div className='chatWindow'>
         <div className='newMessageBox'>
            <input name='newMessage' type='text' value={this.state.newMessage} placeholder='Aa' onChange={this.onType} onKeyDown={this.onKeyDown} />
            <p onClick={() => this.props.sendMessage('❤️')}>❤️</p>
         </div>
      </div>
   );
}

export default ChatWindow;
