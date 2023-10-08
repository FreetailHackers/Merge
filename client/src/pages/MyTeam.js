import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import TeamList from "../components/myteam/TeamList";
import UserList from "../components/myteam/UserList";
import TeamProfile from "../components/myteam/TeamProfile";
import Membership from "../components/myteam/Membership";
import { useOutletContext } from "react-router-dom";
import toggleBars from "../assets/images/toggle-bars.png";

function MyTeam(props) {
  //frontend for updating
  const socket = useOutletContext();
  const [team, setTeam] = useState(null);
  const { userID, teamID, setTeamID } = props;
  const [section, setSection] = useState("Membership");
  const [ingoingMRs, setIngoingMRs] = useState([]);
  const [outgoingMRs, setOutgoingMRs] = useState([]);

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + `/api/teams/userTeam/${userID}`)
      .then((res) => {
        setTeam(res.data);
        if (res.data.users?.length > 1) {
          setSection("Profile");
        } else {
          setSection("Team List");
        }
      });
  }, [userID, teamID]);

  useEffect(() => {
    axios
      .get(
        process.env.REACT_APP_API_URL + "/api/teams/mergeRequestsInfo/" + userID
      )
      .then((res) => {
        setIngoingMRs(res.data.ingoing);
        setOutgoingMRs(res.data.outgoing);
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

    function mergeRequestedWS(data) {
      if (data.requestingTeam._id === teamID) {
        setOutgoingMRs((prev) => [...prev, data]);
      } else if (data.requestedTeam._id === teamID) {
        setIngoingMRs((prev) => [...prev, data]);
      }
    }

    function mergeAcceptedWS(data) {
      if (teamID === data.newTeam._id) {
        setOutgoingMRs((prev) => [
          ...prev.filter((e) => e.requestedTeam._id !== data.absorbedTeamID),
        ]);
      }
      setTeam(data.newTeam);
      setTeamID(data.newTeam._id);
      setSection("Profile");
    }

    function mergeRejectedWS(data) {
      if (data.requestingTeamID === teamID) {
        setOutgoingMRs((prev) => [
          ...prev.filter((e) => e.requestedTeam._id !== data.rejectingTeamID),
        ]);
      } else if (data.rejectingTeamID === teamID) {
        setIngoingMRs((prev) => [
          ...prev.filter((e) => e.requestingTeam._id !== data.requestingTeamID),
        ]);
      }
    }

    function requestCancelledWS(data) {
      if (data.requestedTeamID === teamID) {
        setIngoingMRs((prev) => [
          ...prev.filter((e) => e.requestingTeam._id !== data.cancellingTeamID),
        ]);
      } else if (data.cancellingTeamID === teamID) {
        setOutgoingMRs((prev) => [
          ...prev.filter((e) => e.requestedTeam._id !== data.requestedTeamID),
        ]);
      }
    }

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
    socket.on("merge-requested", mergeRequestedWS);
    socket.on("merge-accepted", mergeAcceptedWS);
    socket.on("merge-rejected", mergeRejectedWS);
    socket.on("request-cancelled", requestCancelledWS);
    socket.on("membership-updated", membershipUpdatedWS);

    return () => {
      socket.off("teammate-left", teammateLeftWS);
      socket.off("merge-requested", mergeRequestedWS);
      socket.off("merge-accepted", mergeAcceptedWS);
      socket.off("merge-rejected", mergeRejectedWS);
      socket.off("request-cancelled", requestCancelledWS);
      socket.off("membership-updated", membershipUpdatedWS);
    };
  }, [socket, teamID, setTeamID, setTeam, userID]);

  if (!team || !team.profile) {
    return <div></div>;
  }

  return (
    <div className="myTeam">
      {!props.wideScreen && (
        <div className="toggleHolder">
          <button
            className="toggleSidebar toggleCenter"
            onClick={props.flipDisplaySidebar}
          >
            <img src={toggleBars} alt="toggle bars" />
          </button>
        </div>
      )}
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
          className={`themeButton ${
            section === "Team List" ? "selectedButton" : "notSelectedButton"
          }`}
          onClick={() => setSection("Team List")}
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
          setOutgoingMRs={setOutgoingMRs}
          ingoingMRs={ingoingMRs}
          setIngoingMRs={setIngoingMRs}
          outgoingMRs={outgoingMRs}
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
  flipDisplaySidebar: PropTypes.func,
  teamID: PropTypes.string,
  setTeamID: PropTypes.func,
};

export default MyTeam;
