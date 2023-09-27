import React from "react";
import PropTypes from "prop-types";
import GithubCard from "./GithubCard";
import LinkedInCard from "./LinkedInCard";
import PortfolioCard from "./PortfolioCard";
import { skillsDict } from "../data/skills";
import { rolesDict } from "../data/roles";

const SwipeProfile = (props) => {
  const relativePosition = props.relativePosition || 0;
  const angle = props.relativeAngle || 0;
  const isBeingDragged = relativePosition !== 0;
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
        left: `${relativePosition}px`,
        top: `${0}px`,
        transform: `rotate(${angle}deg)`,
      }}
    >
      <h3 draggable={false}>{props.name}</h3>
      {/*<img src={props.profile.profilePictureUrl} alt="" />*/}
      {props.profile.school && (
        <h4 draggable={false}>{props.profile.school}</h4>
      )}
      <p draggable={false} style={{ marginBottom: "1em" }}>
        {props.profile.bio}
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

      <p>
        <b>Skills:</b>&nbsp;
        {String(props.profile.skills.map((e) => skillsDict[e] ?? e)).replaceAll(
          ",",
          ", "
        )}
      </p>

      {!props.isAlone && (
        <p>
          <b>Desired Skills:</b>&nbsp;
          {String(
            props.profile.desiredSkills.map((e) => skillsDict[e] ?? e)
          ).replaceAll(",", ", ")}
        </p>
      )}

      {props.isAlone && props.profile.roles?.length > 0 && (
        <p>
          <b>Roles:</b>&nbsp;
          {String(props.profile.roles.map((e) => rolesDict[e] ?? e)).replaceAll(
            ",",
            ", "
          )}
        </p>
      )}

      {!props.isAlone && props.profile.desiredRoles?.length > 0 && (
        <p>
          <b>Looking for:</b>&nbsp;
          {String(
            props.profile.desiredRoles.map((e) => rolesDict[e] ?? e)
          ).replaceAll(",", ", ")}
        </p>
      )}

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
  relativePosition: PropTypes.number,
  relativeAngle: PropTypes.number,
  borderColor: PropTypes.string,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onMouseMove: PropTypes.func,
};

export default SwipeProfile;
