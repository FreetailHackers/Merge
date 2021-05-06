import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser, setCurrentUser } from "../actions/authActions";
import axios from "axios";
import userProfileFields from "../content/userProfileFields.json"
import SwipeProfile from "../components/SwipeProfile";
import { startCase } from "lodash";
import { Link } from 'react-router-dom';

import './Edit.css';

class Edit extends Component {
  
  handleSubmit = (event) => {
    event.preventDefault()
    this.setState({userProfile: {...this.state.userProfile, [event.target.name]: event.target.value}}, () => {
      this.props.setCurrentUser(this.props.userID, {...this.props.user, profile: this.state.userProfile})
      axios.post(process.env.REACT_APP_API_URL + "user/", {
        auth: this.props.auth,
        user: this.props.user
      });
    });
  }

  handleNewProfilePicture = (event) => {
    event.preventDefault();
    
    const file = event.target.files[0];
    const data = new FormData();
		data.append('file', file);

    axios.post(process.env.REACT_APP_API_URL + "user/profile-picture", {
      auth: this.props.auth,
      user: this.props.user,
      data
    }).then(res => {
      this.setState({profilePictureUrl: res.data.url })
      this.props.setCurrentUser(this.props.userID, {...this.props.user, profilePictureUrl: res.data.url})
    });
  }

  constructor(props){
    super(props)
    this.state = {userProfile: {...this.props.user.profile}, profilePictureUrl: this.props.user.profilePictureUrl}
    this.baseState = {userProfile: {...this.props.user.profile}, profilePictureUrl: this.props.user.profilePictureUrl}
  }

  cancelEdit = e => {
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
            </form>
              <button onClick={this.handleSubmit} className='save'>Save</button>
              <button onClick={this.cancelEdit} className='cancel'>
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
