import React, { useState } from "react";
import PropTypes from "prop-types";
import TeamList from "../components/browse/TeamList";
import UserList from "../components/browse/UserList";

function BrowseTeams(props) {
  //frontend for updating
  const { team, setTeam, userID, setTeamID, blockList } = props;
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
      {section === "User List" && (
        <UserList userID={userID} blockList={blockList} />
      )}
    </div>
  );
}

BrowseTeams.propTypes = {
  userID: PropTypes.string.isRequired,
  wideScreen: PropTypes.bool,
  setTeamID: PropTypes.func,
  team: PropTypes.object,
  setTeam: PropTypes.func,
  blockList: PropTypes.array,
};

export default BrowseTeams;
