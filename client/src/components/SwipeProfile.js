import React from "react";
import PropTypes from "prop-types";
import GithubCard from "./GithubCard";
import LinkedInCard from "./LinkedInCard";
import PortfolioCard from "./PortfolioCard";

const SwipeProfile = (props) => {
  const relativePosition = props.relativePosition || [0, 0];
  const angle = props.relativeAngle || 0;
  const isBeingDragged = relativePosition.some((v) => v !== 0);
  return (
    <div
      className={`swipe-profile ${isBeingDragged ? "dragged" : ""} ${
        props.borderColor
      }-side`}
      onMouseDown={(e) => props.onMouseDown(e, false)}
      onTouchStart={(e) => props.onMouseDown(e, true)}
      onMouseUp={props.onMouseUp}
      onTouchEnd={props.onMouseUp}
      onMouseMove={(e) => props.onMouseMove && props.onMouseMove(e, false)}
      onTouchMove={(e) => props.onMouseMove(e, true)}
      onMouseLeave={props.onMouseUp}
      onTouchCancel={props.onMouseUp}
      style={{
        left: `${relativePosition[0]}px`,
        top: `${relativePosition[1]}px`,
        transform: `rotate(${angle}deg)`,
      }}
    >
      <h3 draggable={false}>{props.name}</h3>
      <img src={props.profile.profilePictureUrl} alt="" />
      <h4 draggable={false}>{props.profile.school}</h4>
      <p draggable={false} style={{ marginBottom: 60 }}>
        {props.profile.bio}
      </p>
      <div draggable={false}>
        {!props.isAlone &&
          Object.keys(props.userProfiles).map((e, i) => (
            <p key={i}>{props.userProfiles[e].name}</p>
          ))}
      </div>

      {props.isAlone && props.profile.github && props.profile.githubFinished ? (
        <GithubCard
          username={props.profile.github}
          change={props.profile.githubFinished}
        />
      ) : null}
      {props.isAlone && props.profile.linkedin ? (
        <LinkedInCard link={props.profile.linkedin} />
      ) : null}
      {props.isAlone && props.profile.portfolio ? (
        <PortfolioCard link={props.profile.portfolio} />
      ) : null}
    </div>
  );
};

SwipeProfile.propTypes = {
  profile: PropTypes.object.isRequired,
  isAlone: PropTypes.bool.isRequired,
  name: PropTypes.string,
  userProfiles: PropTypes.object,
  relativePosition: PropTypes.array,
  relativeAngle: PropTypes.number,
  borderColor: PropTypes.string,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onMouseMove: PropTypes.func,
};

export default SwipeProfile;
