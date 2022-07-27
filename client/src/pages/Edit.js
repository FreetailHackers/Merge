import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser, setCurrentUser } from "../actions/authActions";
import axios from "axios";
import userProfileFields from "../content/userProfileFields.json"
import SwipeProfile from "../components/SwipeProfile";
import { startCase } from "lodash";
import { Link } from 'react-router-dom';
import { NumberInput, Select, MultiSelect, RadioGroup, Radio } from '@mantine/core';

import './Edit.css';

class Edit extends Component {

  handleSubmit = (event) => {
    event.preventDefault()
    this.setState({userProfile: {...this.state.userProfile} }, () => {
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

      data.update.profile.profilePictureUrl = this.state.profilePictureUrl
    
      console.log(data.update)
      axios.post(process.env.REACT_APP_API_URL + "/api/users/update", data).then(res => {
        this.setState({
          saved: true
        })
      });
    })
  }

  handleUpdate = (event) => {
    console.log("got to handleUpdate")
    event.preventDefault()
    this.setState({ userProfile: { ...this.state.userProfile, [event.target.name]: event.target.value }, bgColor: "red" }, () => {
      this.props.setCurrentUser(this.props.userID, { ...this.props.user, profile: this.state.userProfile })
      axios.post(process.env.REACT_APP_API_URL + "/auth/update", {
        auth: this.props.auth,
        id: this.props.userID,
        profile: this.state.userProfile
      }).then(res => {
        this.setState({
          saved: true
        })
      });
    });
  }

  componentDidMount() {
    console.log("got to componentDidMount")
    console.log(this.props.userID)
    var queryParamters = {
      start: 0,
      limit: 0,
      filters: {
        _id: this.props.userID.id,
      },
    };
    axios
    .get(process.env.REACT_APP_API_URL + "/api/users/list", { params: queryParamters})
    .then((res) => {
      console.log("line 81")
      console.log(res.data[0].profile[0])
      const data = {
        name: res.data[0].name,
      };
      for (const prop in res.data[0].profile[0]) {
        if (prop !== "_id") {
          data[prop] = res.data[0].profile[0][prop];
        }
      }
      this.setState({
        userProfile: data,
        profilePictureUrl: data.profilePictureUrl
      });
    });
  }

  handleNewProfilePicture = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const fd = new FormData();
    
    // Setting up S3 upload parameters for folder upload
    const folder_name = this.props.userID.id + "/"
    fd.append('folder_name', folder_name)
    fd.append('file_name', folder_name + file.name)
    fd.append('file', file);

    await axios.post(process.env.REACT_APP_API_URL + "/api/users/profile-picture", fd, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(async res => {
      this.setState({profilePictureUrl: res.data.url })
      this.props.setCurrentUser(this.props.userID, {...this.props.user, profilePictureUrl: res.data.url})
    });

   
  }


  constructor(props){
    super(props)
    this.state = {userProfile: {...this.props.user.profile}, saved: true, profilePictureUrl: this.props.user.profilePictureUrl}
    this.baseState = {userProfile: {...this.props.user.profile}, profilePictureUrl: this.props.user.profilePictureUrl}
  }

  cancelEdit = async e => {
    console.log('cancel edit')
    e.preventDefault();
    this.setState(this.baseState)
    this.props.setCurrentUser(this.props.userID, {...this.props.user, profile: this.baseState.userProfile, profilePictureUrl: this.baseState.profilePictureUrl})

    axios.post(process.env.REACT_APP_API_URL + "user/", {
      auth: this.props.auth,
      user: this.props.user
    }).then(() => {
   
    })
  };
     

  handleEdit = e => {
    this.setState({userProfile: {...this.state.userProfile, [e.target.name]: e.target.value}})
  }

  getOrEmptyString = (str) => str ? str : ""

