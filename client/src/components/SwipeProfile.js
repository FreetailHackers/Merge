import React from 'react';
import PropTypes from "prop-types";
import GithubCard from './GithubCard';
import './SwipeProfile.css';
import LinkedInCard from './LinkedInCard';

const SwipeProfile = (props) => {
   const relativePosition = props.relativePosition || [0, 0];
   const angle = props.relativeAngle || 0;
   const isBeingDragged = relativePosition.some(v => v !== 0); 

   return (
      <div 
         className={`swipe-profile ${isBeingDragged ? 'dragged' : ''} ${props.borderColor}-side`}
         onMouseDown={props.onMouseDown}
         onMouseUp={props.onMouseUp}
         onMouseMove={props.onMouseMove}
         onKeyDown={props.onKeyDown}
         style={{
            left: `${relativePosition[0]}px`,
            top: `${relativePosition[1]}px`,
            transform: `rotate(${angle}deg)`
         }}
      >
         <h3 draggable={false}>{ props.name }</h3>
         <img src={ props.profilePictureUrl } alt='' />
         <h4 draggable={false}>{ props.school }</h4>
         <p draggable={false} style={{ marginBottom: 60 }}>{ props.intro }</p>
         {
            props.github 
            ? <GithubCard username={ props.github } />
            : null
         }
         {
            props.linkedin
            ? <LinkedInCard id={ props.github } />
            : null
         }
      </div>
   )
};

SwipeProfile.propTypes = {
   name: PropTypes.string.isRequired,
   school: PropTypes.string.isRequired,
   intro: PropTypes.string.isRequired
};

export default SwipeProfile;
