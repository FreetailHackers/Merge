import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import expand from "../assets/images/expand.png";
import minimize from "../assets/images/minimize.png";

function Membership(props) {
  const { team, userID } = props;
  const socket = useOutletContext();
  const [toBeKicked, setToBeKicked] = useState([]);
  const [newLeader, setNewLeader] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [teamUserData, setTeamUserData] = useState({});

  useEffect(() => {
    const getTeamUserData = async () => {
      let teamUserData = {};
      for (let i = 0; i < team.users.length; i++) {
        axios
          .get(process.env.REACT_APP_API_URL + `/api/users/${team.users[i]}`)
          .then((res) => {
            teamUserData[res.data["_id"]] = res.data["profile"];
          });
      }
      setTeamUserData(teamUserData);
    };

    getTeamUserData();
  }, [team.users]);

  async function leaveTeam() {
    const res = await axios.post(
      process.env.REACT_APP_API_URL + `/api/teams/leaveTeam`
    );
    socket.emit("leave-team", { teamID: team._id, userID: userID });
    props.setTeam(res.data);
    props.setSection("User");
  }

  async function manageMembership() {
    try {
      const res = await axios.post(
        process.env.REACT_APP_API_URL + `/api/teams/updateMembership`,
        { newLeader, kickedUsers: toBeKicked }
      );
      socket.emit("update-membership", {
        teamID: team._id,
        newLeader,
        kickedUsers: toBeKicked,
        newTeams: res.data.newTeams,
      });
      setNewLeader(null);
      setToBeKicked([]);
      props.setTeam(res.data.team);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="flexColumn centerCol membership">
      <div className="flexColumn centerCol member-list">
        <h3>Members</h3>
        {team &&
          Object.keys(team.profiles).map((e, i) => (
            <div className="flexRow teamRow" key={i}>
              <div className="teamRow-name">
                <p>
                  {team.profiles[e].name} {e === team.leader ? "(Leader)" : ""}{" "}
                  {e === userID ? "(You)" : ""}
                </p>
                {team.leader === userID && e !== userID && newLeader !== e && (
                  <button
                    className={`manageTeamButton ${
                      toBeKicked.includes(e) ? "selectedManageButton" : ""
                    }`}
                    onClick={() =>
                      setToBeKicked((prev) => {
                        if (prev.includes(e)) {
                          return [...prev.filter((id) => id !== e)];
                        }
                        return [...prev, e];
                      })
                    }
                  >
                    Kick
                  </button>
                )}
                {team.leader === userID &&
                  e !== userID &&
                  !toBeKicked.includes(e) && (
                    <button
                      className={`manageTeamButton ${
                        newLeader === e ? "selectedManageButton" : ""
                      }`}
                      onClick={() =>
                        setNewLeader((prev) => (prev === e ? null : e))
                      }
                    >
                      Make Leader
                    </button>
                  )}
                <button
                  onClick={() => {
                    if (expandedUser === team.profiles[e].name) {
                      setExpandedUser(null);
                    } else {
                      setExpandedUser(team.profiles[e].name);
                    }
                    console.log(teamUserData[e]);
                  }}
                  className="teamRowBtn"
                >
                  <img
                    alt="open/close"
                    src={
                      expandedUser === team.profiles[e].name ? expand : minimize
                    }
                  />
                </button>
              </div>
              {expandedUser === team.profiles[e].name && (
                <div className="teamUserInfo">
                  <ul>
                    <li key={"skills"}>
                      <strong>Skills:</strong>{" "}
                      {teamUserData[e]["skills"].join(", ")}
                    </li>
                    <li key={"roles"}>
                      <strong>Roles:</strong>{" "}
                      {teamUserData[e]["roles"].join(", ")}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ))}

        {(newLeader || toBeKicked.length > 0) && (
          <button onClick={manageMembership}>Modify Team</button>
        )}
      </div>
      {team.users.length > 1 && userID !== team.leader && (
        <div className="flexColumn centerCol">
          <h3>Leave Team</h3>
          <button onClick={leaveTeam} className="leaveTeamButton">
            Leave
          </button>
        </div>
      )}
    </div>
  );
}

Membership.propTypes = {
  team: PropTypes.object,
  setTeam: PropTypes.func,
  userID: PropTypes.string,
  setSection: PropTypes.func,
};

export default Membership;
