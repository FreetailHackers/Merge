import React from "react";
import PropTypes from "prop-types";
import GithubCard from "./GithubCard";
import LinkedInCard from "./LinkedInCard";
import PortfolioCard from "./PortfolioCard";
import { skillsDict } from "../data/skills";
import { rolesDict } from "../data/roles";
import PictureCircle from "./PictureCircle";

const SwipeProfile = (props) => {
  const relativePosition = props.relativePosition || 0;
  const angle = props.relativeAngle || 0;
  const isBeingDragged = relativePosition !== 0;
  return (
    <div
      className={`swipe-profile ${isBeingDragged ? "dragged" : ""} ${
        props.borderColor
      }-side`}
      onMouseDown={(e) => props.onMouseDown && props.onMouseDown(e, false)}
      onTouchStart={(e) => props.onMouseDown && props.onMouseDown(e, true)}
      onMouseUp={props.onMouseUp}
      onTouchEnd={props.onMouseUp}
      onMouseMove={(e) => props.onMouseMove && props.onMouseMove(e, false)}
      onTouchMove={(e) => props.onMouseMove(e, true)}
      onMouseLeave={props.onMouseUp}
      onTouchCancel={props.onMouseUp}
      style={{
        left: `${relativePosition}px`,
        top: `${0}px`,
        transform: `rotate(${angle}deg)`,
      }}
    >
      <div className="profile-header">
        {(
          <PictureCircle outerClass="profile-photo" profiles={Object.values(props.userProfiles)}/>
        )}
        <div>
          <h3 draggable={false}>{props.name}</h3>
          {props.profile.competitiveness === "win" ? (
            <p
              draggable={false}
              className="compete-status"
              style={{ textAlign: "center", backgroundColor: "#48bc39" }}
            >
              <b>Competititve</b>
            </p>
          ) : (
            <p
              draggable={false}
              className="compete-status"
              style={{ textAlign: "center", backgroundColor: "#54429e" }}
            >
              <b>Here For Fun</b>
            </p>
          )}
          {props.profile.school && (
            <h4 draggable={false}>🎓 {props.profile.school}</h4>
          )}
        </div>
      </div>
      <p draggable={false}>
        <b>About:</b> {props.profile.bio}
      </p>
      {!props.isAlone && (
        <p>
          <b>Members:</b>{" "}
          {String(
            Object.values(props.userProfiles).map(
              (e) =>
                `${e.name}${
                  e.roles?.length > 0
                    ? " (" +
                      String(e.roles.map((r) => rolesDict[r])).replaceAll(
                        ",",
                        ", "
                      ) +
                      ")"
                    : ""
                }`
            )
          ).replaceAll(",", ", ")}
        </p>
      )}
      <b>Skills:</b>&nbsp;
      <p className="attributes-container">
        {props.profile.skills.map((e, index) => (
          <p className="attr-item" key={index}>
            {skillsDict[e] ?? e}
          </p>
        ))}
      </p>
      {!props.isAlone && (
        <p>
          <b>Desired Skills:</b>&nbsp;
          <p className="attributes-container">
            {props.profile.skills.map((e, index) => (
              <p className="attr-item" key={index}>
                {skillsDict[e] ?? e}
              </p>
            ))}
          </p>
        </p>
      )}
      {props.isAlone && props.profile.roles?.length > 0 && (
        <p>
          <b>Roles:</b>&nbsp;
          <p className="attributes-container">
            {props.profile.roles.map((e, index) => (
              <p className="roles-item" key={index}>
                {rolesDict[e] ?? e}
              </p>
            ))}
          </p>
        </p>
      )}
      {!props.isAlone && props.profile.desiredRoles?.length > 0 && (
        <p>
          <b>Looking for:</b>&nbsp;
          <p className="attributes-container">
            {props.profile.desiredRoles.map((e, index) => (
              <p className="roles-item" key={index}>
                {rolesDict[e] ?? e}
              </p>
            ))}
          </p>
        </p>
      )}
      {props.isAlone && props.profile.github && props.profile.githubFinished ? (
        <GithubCard
          username={props.profile.github}
          change={props.profile.githubFinished}
        />
      ) : null}
      {props.isAlone && props.profile.linkedin ? (
        <LinkedInCard link={props.profile.linkedin} mobile={props.mobile} />
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
  relativePosition: PropTypes.number,
  relativeAngle: PropTypes.number,
  borderColor: PropTypes.string,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onMouseMove: PropTypes.func,
  mobile: PropTypes.bool,
};

export default SwipeProfile;
