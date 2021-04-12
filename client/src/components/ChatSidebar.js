import React from 'react';
import ChatPreview from './ChatPreview';

const ChatSidebar = ({ chats }) => (
   <div className='chatSidebar'>
      {
         chats.map(chat => 
            <ChatPreview 
               users={chat.userNames} 
               lastMessage={chat.messages[0].message} 
               lastMessageDate={chat.messages[0].date} 
               profilePicture={chat.userImages[0]}
            />
         )
      }
   </div>
)

export default ChatSidebar;
