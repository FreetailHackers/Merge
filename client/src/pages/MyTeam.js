import React, { useState } from "react";
import PropTypes from "prop-types";
import TeamList from "../components/myteam/TeamList";
import UserList from "../components/myteam/UserList";

function MyTeam(props) {
  //frontend for updating
  const { team, setTeam, userID, setTeamID } = props;
  const [section, setSection] = useState("Team List");

  if (!team) {
    return <div></div>;
  }

  return (
    <div className="myTeam">
      <div className={`flexRow hideDiv`}>
        <button
          className={`themeButton${
            section === "Team List" ? " selectedButton" : " notSelectedButton"
          }`}
          onClick={() => {
            setSection("Team List");
          }}
        >
          Other Teams
        </button>
        <button
          className={`themeButton ${
            section === "User List" ? "selectedButton" : "notSelectedButton"
          }`}
          onClick={() => setSection("User List")}
        >
          User List
        </button>
      </div>

      {section === "Team List" && (
        <TeamList
          userID={userID}
          team={team}
          setTeam={setTeam}
          setTeamID={setTeamID}
          setSection={setSection}
        />
      )}
      {section === "User List" && <UserList userID={userID} />}
    </div>
  );
}

MyTeam.propTypes = {
  userID: PropTypes.string.isRequired,
  wideScreen: PropTypes.bool,
  teamID: PropTypes.string,
  setTeamID: PropTypes.func,
  team: PropTypes.object,
  setTeam: PropTypes.func,
};

export default MyTeam;
