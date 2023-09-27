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
  const { userID } = props;
  const [section, setSection] = useState("Membership");
  const [saved, setSaved] = useState(false);
  const [ingoingMRs, setIngoingMRs] = useState([]);
  const [outgoingMRs, setOutgoingMRs] = useState([]);

  const teamID = team?._id;
  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + `/api/teams/userTeam/${userID}`)
      .then((res) => {
        setTeam(res.data);
        if (res.data.users?.length > 1) {
          setSection("Profile");
        }
      });
  }, [userID]);

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
    if (teamID) {
      socket.emit("join-room", { id: teamID });
    }
    return () => {
      if (teamID) {
        socket.emit("leave-room", { id: teamID });
      }
    };
  }, [socket, teamID]);

  useEffect(() => {
    function teammateLeftWS(data) {
      setTeam((prev) => {
        let newTeam = { ...prev };
        delete newTeam.profiles[data.userID];
        newTeam.users = [...newTeam.users.filter((e) => e !== data.userID)];
        return newTeam;
      });
    }

    function mergeRequestedWS(data) {
      if (data.requestingTeam._id === team._id) {
        setOutgoingMRs((prev) => [...prev, data]);
      } else if (data.requestedTeam._id === team._id) {
        setIngoingMRs((prev) => [...prev, data]);
      }
    }

    function mergeAcceptedWS(data) {
      if (team._id === data.newTeam._id) {
        setOutgoingMRs((prev) => [
          ...prev.filter((e) => e.requestedTeam._id !== data.absorbedTeamID),
        ]);
      }
      setTeam(data.newTeam);
      setSection("Profile");
    }

    function mergeRejectedWS(data) {
      if (data.requestingTeamID === team._id) {
        setOutgoingMRs((prev) => [
          ...prev.filter((e) => e.requestedTeam._id !== data.rejectingTeamID),
        ]);
      } else if (data.rejectingTeamID === team._id) {
        setIngoingMRs((prev) => [
          ...prev.filter((e) => e.requestingTeam._id !== data.requestingTeamID),
        ]);
      }
    }

    function requestCancelledWS(data) {
      if (data.requestedTeamID === team._id) {
        setIngoingMRs((prev) => [
          ...prev.filter((e) => e.requestingTeam._id !== data.cancellingTeamID),
        ]);
      } else if (data.cancellingTeamID === team._id) {
        setOutgoingMRs((prev) => [
          ...prev.filter((e) => e.requestedTeam._id !== data.requestedTeamID),
        ]);
      }
    }

    function profileUpdatedWS(data) {
      if (data.teamID === team._id) {
        setTeam((prev) => ({ ...prev, profile: data.profile }));
        setSaved(true);
      }
    }

    function membershipUpdatedWS() {
      axios
        .get(process.env.REACT_APP_API_URL + `/api/teams/userTeam/${userID}`)
        .then((res) => {
          setTeam(res.data);
        });
    }

    socket.on("teammate-left", teammateLeftWS);
    socket.on("merge-requested", mergeRequestedWS);
    socket.on("merge-accepted", mergeAcceptedWS);
    socket.on("merge-rejected", mergeRejectedWS);
    socket.on("request-cancelled", requestCancelledWS);
    socket.on("profile-updated", profileUpdatedWS);
    socket.on("membership-updated", membershipUpdatedWS);

    return () => {
      socket.off("teammate-left", teammateLeftWS);
      socket.off("merge-requested", mergeRequestedWS);
      socket.off("merge-accepted", mergeAcceptedWS);
      socket.off("merge-rejected", mergeRejectedWS);
      socket.off("request-cancelled", requestCancelledWS);
      socket.off("profile-updated", profileUpdatedWS);
      socket.off("membership-updated", membershipUpdatedWS);
    };
  }, [socket, team, setTeam, userID]);

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
        <TeamProfile
          team={team}
          setTeam={setTeam}
          saved={saved}
          setSaved={setSaved}
        />
      )}

      {section === "Membership" && (
        <Membership team={team} userID={userID} setTeam={setTeam} />
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
};

export default MyTeam;