  render() {
    return (
      <div className="profile-container">
        <div className="profile-child">
          <section id="settings">
            <form>
              <div>
                <label>Current Picture:</label>
                <img src={this.state.profilePictureUrl} alt='your profile' width="200" height="200" />
              </div>
              <div>
                <label>Upload Picture:</label>
                <input type="file" name="filename" onChange={this.handleNewProfilePicture} />
              </div>
              {
                userProfileFields.map((v, i) => (
                  <div key={i}>
                    <label>
                      {startCase(v)}:
                    </label>
                    <input
                      name={v}
                      placeholder={startCase(v)}
                      value={this.state.userProfile[v] || ""}
                      onChange={this.handleEdit}
                      type="text"
                    />
                  </div>
                ))
              }
              <NumberInput
                defaultValue={12}
                placeholder="Any integer between 1-24 inclusive"
                label="How many hours are you willing to work?"
                min={1}
                max={24}
                stepHoldDelay={500}
                stepHoldInterval={100}
              />
              <MultiSelect
                data={[
                  { value: 'python', label: 'Python' },
                  { value: 'java', label: 'Java' },
                  { value: 'c', label: 'C' },
                ]}
                label="Languages"
                searchable
                placeholder="Python, Java, C, etc."
                nothingFound="Nothing found"
              />
              <MultiSelect
                data={[
                  { value: 'react', label: 'React' },
                  { value: 'express', label: 'Express' },
                  { value: 'mongodb', label: 'MongoDB' },
                ]}
                label="Frameworks"
                searchable
                placeholder="React, Express, MongoDB, etc."
                nothingFound="Nothing found"
              />
              <Select
                label="Years of coding experience"
                placeholder="Pick one"
                data={[
                  { value: '<1', label: 'Less than one year' },
                  { value: '1-3', label: 'One to three years' },
                  { value: '>3', label: 'Over three years'},
                ]}
              />
              <RadioGroup
                label="How competitive are you?"
              >
                <Radio value="learn" label="I'm just here to learn and have fun!" />
                <Radio value="win" label="I'm here to win and want teammates who are aiming to win as well!" />
              </RadioGroup>
              <MultiSelect
                // Placeholder data from HackTX 2021
                data={[
                  { value: 'overall', label: 'Overall Best Hack' },
                  { value: 'google', label: 'Best Use of Google Cloud' },
                  { value: 'emotion', label: 'Best Real-Time Voice-Based Emotion Classifier' },
                  { value: 'solidity', label: 'Best Crypto Solidity Project' },
                  { value: 'misc', label: 'Miscellaneous MLH Prizes' },
                ]}
                label="What categories are you planning to submit to?"
                placeholder="If you haven't decided yet, you can leave this blank"
              />
              <MultiSelect
                data={[
                  { value: 'frontend', label: 'Frontend' },
                  { value: 'backend', label: 'Backend' },
                  { value: 'fullstack', label: 'Full stack' },
                  { value: 'ml', label: 'ML/Data scientist' },
                  { value: 'mobile', label: 'Mobile dev' },
                  { value: 'design', label: 'Design' },
                ]}
                label="What roles are you interested in?"
                placeholder="Pick as many as you want"
                searchable
                creatable
                getCreateLabel={query => `${query}`}
                onCreate={query => SVGMetadataElement(current => [...current, query])}
              />
            </form>
              <button onClick={this.handleSubmit} className='action' id='save'>Save</button>
              <button onClick={this.cancelEdit} className='action' id='cancel'>
                  <Link to="/dashboard">Cancel</Link>
              </button>
          </section>
        </div>
        <div className="profile-child">
            <SwipeProfile
                name={this.getOrEmptyString(this.state.userProfile.name)}
                school={this.getOrEmptyString(this.state.userProfile.school)}
                intro={this.getOrEmptyString(this.state.userProfile.intro)}
                profilePictureUrl={this.getOrEmptyString(this.state.profilePictureUrl)}
            />
        </div>
      </div>
    );
  }
}

Edit.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  user: state.auth.user,
  userID: state.auth.userID
});

export default connect(
  mapStateToProps,
  { logoutUser, setCurrentUser }
)(Edit);
