import React, { Component, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser, setCurrentUser } from "../actions/authActions";
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

class Edit extends Component {
  //frontend for updating
  handleSubmit = async (event) => {
    event.persist();
    event.preventDefault();
    const data = {
      id: this.props.userID.id,
      update: {
        name: this.state.userProfile.name,
        profile: {},
      },
    };
    for (const prop in this.state.userProfile) {
      if (prop !== "name") {
        data.update.profile[prop] = this.state.userProfile[prop];
      }
    }

    // data.update.profile.profilePictureUrl = this.state.profilePictureUrl;
    axios
      .post(process.env.REACT_APP_API_URL + "/api/users/update", data)
      .then((res) => {
        this.setState({
          saved: true,
        });
      });
  };

  componentDidMount() {
    var queryParamters = {
      start: 0,
      limit: 0,
      filters: {
        _id: this.props.userID.id,
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
        this.setState({
          userProfile: data,
          // profilePictureUrl: data.profilePictureUrl,
        });
      });
  }

  // handleNewProfilePicture = async (file) => {
  //   const fd = new FormData();
  //
  //   // Setting up S3 upload parameters for folder upload
  //   fd.append("file_name", this.props.userID.id + "/" + file.name);
  //   fd.append("file", file);
  //
  //   if (file.size > 10_000_000) {
  //     this.setState({ oversizedFile: true });
  //     return;
  //   } else {
  //     this.setState({ oversizedFile: false });
  //   }
  //
  //   await axios
  //     .post(process.env.REACT_APP_API_URL + "/api/users/profile-picture", fd, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     })
  //     .then(async (res) => {
  //       this.setState({
  //         profilePictureUrl: res.data.url,
  //         oversizedFile: false,
  //       });
  //       this.props.setCurrentUser(this.props.userID, {
  //         ...this.props.user,
  //         profilePictureUrl: res.data.url,
  //       });
  //     })
  //     .catch(() => {
  //       this.setState({ oversizedFile: true });
  //     });
  // };

  constructor(props) {
    super(props);
    this.state = {
      userProfile: { ...this.props.user.profile },
      saved: true,
      // profilePictureUrl: this.props.user.profilePictureUrl,
    };
    this.baseState = {
      userProfile: { ...this.props.user.profile },
      // profilePictureUrl: this.props.user.profilePictureUrl,
    };
  }

  cancelEdit = async (e) => {
    e.preventDefault();
    this.setState(this.baseState);
    this.props.setCurrentUser(this.props.userID, {
      ...this.props.user,
      profile: this.baseState.userProfile,
      // profilePictureUrl: this.baseState.profilePictureUrl,
    });

    axios
      .post(process.env.REACT_APP_API_URL + "user/", {
        auth: this.props.auth,
        user: this.props.user,
      })
      .then(() => {});
  };

  setProfile = (key, value) => {
    this.setState({
      userProfile: {
        ...this.state.userProfile,
        [key]: value,
      },
    });
  };

