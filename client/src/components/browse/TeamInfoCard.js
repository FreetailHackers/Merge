import React from "react";
import PropTypes from "prop-types";

function TeamInfoCard(props) {
  const otherNames = props.team.users
    .filter((e) => e !== props.team.leader)
    .map((e) => props.team.profiles[e].name)
    .join(", ");
  return (
    <div className="flexColumn mergeRequest">
      <p>Team Name: {props.team.profile.name ?? "None"}</p>
      <p>Leader: {props.team.profiles[props.team.leader].name}</p>
      <p>Other members: {otherNames.length > 0 ? otherNames : "None"}</p>
      {props.message && <p>Message: {props.message}</p>}
      {props.timestamp && <p>Timestamp: {props.timestamp}</p>}
      {props.showButtons && (
        <div className="flexRow mrButtons">
          {props.buttons &&
            props.buttons.map((e, i) => (
              <button onClick={e.func} key={i} className="teamInfoButton">
                {e.text}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

TeamInfoCard.propTypes = {
  team: PropTypes.object.isRequired,
  message: PropTypes.string,
  timestamp: PropTypes.string,
  buttons: PropTypes.array,
  showButtons: PropTypes.bool,
};

export default TeamInfoCard;
