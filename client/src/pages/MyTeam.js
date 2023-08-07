import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import SwipeProfile from "../components/SwipeProfile";
import { Link } from "react-router-dom";
import SkillSelector from "../components/SkillSelector";
import TeamInfoCard from "../components/TeamInfoCard";
import { categories } from "../data/categories";
import { useOutletContext } from "react-router-dom";

// FileInput,
import {
  TextInput,
  MultiSelect,
  Radio,
  Checkbox,
  Textarea,
} from "@mantine/core";

import "./Edit.css";

function MyTeam(props) {
  //frontend for updating
  const MAX_TEAM_SIZE = process.env.REACT_APP_MAX_TEAM_SIZE;
  const socket = useOutletContext();
  const [team, setTeam] = useState(null);
  const teamProfile = team?.profile;
  const { userID } = props;
  const [saved, setSaved] = useState(false);
  const [otherTeams, setOtherTeams] = useState([]);
  const [ingoingMRs, setIngoingMRs] = useState([]);
  const [outgoingMRs, setOutgoingMRs] = useState([]);
  const [showProfile, setShowProfile] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const baseProfile = team?.profile;

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + `/api/teams/userTeam/${userID}`)
      .then((res) => {
        setTeam(res.data);
      });
    axios
      .get(
        process.env.REACT_APP_API_URL + "/api/teams/mergeRequestsInfo/" + userID
      )
      .then((res) => {
        setIngoingMRs(res.data.ingoing);
        setOutgoingMRs(res.data.outgoing);
      });
    axios.get(process.env.REACT_APP_API_URL + "/api/teams/list").then((res) => {
      setOtherTeams((prev) => {
        if (prev.length > 0) {
          return [...res.data.filter((e) => !e.users.includes(userID))];
        }
        return prev;
      });
    });
  }, [userID]);

  const connected = socket?.connected;

  useEffect(() => {
    if (connected && team) {
      socket.emit("join-room", { id: team._id });
    }

    return () => {
      if (connected && team) {
        socket.emit("leave-room", { id: team._id });
      }
    };
  }, [socket, connected, userID, team]);

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
      setTeam(data.newTeam);
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

    socket.on("teammate-left", teammateLeftWS);
    socket.on("merge-requested", mergeRequestedWS);
    socket.on("merge-accepted", mergeAcceptedWS);
    socket.on("merge-rejected", mergeRejectedWS);
    socket.on("request-cancelled", requestCancelledWS);
    socket.on("profile-updated", profileUpdatedWS);

    return () => {
      socket.off("teammate-left", teammateLeftWS);
      socket.off("merge-requested", mergeRequestedWS);
      socket.off("merge-accepted", mergeAcceptedWS);
      socket.off("merge-rejected", mergeRejectedWS);
      socket.off("request-cancelled", requestCancelledWS);
      socket.off("profile-updated", profileUpdatedWS);
    };
  }, [socket, team, setTeam, userID]);

  const handleSubmit = async (event) => {
    event.persist();
    event.preventDefault();
    await axios.post(
      process.env.REACT_APP_API_URL + "/api/teams/updateProfile",
      {
        newProfile: { ...teamProfile },
      }
    );
    socket.emit("update-profile", {
      teamID: team._id,
      profile: teamProfile,
    });
    setTeam((prev) => ({ ...prev, profile: teamProfile }));
    setSaved(true);
  };

  const cancelEdit = async (e) => {
    e.preventDefault();
    setTeam((prev) => ({
      ...prev,
      profile: { ...baseProfile },
    }));

    setProfile({ ...baseProfile });
  };

  const setProfile = (key, value) => {
    setTeam((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [key]: value,
      },
    }));
    setSaved(false);
  };

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
        setOutgoingMRs((prev) => [...prev, mrObj]);
        mrObj.requestingTeam = team;
        socket.emit("request-merge", mrObj);
      });
  }

  function acceptRequest(teamID) {
    axios
      .post(process.env.REACT_APP_API_URL + `/api/teams/acceptMerge/${teamID}`)
      .then((res) => {
        setTeam(res.data);
        socket.emit("accept-merge", { teamID: teamID, newTeam: res.data });
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
        setOutgoingMRs((prev) => [
          ...prev.filter((e) => e.requestedTeam._id !== teamID),
        ]);
        socket.emit("cancel-request", {
          cancellingTeamID: team._id,
          requestedTeamID: teamID,
        });
      });
  }

  function leaveTeam() {
    axios
      .post(process.env.REACT_APP_API_URL + `/api/teams/leaveTeam`)
      .then((res) => {
        setTeam((prev) => {
          socket.emit("leave-team", { teamID: prev._id, userID: userID });
          return res.data;
        });
      });
  }

  function canMerge(team1, team2) {
    return team1.users.length + team2.users.length <= MAX_TEAM_SIZE;
  }

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
            ≡
          </button>
        </div>
      )}
      {team.users.length > 1 && (
        <div
          className={`flexRow hideDiv ${showProfile ? "" : "hideDivClosed"}`}
        >
          <h3>Profile</h3>
          <button onClick={() => setShowProfile((prev) => !prev)}>
            {showProfile ? "Hide" : "Show"}
          </button>
        </div>
      )}
      {team.users.length > 1 && showProfile && (
        <div className="profile-container">
          <div className="profile-child">
            <section id="settings">
              <form>
                {team.users.length < MAX_TEAM_SIZE && (
                  <Checkbox
                    label="Looking for teammates?"
                    onChange={(e) =>
                      setProfile("displayTeamProfile", e.target.checked)
                    }
                    checked={teamProfile.displayTeamProfile}
                    className="question"
                  />
                )}
                <TextInput
                  label="Name"
                  placeholder="Your team's name"
                  error={teamProfile.name?.length === 0 ? "Required" : ""}
                  value={teamProfile.name}
                  onChange={(e) => setProfile("name", e.target.value)}
                  className="question"
                  required
                />
                <Textarea
                  placeholder="About your team"
                  label="Bio"
                  value={teamProfile.bio}
                  autosize
                  error={teamProfile.bio?.length === 0 ? "Required" : ""}
                  onChange={(e) => setProfile("bio", e.target.value)}
                  className="question"
                  required
                />
                <Radio.Group
                  label="How competitive are you?"
                  className="question"
                  orientation="vertical"
                  spacing="xs"
                  value={teamProfile.competitiveness}
                  onChange={(value) => setProfile("competitiveness", value)}
                  required
                  error={
                    teamProfile.competitiveness?.length === 0 ? "Required" : ""
                  }
                >
                  <Radio
                    value="learn"
                    label="We're just here to learn and have fun!"
                  />
                  <Radio
                    value="win"
                    label="We're here to win and want teammates who are aiming to win as well!"
                  />
                </Radio.Group>
                <SkillSelector
                  label={"Team's Skills"}
                  skills={teamProfile.skills}
                  setSkills={(value) => setProfile("skills", value)}
                />
                <SkillSelector
                  label={"Desired Skills"}
                  skills={teamProfile.wantedSkills}
                  setSkills={(value) => setProfile("wantedSkills", value)}
                />
                <MultiSelect
                  data={categories}
                  label="What categories are you planning to submit to?"
                  placeholder="May be left blank if undecided"
                  value={teamProfile.categories}
                  onChange={(value) => setProfile("categories", value)}
                  className="question"
                />
                {saved && (
                  <p style={{ fontSize: "15.4px", color: "green" }}>
                    {" "}
                    Save Successful
                  </p>
                )}
              </form>
              <button
                onClick={handleSubmit}
                disabled={
                  teamProfile.name?.length === 0 ||
                  teamProfile.bio?.length === 0 ||
                  teamProfile.skills?.length === 0 ||
                  teamProfile.competitiveness?.length === 0
                }
                className="action"
                id="save"
              >
                Save
              </button>
              <button onClick={cancelEdit} className="action" id="cancel">
                <Link to="/dashboard">Cancel</Link>
              </button>
            </section>
          </div>
          <div className="profile-child">
            <SwipeProfile
              profile={teamProfile}
              name={teamProfile.name}
              userProfiles={team.profiles}
              isAlone={false}
              // profilePictureUrl={profilePictureUrl}
            />
          </div>
        </div>
      )}
      <div className="flexColumn teamRequests">
        {team.users.length > 1 && (
          <div className="flexColumn member-list">
            <h3>Members</h3>
            {/*<SwipeProfile />*/}
            {team &&
              Object.keys(team.profiles).map((e, i) => (
                <div key={i}>
                  <p>
                    {team.profiles[e].name}{" "}
                    {e === team.leader ? "(Leader)" : ""}{" "}
                    {e === userID ? "(You)" : ""}
                  </p>
                </div>
              ))}
          </div>
        )}
        <div></div>
        <div
          className={`flexRow hideDiv ${showProfile ? "" : "hideDivClosed"}`}
        >
          <h3>Requests</h3>
          <button onClick={() => setShowRequests((prev) => !prev)}>
            {showRequests ? "Hide" : "Show"}
          </button>
        </div>
        {showRequests && (
          <div className="merge-requests">
            <div className="mrColumn flexColumn">
              <h4>Ingoing</h4>
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
                    showButtons={team.leader === userID}
                  />
                ))}
            </div>
            <div className="mrColumn flexColumn">
              <h4>Outgoing</h4>
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
                    showButtons={team.leader === userID}
                  />
                ))}
            </div>
          </div>
        )}
        <div className="flexColumn view-other-teams">
          <h3>Grow your Team</h3>
          {/* List of other teams, where you can send out invites to them*/}
          <button onClick={findTeams}>See other teams</button>

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
        {team.users.length > 1 && (
          <div className="flexColumn">
            <h3>Leave team</h3>
            {userID === team.leader && (
              <div>
                <h4>Designate a new leader first:</h4>
              </div>
            )}
            {userID !== team.leader && (
              <button onClick={leaveTeam}>Leave</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

MyTeam.propTypes = {
  userID: PropTypes.string.isRequired,
  wideScreen: PropTypes.bool,
  flipDisplaySidebar: PropTypes.func,
};

export default MyTeam;
