import React from 'react';

export const UserToParagraphFragment = (user, key) => (
   <span key={key}>
      <b>{key}</b>: {user[key]}<br />
   </span>
)
 
export const UserToParagraph = ({user, keys}) => (
   <p>
      { keys.map(key => UserToParagraphFragment(user, key)) }
   </p>
)
