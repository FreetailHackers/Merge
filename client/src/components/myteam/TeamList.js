import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import TeamInfoCard from "./TeamInfoCard";
import { useOutletContext } from "react-router-dom";

function TeamList(props) {
  const { ingoingMRs, outgoingMRs, team, userID } = props;
  const MAX_TEAM_SIZE = process.env.REACT_APP_MAX_TEAM_SIZE;
  const [otherTeams, setOtherTeams] = useState([]);
  const socket = useOutletContext();

  function findTeams() {
    axios.get(process.env.REACT_APP_API_URL + "/api/teams/list").then((res) => {
      setOtherTeams(res.data.filter((e) => !e.users.includes(userID)));
    });
  }

  function requestMerge(otherTeam) {
    axios
      .post(
        process.env.REACT_APP_API_URL +
          "/api/teams/requestMerge/" +
          otherTeam._id
      )
      .then((res) => {
        let mrObj = res.data;
        mrObj.requestedTeam = otherTeam;
        props.setOutgoingMRs((prev) => [...prev, mrObj]);
        mrObj.requestingTeam = team;
        socket.emit("request-merge", mrObj);
      });
  }

  function canMerge(team1, team2) {
    return team1.users.length + team2.users.length <= MAX_TEAM_SIZE;
  }

  function acceptRequest(teamID) {
    const oldTeamID = team._id;
    axios
      .post(process.env.REACT_APP_API_URL + `/api/teams/acceptMerge/${teamID}`)
      .then((res) => {
        props.setTeam(res.data);
        const absorbedTeamID = res.data._id === teamID ? oldTeamID : teamID;
        socket.emit("accept-merge", { absorbedTeamID, newTeam: res.data });
        props.setSection("Profile");
      });
  }

  function rejectRequest(teamID) {
    axios
      .post(process.env.REACT_APP_API_URL + `/api/teams/rejectMerge/${teamID}`)
      .then(() => {
        props.setIngoingMRs((prev) => [
          ...prev.filter((e) => e.requestingTeam._id !== teamID),
        ]);
        socket.emit("reject-merge", {
          requestingTeamID: teamID,
          rejectingTeamID: team._id,
        });
      });
  }

  function cancelRequest(teamID) {
    axios
      .post(
        process.env.REACT_APP_API_URL + `/api/teams/cancelRequest/${teamID}`
      )
      .then(() => {
        props.setOutgoingMRs((prev) => [
          ...prev.filter((e) => e.requestedTeam._id !== teamID),
        ]);
        socket.emit("cancel-request", {
          cancellingTeamID: team._id,
          requestedTeamID: teamID,
        });
      });
  }

  useEffect(() => {
    axios.get(process.env.REACT_APP_API_URL + "/api/teams/list").then((res) => {
      setOtherTeams(res.data.filter((e) => !e.users.includes(userID)));
    });
  }, [userID]);

  return (
    <div className="flexColumn centerCol">
      <div className="flexColumn teamRequests">
        <h3>Requests</h3>
        <div className="merge-requests">
          <div className="mrColumn flexColumn">
            <h4>Ingoing</h4>
            {props.ingoingMRs &&
              props.ingoingMRs.map((request, index) => (
                <TeamInfoCard
                  key={index}
                  team={request.requestingTeam}
                  buttons={[
                    {
                      text: "Accept Request",
                      func: () => acceptRequest(request.requestingTeam._id),
                    },
                    {
                      text: "Reject Request",
                      func: () => rejectRequest(request.requestingTeam._id),
                    },
                  ]}
                  showButtons={team.leader === userID}
                />
              ))}
          </div>
          <div className="mrColumn flexColumn">
            <h4>Outgoing</h4>
            {props.outgoingMRs &&
              props.outgoingMRs.map((request, index) => (
                <TeamInfoCard
                  key={index}
                  team={request.requestedTeam}
                  buttons={[
                    {
                      text: "Cancel Request",
                      func: () => cancelRequest(request.requestedTeam._id),
                    },
                  ]}
                  showButtons={team.leader === userID}
                />
              ))}
          </div>
        </div>
      </div>
      <h3>Grow your Team</h3>
      <button onClick={findTeams}>Refresh</button>

      <div className="flexColumn centerCol">
        {otherTeams &&
          otherTeams.map((e, i) => (
            <TeamInfoCard
              key={i}
              team={e}
              showButtons={
                ![
                  ...outgoingMRs.map((req) => req.requestedTeam._id),
                  ...ingoingMRs.map((req) => req.requestingTeam._id),
                ].includes(e._id) && canMerge(e, team)
              }
              buttons={[
                { text: "Request to Merge", func: () => requestMerge(e) },
              ]}
            />
          ))}
      </div>
    </div>
  );
}

TeamList.propTypes = {
  otherTeams: PropTypes.array,
  setOtherTeams: PropTypes.func,
  ingoingMRs: PropTypes.array,
  outgoingMRs: PropTypes.array,
  team: PropTypes.object,
  setTeam: PropTypes.func,
  setIngoingMRs: PropTypes.func,
  setOutgoingMRs: PropTypes.func,
  userID: PropTypes.string,
  setSection: PropTypes.func,
};

export default TeamList;
