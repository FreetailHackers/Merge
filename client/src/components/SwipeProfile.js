import React from 'react';
import PropTypes from "prop-types";
import './SwipeProfile.css';

const SwipeProfile = (props) => {
   const relativePosition = props.relativePosition || [0, 0];
   const angle = props.relativeAngle || 0;
   const isBeingDragged = props.relativePosition.some(v => v !== 0); 

   return (
      <div 
         className={`swipe-profile ${isBeingDragged ? 'dragged' : ''} ${props.borderColor}-side`}
         onMouseDown={props.onMouseDown}
         onMouseUp={props.onMouseUp}
         onMouseMove={props.onMouseMove}
         style={{
            left: `${relativePosition[0]}px`,
            top: `${relativePosition[1]}px`,
            transform: `rotate(${angle}deg)`
         }}
      >
         <h3 draggable={false}>{ props.name }</h3>
         <h4 draggable={false}>{ props.school }</h4>
         <p draggable={false}>{ props.intro }</p>
      </div>
   )
};

SwipeProfile.propTypes = {
   name: PropTypes.string.isRequired,
   school: PropTypes.string.isRequired,
   intro: PropTypes.string.isRequired
};

export default SwipeProfile;
