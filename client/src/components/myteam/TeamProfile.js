import React, { useState } from "react";
import PropTypes from "prop-types";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import SwipeProfile from "../SwipeProfile";
import SkillSelector from "../SkillSelector";
import { categories } from "../../data/categories";

import {
  TextInput,
  MultiSelect,
  Radio,
  Checkbox,
  Textarea,
} from "@mantine/core";

function TeamProfile(props) {
  const socket = useOutletContext();
  const { team, setTeam, saved, setSaved } = props;
  const baseProfile = { ...team?.profile };
  const [teamProfile, setTeamProfile] = useState(baseProfile);

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
    setTeam((prev) => ({
      ...prev,
      profile: { ...baseProfile },
    }));

    setTeamProfile({ ...baseProfile });
  };

  const setProfile = (key, value) => {
    setTeamProfile((prev) => ({
      ...prev,
      [key]: value,
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
  saved: PropTypes.bool,
  setSaved: PropTypes.func,
};

export default TeamProfile;
