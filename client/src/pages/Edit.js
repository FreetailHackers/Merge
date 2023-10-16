import React, { useState } from "react";
import PropTypes from "prop-types";
import UserProfile from "../components/UserProfile";
import TeamProfile from "../components/TeamProfile";
import Membership from "../components/Membership";

function Edit(props) {
  //frontend for updating
  const [section, setSection] = useState("Team");
  const notAlone = props.team?.users?.length > 1;

  return (
    <div className="edit">
      {notAlone && (
        <div className={`flexRow hideDiv`}>
          <button
            className={`themeButton ${
              section === "Team" ? "selectedButton" : "notSelectedButton"
            }`}
            onClick={() => setSection("Team")}
          >
            Team Profile
          </button>
          <button
            className={`themeButton ${
              section === "User" ? "selectedButton" : "notSelectedButton"
            }`}
            onClick={() => setSection("User")}
          >
            User Profile
          </button>
        </div>
      )}
      {notAlone && section === "Team" && (
        <>
          <TeamProfile
            team={props.team}
            setTeam={props.setTeam}
            userID={props.userID}
          />
          <Membership
            team={props.team}
            setTeam={props.setTeam}
            userID={props.userID}
            setSection={setSection}
          />
        </>
      )}
      {(!notAlone || section === "User") && (
        <UserProfile
          user={props.user}
          setUser={props.setUser}
          userID={props.userID}
          wideScreen={props.wideScreen}
        />
      )}
    </div>
  );
}

Edit.propTypes = {
  user: PropTypes.object,
  userID: PropTypes.string.isRequired,
  setUser: PropTypes.func.isRequired,
  wideScreen: PropTypes.bool,
  team: PropTypes.object,
  setTeam: PropTypes.func,
};

export default Edit;
