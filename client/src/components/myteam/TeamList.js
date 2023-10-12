import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import TeamInfoCard from "./TeamInfoCard";
import { useOutletContext } from "react-router-dom";
import SkillSelector from "../SkillSelector";
import Collapsible from "../Collapsible";
import { UserToParagraph } from "../UserToParagraph";
import { Pagination } from "../Pagination";
import { useNavigate } from "react-router-dom";
import { TextInput, NativeSelect, NumberInput } from "@mantine/core";

function TeamList(props) {
  const [ingoingMRs, setIngoingMRs] = useState([]);
  const [outgoingMRs, setOutgoingMRs] = useState([]);
  const { userID } = props;
  const MAX_TEAM_SIZE = process.env.REACT_APP_MAX_TEAM_SIZE;
  const [otherTeams, setOtherTeams] = useState([]);
  const socket = useOutletContext();
  const [nameFilter, setNameFilter] = useState("");
  const [competitiveness, setCompetitiveness] = useState("");
  const [skillFilter, setSkillFilter] = useState([]);
  const [desiredSkillFilter, setDesiredSkillFilter] = useState([]);
  const [sizeFilter, setSizeFilter] = useState(0);
  const [memberFilter, setMemberFilter] = useState("");
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);

  const navigate = useNavigate();

  const teamID = props.team?._id;

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
    function mergeRequestedWS(data) {
      if (data.requestingTeam._id === teamID) {
        setOutgoingMRs((prev) => [...prev, data]);
      } else if (data.requestedTeam._id === teamID) {
        setIngoingMRs((prev) => [...prev, data]);
      }
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
    socket.on("merge-requested", mergeRequestedWS);
    socket.on("merge-rejected", mergeRejectedWS);
    socket.on("request-cancelled", requestCancelledWS);

    return () => {
      socket.off("merge-requested", mergeRequestedWS);
      socket.off("merge-rejected", mergeRejectedWS);
      socket.off("request-cancelled", requestCancelledWS);
    };
  }, [socket, teamID]);

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
        setOutgoingMRs((prev) => [...prev, mrObj]);
        mrObj.requestingTeam = props.team;
        socket.emit("request-merge", mrObj);
      });
  }

  function canMerge(team1, team2) {
    return team1.users.length + team2.users.length <= MAX_TEAM_SIZE;
  }

  function acceptRequest(teamID) {
    const oldTeamID = props.team._id;
    axios
      .post(process.env.REACT_APP_API_URL + `/api/teams/acceptMerge/${teamID}`)
      .then((res) => {
        props.setTeamID(res.data._id);
        //props.setTeam(res.data);
        const absorbedTeamID = res.data._id === teamID ? oldTeamID : teamID;
        socket.emit("accept-merge", { absorbedTeamID, newTeam: res.data });
        navigate("/edit");
      });
  }

  function rejectRequest(teamID) {
    axios
      .post(process.env.REACT_APP_API_URL + `/api/teams/rejectMerge/${teamID}`)
      .then(() => {
        setIngoingMRs((prev) => [
          ...prev.filter((e) => e.requestingTeam._id !== teamID),
        ]);
        socket.emit("reject-merge", {
          requestingTeamID: teamID,
          rejectingTeamID: props.team._id,
        });
      });
  }

  function cancelRequest(teamID) {
    axios
      .post(
        process.env.REACT_APP_API_URL + `/api/teams/cancelRequest/${teamID}`
      )
      .then(() => {
        setOutgoingMRs((prev) => [
          ...prev.filter((e) => e.requestedTeam._id !== teamID),
        ]);
        socket.emit("cancel-request", {
          cancellingTeamID: props.team._id,
          requestedTeamID: teamID,
        });
      });
  }

  useEffect(() => {
    async function getTeamsFromAPI() {
      try {
        const queryParamters = {
          page,
          filters: {
            ...(nameFilter && { name: nameFilter }),
            ...(memberFilter && { memberName: memberFilter }),
            ...(sizeFilter > 0 && { size: sizeFilter }),
            ...(skillFilter?.length > 0 && { skills: skillFilter }),
            ...(desiredSkillFilter?.length > 0 && {
              desiredSkills: desiredSkillFilter,
            }),
            ...(competitiveness?.length > 0 && { competitiveness }),
          },
        };
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/teams/list`,
          { params: queryParamters }
        );
        if (res.data) {
          setOtherTeams(res.data.list);
          setPages(res.data.pages ?? 0);
        }
      } catch (err) {
        console.log(err);
      }
    }
    getTeamsFromAPI();
  }, [
    competitiveness,
    nameFilter,
    skillFilter,
    page,
    memberFilter,
    sizeFilter,
    desiredSkillFilter,
  ]);

  async function messageTeam(team) {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/chats/new`, {
        otherUsers: [
          ...team.users,
          ...props.team.users.filter((e) => e !== userID),
        ],
      });
      navigate("/chat");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flexColumn centerCol">
      {(ingoingMRs?.length > 0 || outgoingMRs?.length > 0) && (
        <div className="flexColumn teamRequests">
          <h3>Requests</h3>
          <div className="merge-requests">
            <div className="mrColumn flexColumn">
              {ingoingMRs?.length > 0 && <h4>Incoming</h4>}
              {ingoingMRs &&
                ingoingMRs.map((request, index) => (
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
                    showButtons={props.team.leader === userID}
                  />
                ))}
            </div>
            <div className="mrColumn flexColumn">
              {outgoingMRs?.length > 0 && <h4>Outgoing</h4>}
              {outgoingMRs &&
                outgoingMRs.map((request, index) => (
                  <TeamInfoCard
                    key={index}
                    team={request.requestedTeam}
                    buttons={[
                      {
                        text: "Cancel Request",
                        func: () => cancelRequest(request.requestedTeam._id),
                      },
                    ]}
                    showButtons={true}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="flexColumn centerCol">
        <h3>Grow your Team</h3>
        <div className="flexRow filterList">
          <TextInput
            label="Name"
            onBlur={(e) => setNameFilter(e.target.value)}
            className="question"
          />
          <SkillSelector
            setSkills={(value) => setSkillFilter(value)}
            skills={skillFilter}
            optional={true}
          />
          <NativeSelect
            label="Competitveness"
            data={[
              { value: "", label: "Any" },
              { value: "learn", label: "Here to learn and have fun" },
              { value: "win", label: "Here to win" },
            ]}
            value={competitiveness}
            onChange={(value) => setCompetitiveness(value.target.value)}
            className="question"
          />
          <NumberInput
            defaultValue={0}
            label="Team Size (0 for any)"
            min={0}
            max={process.env.REACT_APP_MAX_TEAM_SIZE}
            step={1}
            value={sizeFilter}
            onChange={(value) => setSizeFilter(value)}
            className="question"
          />
          <TextInput
            label="Member name"
            onBlur={(e) => setMemberFilter(e.target.value)}
            className="question"
          />
          <SkillSelector
            setSkills={(value) => setDesiredSkillFilter(value)}
            skills={desiredSkillFilter}
            optional={true}
            label="Desired Skills"
          />
        </div>
        {otherTeams.map((team, index) => {
          const teamObj = {
            leader: team.profiles[team.leader].name,
            users: team.users.map((e) => team.profiles[e].name),
            ...team.profile,
          };
          return (
            <Collapsible
              key={index}
              title={team.profile.name ?? `${teamObj.leader}'s team`}
            >
              {team._id !== props.team._id &&
                ![
                  ...outgoingMRs.map((req) => req.requestedTeam._id),
                  ...ingoingMRs.map((req) => req.requestingTeam._id),
                ].includes(team._id) &&
                canMerge(team, props.team) && (
                  <button
                    className="chat-button"
                    onClick={() => requestMerge(team)}
                  >
                    Request to Merge
                  </button>
                )}
              {team._id !== props.team._id && (
                <button
                  className="chat-button"
                  onClick={() => messageTeam(team)}
                >
                  Message
                </button>
              )}
              <UserToParagraph
                user={teamObj}
                hideKeys={[
                  "_id",
                  "name",
                  "displayTeamProfile",
                  "profilePictureUrl",
                  "githubFinished",
                  "github",
                  "experience",
                  "linkedin",
                  "school",
                  "portfolio",
                ]}
              />
            </Collapsible>
          );
        })}
        <Pagination page={page} setPage={setPage} pages={pages} />
      </div>
    </div>
  );
}

TeamList.propTypes = {
  team: PropTypes.object,
  setTeam: PropTypes.func,
  userID: PropTypes.string,
  setTeamID: PropTypes.func,
};

export default TeamList;
