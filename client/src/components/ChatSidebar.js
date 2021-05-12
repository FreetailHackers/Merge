import React from 'react';
import ChatPreview from './ChatPreview';
import './ChatSidebar.css';

const ChatSidebar = ({ chats, setActiveChatIndex, activeChatIndex }) => (
   <div className='chatSidebar'>
      {
         chats.map((chat, i) => 
            <ChatPreview 
               key={i}
               active={i === activeChatIndex}
               users={chat.userNames} 
               lastMessage={chat.messages[0].message} 
               lastMessageDate={chat.messages[0].date} 
               profilePicture={chat.userImages[0]}
               seen={chat.messages[0].seen}
               onClick={() => setActiveChatIndex(i)}
            />
         )
      }
   </div>
)

export default ChatSidebar;