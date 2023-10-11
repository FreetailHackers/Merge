import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import TeamList from "../components/myteam/TeamList";
import UserList from "../components/myteam/UserList";
import TeamProfile from "../components/myteam/TeamProfile";
import Membership from "../components/myteam/Membership";
import { useOutletContext } from "react-router-dom";

function MyTeam(props) {
  //frontend for updating
  const socket = useOutletContext();
  const [team, setTeam] = useState(null);
  const { userID, teamID, setTeamID } = props;
  const [section, setSection] = useState("Membership");
  const [newRequests, setNewRequests] = useState(false);

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + `/api/teams/userTeam/${userID}`)
      .then((res) => {
        setTeam(res.data);
        if (res.data.users?.length > 1) {
          setSection("Profile");
          if (res.data.mergeRequests?.length > 0) {
            setNewRequests(true);
          }
        } else {
          setSection("Team List");
        }
      });
  }, [userID, teamID]);

  useEffect(() => {
    function teammateLeftWS(data) {
      setTeam((prev) => {
        let newTeam = { ...prev };
        delete newTeam.profiles[data.userID];
        newTeam.users = [...newTeam.users.filter((e) => e !== data.userID)];
        if (newTeam.users.length === 1) {
          setSection("Team List");
        }
        return newTeam;
      });
    }

    /*function mergeAcceptedWS(data) {
      setTeam(data.newTeam);
      setTeamID(data.newTeam._id);
      setSection("Profile");
    }*/

    function membershipUpdatedWS(data) {
      if (data.kickedUsers.includes(userID)) {
        setTeamID(data.newTeams[userID]);
      } else {
        setTeam((prev) => {
          let newTeam = { ...prev };
          newTeam.users = [
            ...newTeam.users.filter((e) => !data.kickedUsers.includes(e)),
          ];
          for (const user of data.kickedUsers) {
            delete newTeam.profiles[user];
          }
          if (data.newLeader) {
            newTeam.leader = data.newLeader;
          }
          return newTeam;
        });
      }
    }

    socket.on("teammate-left", teammateLeftWS);
    //socket.on("merge-accepted", mergeAcceptedWS);
    socket.on("membership-updated", membershipUpdatedWS);

    return () => {
      socket.off("teammate-left", teammateLeftWS);
      //socket.off("merge-accepted", mergeAcceptedWS);
      socket.off("membership-updated", membershipUpdatedWS);
    };
  }, [socket, teamID, setTeamID, setTeam, userID]);

  useEffect(() => {
    function newMR(data) {
      if (section !== "Other Teams") {
        setNewRequests(true);
      }
    }
    socket.on("merge-requested", newMR);
    return () => {
      socket.off("merge-requested", newMR);
    };
  }, [socket, section]);

  if (!team || !team.profile) {
    return <div></div>;
  }

  return (
    <div className="myTeam">
      <div></div>

      <div className={`flexRow hideDiv`}>
        {team?.users?.length > 1 && (
          <button
            className={`themeButton ${
              section === "Profile" ? "selectedButton" : "notSelectedButton"
            }`}
            onClick={() => setSection("Profile")}
          >
            Profile
          </button>
        )}
        <button
          className={`themeButton ${
            section === "Membership" ? "selectedButton" : "notSelectedButton"
          }`}
          onClick={() => setSection("Membership")}
        >
          Membership
        </button>
        <button
          className={`themeButton${
            section === "Team List" ? " selectedButton" : " notSelectedButton"
          }${newRequests ? " newInfoButton" : ""}`}
          onClick={() => {
            setSection("Team List");
            setNewRequests(false);
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

      {section === "Profile" && (
        <TeamProfile team={team} setTeam={setTeam} userID={userID} />
      )}

      {section === "Membership" && (
        <Membership
          team={team}
          userID={userID}
          setTeam={setTeam}
          setTeamID={setTeamID}
        />
      )}

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
};

export default MyTeam;
