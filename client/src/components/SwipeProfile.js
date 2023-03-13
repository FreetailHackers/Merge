import React from "react";
import PropTypes from "prop-types";
import GithubCard from "./GithubCard";
import "./SwipeProfile.css";
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
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      onMouseMove={props.onMouseMove}
      style={{
        left: `${relativePosition[0]}px`,
        top: `${relativePosition[1]}px`,
        transform: `rotate(${angle}deg)`,
      }}
    >
      <h3 draggable={false}>{props.name}</h3>
      <img src={props.profilePictureUrl} alt="" />
      <h4 draggable={false}>{props.school}</h4>
      <p draggable={false} style={{ marginBottom: 60 }}>
        {props.intro}
      </p>
      {props.github && props.githubFinished ? (
        <GithubCard username={props.github} change={props.githubFinished} />
      ) : null}
      {props.linkedin ? <LinkedInCard link={props.linkedin} /> : null}
      {props.portfolio ? <PortfolioCard link={props.portfolio} /> : null}
    </div>
  );
};

SwipeProfile.propTypes = {
  name: PropTypes.string.isRequired,
  school: PropTypes.string,
  intro: PropTypes.string.isRequired,
  relativePosition: PropTypes.array.isRequired,
  relativeAngle: PropTypes.number.isRequired,
  borderColor: PropTypes.string.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func,
  onMouseMove: PropTypes.func,
  profilePictureUrl: PropTypes.string,
  github: PropTypes.string,
  linkedin: PropTypes.object,
  portfolio: PropTypes.object,
  githubFinished: PropTypes.bool,
};

export default SwipeProfile;
