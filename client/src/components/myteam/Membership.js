import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

function Membership(props) {
  const { team, userID } = props;
  const socket = useOutletContext();
  const [toBeKicked, setToBeKicked] = useState([]);
  const [newLeader, setNewLeader] = useState(null);

  async function leaveTeam() {
    const res = await axios.post(
      process.env.REACT_APP_API_URL + `/api/teams/leaveTeam`
    );
    socket.emit("leave-team", { teamID: team._id, userID: userID });
    props.setTeamID(res.data._id);
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
    <div className="flexColumn centerCol">
      <div className="flexColumn centerCol member-list">
        <h3>Members</h3>
        {team &&
          Object.keys(team.profiles).map((e, i) => (
            <div className="flexRow teamRow" key={i}>
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
  setTeamID: PropTypes.func,
};

export default Membership;
