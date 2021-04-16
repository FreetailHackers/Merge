import React from 'react';

const Message = ({fromSelf, content, image, name, mergeBottom, mergeTop}) => (
   <div className={
      'message' 
      + (fromSelf ? ' rightSide' : '') 
      + (mergeBottom ? ' mergeBottom' : '')
      + (mergeTop ? ' mergeTop' : '')
   }>
      {
         mergeBottom
         ? null
         : <div className='messageImage' style={{ backgroundImage: `url(${image})` }} />
      }
      <div>
         {
            mergeTop
            ? null
            : <p className='messageName'>{name}</p>
         }
         <div className='messageContent'>{content}</div>
      </div>
   </div>
);

export default Message;
