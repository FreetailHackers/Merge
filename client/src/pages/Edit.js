import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import SwipeProfile from "../components/SwipeProfile";
import { Link } from "react-router-dom";

// FileInput,
import {
  NumberInput,
  TextInput,
  MultiSelect,
  Radio,
  Checkbox,
  Textarea,
  NativeSelect,
} from "@mantine/core";

import "./Edit.css";

const Demo = (props) => {
  const [data, setData] = useState([
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
    { value: "c++", label: "C++" },
    { value: "c#", label: "C#" },
    { value: "rust", label: "Rust" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "go", label: "Go" },
    { value: "lua", label: "Lua" },
    { value: "swift", label: "Swift" },
    { value: "php", label: "PhP" },
    { value: "react", label: "React" },
    { value: "reactnative", label: "React Native" },
    { value: "express", label: "Express" },
    { value: "mongodb", label: "MongoDB" },
    { value: "postgresql", label: "PostgreSQL" },
    { value: "prisma", label: "Prisma" },
    { value: "nextjs", label: "NextJS" },
    { value: "sveltejs", label: "SvelteJS" },
    { value: "vuejs", label: "VueJS" },
    { value: "angularjs", label: "AngularJS" },
    { value: "spring", label: "Spring" },
    { value: "flutter", label: "Flutter" },
    { value: "flask", label: "Flask" },
    { value: "django", label: "Django" },
    { value: "swiftui", label: "SwiftUI" },
    { value: "laravel", label: "Laravel" },
  ]);

  return (
    <MultiSelect
      label="Skills"
      data={data}
      searchable
      creatable
      clearable
      getCreateLabel={(query) => `+ Create ${query}`}
      onCreate={(query) => {
        const item = { value: query, label: query };
        setData((current) => [...current, item]);
        return item;
      }}
      placeholder="Python, Java, C, etc."
      nothingFound="Nothing found"
      value={props.userProfile.skills}
      onChange={(value) => props.setProfile("skills", value)}
      className="question"
      error={props.userProfile.skills?.length === 0 ? "Required" : ""}
      required
    />
  );
};

Demo.propTypes = {
  userProfile: PropTypes.object,
  setProfile: PropTypes.func,
};

