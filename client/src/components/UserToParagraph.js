import React from 'react';
import { startCase } from 'lodash';

export const UserToParagraphFragment = (user, key) => (
   <span key={key}>
      <b>{startCase(key)}</b>: {user[key]}<br />
   </span>
)
 
export const UserToParagraph = ({user, keys}) => (
   <p>
      { keys.map(key => UserToParagraphFragment(user, key)) }
   </p>
)