  Demo = () => {
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
      { value: "postgresql", label: "PostGreSQL" },
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
        value={this.state.userProfile.skills}
        onChange={(value) => this.setProfile("skills", value)}
        className="question"
        error={this.state.userProfile.skills?.length === 0 ? "Required" : ""}
        required
      />
    );
  };
  render() {
    return (
      <div className="profile-container">
        <div className="profile-child">
          <section id="settings">
            <form>
              <Checkbox
                label="Ready to swipe?"
                onChange={(e) =>
                  this.setProfile("swipeReady", e.target.checked)
                }
                checked={this.state.userProfile.swipeReady}
                className="question"
              />
              <TextInput
                label="Name"
                placeholder="Your full name"
                error={
                  this.state.userProfile.name?.length === 0 ? "Required" : ""
                }
                value={this.state.userProfile.name}
                onChange={(e) => this.setProfile("name", e.target.value)}
                className="question"
                required
              />
              <TextInput
                label="School"
                placeholder="University of Texas at Austin"
                value={this.state.userProfile.school}
                onChange={(e) => this.setProfile("school", e.target.value)}
                className="question"
              />
              <TextInput
                label="Major"
                placeholder="Computer Science"
                value={this.state.userProfile.major}
                onChange={(e) => this.setProfile("major", e.target.value)}
                className="question"
              />
              <TextInput
                label="Class"
                placeholder="2024"
                value={this.state.userProfile.class}
                onChange={(e) => this.setProfile("class", e.target.value)}
                className="question"
              />
              <Textarea
                placeholder="What can you bring to this hackathon and what do you want to get out of it?"
                label="Bio"
                value={this.state.userProfile.intro}
                autosize
                error={
                  this.state.userProfile.intro?.length === 0 ? "Required" : ""
                }
                onChange={(e) => this.setProfile("intro", e.target.value)}
                className="question"
                required
              />
              {
                //   <FileInput
                //   label="Profile Picture"
                //   placeholder="Upload JPG/PNG/GIF, up to 10 MB"
                //   accept="image/jpg, image/png, image/gif"
                //   error={
                //     this.state.oversizedFile
                //       ? "File must be 10 MB or smaller"
                //       : ""
                //   }
                //   onChange={this.handleNewProfilePicture}
                //   className="question"
                // />
              }
              <TextInput
                label="Portfolio"
                placeholder="https://danielzting.github.io"
                value={this.state.userProfile.portfolio}
                onChange={(e) => this.setProfile("portfolio", e.target.value)}
                className="question"
              />
              <TextInput
                label="Github Username"
                placeholder="danielzting"
                value={this.state.userProfile.github}
                onChange={(e) => this.setProfile("github", e.target.value)}
                className="question"
              />
              <TextInput
                label="LinkedIn"
                placeholder="https://www.linkedin.com/in/danielzting/"
                id="linkedin"
                value={this.state.userProfile.linkedin}
                onChange={(e) => this.setProfile("linkedin", e.target.value)}
                className="question"
              />
              <NumberInput
                defaultValue={12}
                placeholder="Any integer between 1-24 inclusive"
                id="hours"
                label="How many hours are you willing to work?"
                min={1}
                max={24}
                stepHoldDelay={500}
                stepHoldInterval={100}
                value={this.state.userProfile.hours}
                onChange={(value) => this.setProfile("hours", value)}
                className="question"
              />
              <this.Demo />
              <NativeSelect
                label="Years of coding experience"
                placeholder="Pick one"
                data={[
                  { value: "<1", label: "Less than one year" },
                  { value: "1-3", label: "One to three years" },
                  { value: ">3", label: "Over three years" },
                ]}
                value={this.state.userProfile.experience}
                onChange={(value) =>
                  this.setProfile("experience", value.target.value)
                }
                className="question"
                error={
                  this.state.userProfile.experience?.length === 0
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
                value={this.state.userProfile.competitiveness}
                onChange={(value) => this.setProfile("competitiveness", value)}
                required
                error={
                  this.state.userProfile.competitiveness?.length === 0
                    ? "Required"
                    : ""
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
                value={this.state.userProfile.categories}
                onChange={(value) => this.setProfile("categories", value)}
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
                value={this.state.userProfile.roles}
                onChange={(value) => this.setProfile("roles", value)}
                className="question"
              />
            </form>
            <button
              onClick={this.handleSubmit}
              disabled={
                this.state.userProfile.name?.length === 0 ||
                this.state.userProfile.intro?.length === 0 ||
                this.state.userProfile.skills?.length === 0 ||
                this.state.userProfile.experience?.length === 0 ||
                this.state.userProfile.competitiveness?.length === 0
              }
              className="action"
              id="save"
            >
              Save
            </button>
            <button onClick={this.cancelEdit} className="action" id="cancel">
              <Link to="/dashboard">Cancel</Link>
            </button>
          </section>
        </div>
        <div className="profile-child">
          <SwipeProfile
            name={this.state.userProfile.name}
            school={this.state.userProfile.school}
            intro={this.state.userProfile.intro}
            linkedin={this.state.userProfile.linkedin}
            github={this.state.userProfile.github}
            // profilePictureUrl={this.state.profilePictureUrl}
          />
        </div>
      </div>
    );
  }
}

Edit.propTypes = {
  auth: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  userID: PropTypes.object.isRequired,
  setCurrentUser: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  user: state.auth.user,
  userID: state.auth.userID,
});

export default connect(mapStateToProps, { logoutUser, setCurrentUser })(Edit);