function Edit(props) {
  //frontend for updating

  const [userProfile, setUserProfile] = useState({ ...props.user.profile });
  const [saved, setSaved] = useState(false);
  const [portfolioRegex, setPortfolioRegex] = useState(true);
  const [linkedinRegex, setLinkedinRegex] = useState(true);
  const baseProfile = { ...props.user.profile };

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
      id: props.userID.id,
      update: {
        name: userProfile.name,
        profile: {},
      },
    };
    for (const prop in userProfile) {
      if (prop !== "name") {
        data.update.profile[prop] = userProfile[prop];
      }
    }

    // data.update.profile.profilePictureUrl = profilePictureUrl;
    axios
      .post(process.env.REACT_APP_API_URL + "/api/users/update", data)
      .then((res) => {
        setSaved(true);
        setPortfolioRegex(true);
        setLinkedinRegex(true);
      });
  };

  useEffect(() => {
    var queryParamters = {
      start: 0,
      limit: 0,
      id: props.userID.id,
      filters: {
        _id: props.userID.id,
      },
    };
    axios
      .get(process.env.REACT_APP_API_URL + "/api/users/list", {
        params: queryParamters,
      })
      .then((res) => {
        const data = {
          name: res.data[0].name,
        };
        for (const prop in res.data[0].profile[0]) {
          if (prop !== "_id") {
            data[prop] = res.data[0].profile[0][prop];
          }
        }
        if (!("swipeReady" in data)) data.swipeReady = true;
        data.githubFinished = data.github;
        setUserProfile(data);
        // profilePictureUrl: data.profilePictureUrl,
      });
  }, [props.userID.id]);

  // handleNewProfilePicture = async (file) => {
  //   const fd = new FormData();
  //
  //   // Setting up S3 upload parameters for folder upload
  //   fd.append("file_name", props.userID.id + "/" + file.name);
  //   fd.append("file", file);
  //
  //   if (file.size > 10_000_000) {
  //     setState({ oversizedFile: true });
  //     return;
  //   } else {
  //     setState({ oversizedFile: false });
  //   }
  //
  //   await axios
  //     .post(process.env.REACT_APP_API_URL + "/api/users/profile-picture", fd, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     })
  //     .then(async (res) => {
  //       setState({
  //         profilePictureUrl: res.data.url,
  //         oversizedFile: false,
  //       });
  //       props.setCurrentUser(props.userID, {
  //         ...props.user,
  //         profilePictureUrl: res.data.url,
  //       });
  //     })
  //     .catch(() => {
  //       setState({ oversizedFile: true });
  //     });
  // };

  const cancelEdit = async (e) => {
    e.preventDefault();
    props.setCurrentUser(props.userID, {
      ...props.user,
      profile: baseProfile,
      // profilePictureUrl: baseprofilePictureUrl,
    });

    setProfile(baseProfile);
  };

  const setProfile = (key, value) => {
    setUserProfile({
      ...userProfile,
      [key]: value,
    });
    setSaved(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-child">
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
        <section id="settings">
          <form>
            <Checkbox
              label="Ready to swipe?"
              onChange={(e) => setProfile("swipeReady", e.target.checked)}
              checked={userProfile.swipeReady}
              className="question"
            />
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
              value={userProfile.intro}
              autosize
              error={userProfile.intro?.length === 0 ? "Required" : ""}
              onChange={(e) => setProfile("intro", e.target.value)}
              className="question"
              required
            />
            {
              //   <FileInput
              //   label="Profile Picture"
              //   placeholder="Upload JPG/PNG/GIF, up to 10 MB"
              //   accept="image/jpg, image/png, image/gif"
              //   error={
              //     oversizedFile
              //       ? "File must be 10 MB or smaller"
              //       : ""
              //   }
              //   onChange={handleNewProfilePicture}
              //   className="question"
              // />
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
            <Demo setProfile={setProfile} userProfile={userProfile} />
            <NativeSelect
              label="Years of coding experience"
              placeholder="Pick one"
              data={[
                { value: "<1", label: "Less than one year" },
                { value: "1-3", label: "One to three years" },
                { value: ">3", label: "Over three years" },
              ]}
              value={userProfile.experience}
              onChange={(value) => setProfile("experience", value.target.value)}
              className="question"
              error={userProfile.experience?.length === 0 ? "Required" : ""}
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
              error={
                userProfile.competitiveness?.length === 0 ? "Required" : ""
              }
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
            <MultiSelect
              // Placeholder data from HackTX 2021
              data={[
                { value: "overall", label: "Overall Best Hack" },
                { value: "google", label: "Best Use of Google Cloud" },
                {
                  value: "emotion",
                  label: "Best Real-Time Voice-Based Emotion Classifier",
                },
                { value: "solidity", label: "Best Crypto Solidity Project" },
                { value: "misc", label: "Miscellaneous MLH Prizes" },
              ]}
              label="What categories are you planning to submit to?"
              placeholder="May be left blank if undecided"
              value={userProfile.categories}
              onChange={(value) => setProfile("categories", value)}
              className="question"
            />
            <MultiSelect
              data={[
                { value: "frontend", label: "Frontend" },
                { value: "backend", label: "Backend" },
                { value: "fullstack", label: "Full Stack" },
                { value: "ml", label: "ML/Data Scientist" },
                { value: "mobile", label: "Mobile Dev" },
                { value: "design", label: "Design" },
              ]}
              label="What roles are you interested in?"
              placeholder="Pick as many as you want"
              value={userProfile.roles}
              onChange={(value) => setProfile("roles", value)}
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
              userProfile.name?.length === 0 ||
              userProfile.intro?.length === 0 ||
              userProfile.skills?.length === 0 ||
              userProfile.experience?.length === 0 ||
              userProfile.competitiveness?.length === 0
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
          name={userProfile.name}
          school={userProfile.school}
          intro={userProfile.intro}
          linkedin={userProfile.linkedin}
          github={userProfile.github}
          githubFinished={userProfile.githubFinished}
          // profilePictureUrl={profilePictureUrl}
        />
      </div>
    </div>
  );
}

Edit.propTypes = {
  auth: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  userID: PropTypes.object.isRequired,
  setCurrentUser: PropTypes.func.isRequired,
  wideScreen: PropTypes.bool,
  flipDisplaySidebar: PropTypes.func,
};

export default Edit;
