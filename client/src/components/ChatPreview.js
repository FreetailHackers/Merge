import React from 'react';
import howLongAgo from '../utils/howLongAgo';

const ChatPreview = ({ users, lastMessage, lastMessageDate, profilePicture, seen, onClick, active, chatRequest}) => (
   <div className={'chatPreview' + (chatRequest ? ' chatrequest' : (!seen? ' unread' : '') + (active ? ' active' : ''))} onClick={onClick}>
      <div style={{backgroundImage: `url(${profilePicture})`}} className='chatPicture' />
      <div className='text'>
         <h4>{ users.join(', ') }</h4>
         {
            chatRequest 
            ? <p><span className='messagePreview'> incoming chat request! </span></p>
            : <p><span className='messagePreview'>{ lastMessage }</span> <span className='smallDivider' /> {howLongAgo(lastMessageDate)}</p>
         }
      </div>
      {
         !seen
         ? <span className='unreadBubble' />
         : null
      }
   </div>
);

export default ChatPreview;
