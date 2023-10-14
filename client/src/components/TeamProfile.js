import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import SwipeProfile from "./SwipeProfile";
import SkillSelector from "./SkillSelector";
import { roles } from "../data/roles";

import {
  TextInput,
  MultiSelect,
  Radio,
  Checkbox,
  Textarea,
} from "@mantine/core";

const requiredFields = [
  "name",
  "bio",
  "skills",
  "desiredSkills",
  "competitiveness",
  "desiredRoles",
];

function TeamProfile(props) {
  const socket = useOutletContext();
  const [saved, setSaved] = useState(false);
  const { team, setTeam, userID } = props;
  const teamProfile = team.profile;

  useEffect(() => {
    function profileUpdatedWS(data) {
      setSaved(true);
    }
    socket.on("profile-updated", profileUpdatedWS);
    return () => {
      socket.off("profile-updated", profileUpdatedWS);
    };
  }, [socket]);

  const MAX_TEAM_SIZE = process.env.REACT_APP_MAX_TEAM_SIZE;

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
    axios
      .get(process.env.REACT_APP_API_URL + `/api/teams/userTeam/${userID}`)
      .then((res) => {
        setTeam(res.data);
      });
    setSaved(true);
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

  return (
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
              error={
                !teamProfile.name || teamProfile.name.length === 0
                  ? "Required"
                  : ""
              }
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
              error={
                !teamProfile.bio || teamProfile.bio.length === 0
                  ? "Required"
                  : ""
              }
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
                !teamProfile.competitiveness ||
                teamProfile.competitiveness.length === 0
                  ? "Required"
                  : ""
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
              skills={teamProfile.desiredSkills}
              setSkills={(value) => setProfile("desiredSkills", value)}
            />
            <MultiSelect
              data={roles}
              label="What roles are you still looking to fill?"
              placeholder="Frontend, Backend, Full Stack, etc."
              value={teamProfile.desiredRoles}
              onChange={(value) => setProfile("desiredRoles", value)}
              className="question"
              required
              error={
                !teamProfile.desiredRoles ||
                teamProfile.desiredRoles.length === 0
                  ? "Required"
                  : ""
              }
            />
            {!saved && (
              <p
                style={{
                  fontSize: "15.4px",
                  color: "#900",
                  marginTop: "0.5em",
                }}
              >
                {" "}
                Unsaved Changes
              </p>
            )}
          </form>
          <button
            onClick={handleSubmit}
            disabled={
              !requiredFields.every(
                (e) => teamProfile[e] && teamProfile[e].length > 0
              )
            }
            className="action"
            id="save"
          >
            Save
          </button>
          <button onClick={cancelEdit} className="action" id="cancel">
            Cancel
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
  );
}

TeamProfile.propTypes = {
  team: PropTypes.object,
  setTeam: PropTypes.func,
  userID: PropTypes.string,
};

export default TeamProfile;
