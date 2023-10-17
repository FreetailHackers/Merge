import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import SwipeProfile from "../components/SwipeProfile";
import { Link } from "react-router-dom";
import SkillSelector from "../components/SkillSelector";
import { roles } from "../data/roles";

import {
  NumberInput,
  TextInput,
  MultiSelect,
  Radio,
  Textarea,
  NativeSelect,
  FileInput,
} from "@mantine/core";

const requiredFields = [
  "name",
  "bio",
  "skills",
  "experience",
  "competitiveness",
];

function UserProfile(props) {
  //frontend for updating
  const [saved, setSaved] = useState(false);
  const [portfolioRegex, setPortfolioRegex] = useState(true);
  const [linkedinRegex, setLinkedinRegex] = useState(true);
  const [oversizedFile, setOversizedFile] = useState(false);

  const baseProfile = (user) => ({
    ...user.profile,
    name: user.name,
    //competitiveness: user.competitiveness,
    githubFinished: !!user.profile.github,
  });
  const [userProfile, setUserProfile] = useState(baseProfile(props.user));
  const [underFiveSkills, setUnderFiveSkills] = useState(
    userProfile.skills.length <= 4
  );

  const handleSubmit = async (event) => {
    event.persist();
    event.preventDefault();
    if (userProfile?.portfolio) {
      const regex = /^https:\/\//; // regex for input starting with "https://"
      const inputValue = userProfile.portfolio;
      if (!regex.test(inputValue)) {
        setPortfolioRegex(false);
        return;
      }
    } else if (userProfile?.linkedin) {
      const regex = /^https:\/\//; // regex for input starting with "https://"
      const inputValue = userProfile.linkedin;
      if (!regex.test(inputValue)) {
        setLinkedinRegex(false);
        return;
      }
    }

    const data = {
      update: {
        name: userProfile.name,
        profile: {},
      },
    };
    for (const prop in userProfile) {
      if (prop !== "name" && prop !== "githubFinished") {
        data.update.profile[prop] = userProfile[prop];
      }
    }

    //data.update.profile.profilePictureUrl = profilePictureUrl;
    try {
      await axios.post(
        process.env.REACT_APP_API_URL + "/api/users/update",
        data
      );
      setSaved(true);
      setPortfolioRegex(true);
      setLinkedinRegex(true);
      props.setUser((prev) => ({
        ...prev,
        name: userProfile.name,
        profile: { ...userProfile },
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleNewProfilePicture = async (file) => {
    const fd = new FormData();
    //Setting up S3 upload parameters for folder upload
    fd.append("file_name", props.userID + "/" + file.name.replaceAll(" ", "_"));
    fd.append("file", file);
    const overSized = file.size > 10_000_000;
    setOversizedFile(overSized);
    if (overSized) return;
    await axios
      .post(process.env.REACT_APP_API_URL + "/api/users/profile-picture", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(async (res) => {
        setProfile("profilePictureUrl", res.data.url);
        /*props.setUser(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            profilePictureUrl: res.data.url,
          }
        }));*/
      })
      .catch(() => {
        setOversizedFile(true);
      });
  };

  const cancelEdit = async (e) => {
    e.preventDefault();
    setProfile(baseProfile(props.user));
  };

  const setProfile = (key, value) => {
    setUserProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (key === "skills") {
      setUnderFiveSkills(value.length <= 5);
    }
    setSaved(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-child">
        <section id="settings">
          <form>
            <TextInput
              label="Name"
              placeholder="Your full name"
              error={userProfile.name?.length === 0 ? "Required" : ""}
              value={userProfile.name}
              onChange={(e) => setProfile("name", e.target.value)}
              className="question"
              required
            />
            <TextInput
              label="School"
              placeholder="University of Texas at Austin"
              value={userProfile.school}
              onChange={(e) => setProfile("school", e.target.value)}
              className="question"
            />
            <TextInput
              label="Major"
              placeholder="Computer Science"
              value={userProfile.major}
              onChange={(e) => setProfile("major", e.target.value)}
              className="question"
            />
            <TextInput
              label="Class"
              placeholder="2024"
              value={userProfile.class}
              onChange={(e) => setProfile("class", e.target.value)}
              className="question"
            />
            <Textarea
              placeholder="What can you bring to this hackathon and what do you want to get out of it?"
              label="Bio"
              value={userProfile.bio}
              autosize
              error={
                !userProfile.bio || userProfile.bio.length === 0
                  ? "Required"
                  : ""
              }
              onChange={(e) => setProfile("bio", e.target.value)}
              className="question"
              required
            />
            {
              <FileInput
                label="Profile Picture"
                placeholder="Upload JPG/PNG/GIF, up to 10 MB"
                accept="image/jpg, image/png, image/gif"
                error={oversizedFile ? "File must be 10 MB or smaller" : ""}
                onChange={handleNewProfilePicture}
                className="question"
              />
            }
            <TextInput
              label="Portfolio"
              id="portfolio"
              placeholder="https://danielzting.github.io"
              value={userProfile.portfolio}
              onChange={(e) => setProfile("portfolio", e.target.value)}
              className="question"
            />
            {!portfolioRegex && (
              <p style={{ fontSize: "15.4px", color: "red" }}>
                {" "}
                Portfolio must start with &quot;https://&quot;
              </p>
            )}
            <TextInput
              label="Github Username"
              id="github"
              placeholder="danielzting"
              value={userProfile.github}
              onChange={(e) => setProfile("github", e.target.value)}
              onFocus={() => setProfile("githubFinished", false)}
              onBlur={() => setProfile("githubFinished", true)}
              className="question"
            />
            <TextInput
              label="LinkedIn"
              placeholder="https://www.linkedin.com/in/danielzting/"
              id="linkedin"
              value={userProfile.linkedin}
              onChange={(e) => setProfile("linkedin", e.target.value)}
              className="question"
            />

            {!linkedinRegex && (
              <p style={{ fontSize: "15.4px", color: "red" }}>
                {" "}
                LinkedIn must start with &quot;https://&quot;
              </p>
            )}
            <NumberInput
              defaultValue={12}
              placeholder="Any integer between 1-24 inclusive"
              id="hours"
              label="How many hours are you willing to work?"
              min={1}
              max={24}
              stepHoldDelay={500}
              stepHoldInterval={100}
              value={userProfile.hours}
              onChange={(value) => setProfile("hours", value)}
              className="question"
            />
            <SkillSelector
              skills={userProfile.skills}
              setSkills={(value) =>
                setProfile(
                  "skills",
                  value.length > 5 ? value.slice(0, 5 - value.length) : value
                )
              }
            />
            <MultiSelect
              data={roles}
              label="What roles are you interested in?"
              placeholder="Frontend, Backend, Full Stack, etc."
              value={userProfile.roles}
              onChange={(value) => setProfile("roles", value)}
              className="question"
              required
              error={
                !userProfile.roles || userProfile.roles.length === 0
                  ? "Required"
                  : ""
              }
            />
            <NativeSelect
              label="Years of coding experience"
              placeholder="Pick one"
              data={[
                { value: undefined, label: "Pick one" },
                { value: "<1", label: "Less than one year" },
                { value: "1-3", label: "One to three years" },
                { value: ">3", label: "Over three years" },
              ]}
              value={userProfile.experience}
              onChange={(value) => setProfile("experience", value.target.value)}
              className="question"
              error={
                !userProfile.experience || userProfile.experience.length === 0
                  ? "Required"
                  : ""
              }
              required
            />
            <Radio.Group
              label="How competitive are you?"
              className="question"
              orientation="vertical"
              spacing="xs"
              value={userProfile.competitiveness}
              onChange={(value) => setProfile("competitiveness", value)}
              required
              error={!userProfile.competitiveness ? "Required" : ""}
            >
              <Radio
                value="learn"
                label="I'm just here to learn and have fun!"
              />
              <Radio
                value="win"
                label="I'm here to win and want teammates who are aiming to win as well!"
              />
            </Radio.Group>
            {saved && (
              <p style={{ fontSize: "15.4px", color: "green" }}>
                {" "}
                Save Successful
              </p>
            )}
            {!underFiveSkills && (
              <p style={{ fontSize: "15.4px", color: "red" }}>
                {" "}
                Limit your number of skills to five.
              </p>
            )}
          </form>
          <button
            onClick={handleSubmit}
            disabled={
              !underFiveSkills ||
              !requiredFields.every(
                (e) => userProfile[e] && userProfile[e].length > 0
              )
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
          userProfiles={{[props.userID]: {name: userProfile.name, profilePictureUrl: userProfile.profilePictureUrl}}}
          profile={userProfile}
          name={userProfile.name}
          isAlone={true}
        />
      </div>
    </div>
  );
}

UserProfile.propTypes = {
  user: PropTypes.object,
  userID: PropTypes.string.isRequired,
  setUser: PropTypes.func.isRequired,
  wideScreen: PropTypes.bool,
  flipDisplaySidebar: PropTypes.func,
};

export default UserProfile;
