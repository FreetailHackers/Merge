import React from 'react';
import PropTypes from "prop-types";
import GithubCard from './GithubCard';
import './SwipeProfile.css';
import LinkedInCard from './LinkedInCard';
import PortfolioCard from './PortfolioCard';
import arrowLeft from '../assets/images/arrow-left.png';
import arrowRight from '../assets/images/arrow-right.png';

const SwipeProfile = (props) => {
   const relativePosition = props.relativePosition || [0, 0];
   const angle = props.relativeAngle || 0;
   const isBeingDragged = relativePosition.some(v => v !== 0); 

   return (
      <div>
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
               ? <LinkedInCard link={ props.linkedin } />
               : null
            }
            {
               props.portfolio
               ? <PortfolioCard link={ props.portfolio } />
               : null
            }
         </div>
         <div className="arrows">
            <input type="image" src={arrowLeft} className="arrow left" id="left" onClick={props.click} />
            <input type="image" src={arrowRight} className="arrow right" id="right" onClick={props.click} />
         </div>
      </div>
   )
};

SwipeProfile.propTypes = {
   name: PropTypes.string.isRequired,
   school: PropTypes.string.isRequired,
   intro: PropTypes.string.isRequired
};

export default SwipeProfile;
