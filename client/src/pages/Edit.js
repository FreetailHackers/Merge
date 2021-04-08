import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser, setCurrentUser } from "../actions/authActions";
import axios from "axios";
import userProfileFields from "../content/userProfileFields.json"
import { RiLoader3Line } from "react-icons/ri";

import './Edit.css';

class Edit extends Component {
  
  handleSubmit = (event) => {
    event.preventDefault()
    this.setState({userProfile: {...this.state.userProfile, [event.target.name]: event.target.value}, saved: false}, () => {
      this.props.setCurrentUser(this.props.userID, {...this.props.user, profile: this.state.userProfile})
      axios.post(process.env.REACT_APP_API_URL + "user/", {
        auth: this.props.auth,
        user: this.props.user
      }).then(res => {
        this.setState({
          saved: true
        })
      });
    });
  }

  handleNewProfilePicture = (event) => {
    event.preventDefault();
    
    const file = event.target.files[0];
    const data = new FormData();
		data.append('file', file);

    this.setState({saved: false}, () => {
      axios.post(process.env.REACT_APP_API_URL + "user/profile-picture", {
        auth: this.props.auth,
        user: this.props.user,
        data
      }).then(res => {
        this.setState({ saved: true, profilePictureUrl: res.data.url })
        this.props.setCurrentUser(this.props.userID, {...this.props.user, profilePictureUrl: res.data.url})
      });
    });
  }

  constructor(props){
    super(props)
    this.state = {userProfile: {...this.props.user.profile}, saved: true, profilePictureUrl: this.props.user.profilePictureUrl}
    this.baseState = {userProfile: {...this.props.user.profile}, profilePictureUrl: this.props.user.profilePictureUrl}
  }

  cancelEdit = e => {
    e.preventDefault();
    this.setState(this.baseState)
    this.props.setCurrentUser(this.props.userID, {...this.props.user, profile: this.baseState.userProfile, profilePictureUrl: this.state.baseState.profilePictureUrl})
    axios.post(process.env.REACT_APP_API_URL + "user/", {
      auth: this.props.auth,
      user: this.props.user
    }).then(res => {
      this.props.history.push('/dashboard')
    });
  };

  doneEdit = e => {
    this.props.history.push('/dashboard');
  }

  capitalizeFirstLetter = (str) => str.substring(0, 1).toUpperCase() + str.substring(1)

  render() {
    return (
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
                  {this.capitalizeFirstLetter(v)}:
                </label>
                <input 
                  name={v} 
                  placeholder={this.capitalizeFirstLetter(v)}
                  value={this.state.userProfile[v] || ""} 
                  onChange={this.handleSubmit}
                  type="text"
                />
              </div>
            ))
          }
        </form>
        {
          this.state.saved
          ? <button onClick={this.doneEdit} className='done'>Done</button>
          : <button className='loading'><RiLoader3Line className='spin-animation' /> saving...</button>
        }
        <button onClick={this.cancelEdit} className='cancel'>Cancel</button>
      </section>
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
