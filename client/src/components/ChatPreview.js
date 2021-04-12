import React from 'react';
import howLongAgo from '../utils/howLongAgo';

const ChatPreview = ({ users, lastMessage, lastMessageDate, profilePicture }) => (
   <div className='chatPreview'>
      <div style={{backgroundImage: `url(${profilePicture})`}} className='chatPicture' />
      <div>
         <h4>{ users.join(', ') }</h4>
         <p>{ lastMessage } <span className='smallDivider' /> {howLongAgo(lastMessageDate)}</p>
      </div>
   </div>
);

export default ChatPreview;
