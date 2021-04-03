import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser, setCurrentUser } from "../actions/authActions";
import axios from "axios";
import userProfileFields from "../content/userProfileFields.json"

class Edit extends Component {
  
  handleSubmit = (event) => {
    event.preventDefault()
    this.setState({userProfile: {...this.state.userProfile, [event.target.name]: event.target.value}, bgColor: "red"}, () => {
      this.props.setCurrentUser(this.props.userID, {...this.props.user, profile: this.state.userProfile})
    })
  }

  handleUpdate = (event) => {
    event.preventDefault()
    this.setState({ userProfile: { ...this.state.userProfile, [event.target.name]: event.target.value }, bgColor: "red" }, () => {
      this.props.setCurrentUser(this.props.userID, { ...this.props.user, profile: this.state.userProfile })
      axios.post(process.env.REACT_APP_API_URL + "/auth/update", {
        auth: this.props.auth,
        id: this.props.userID,
        profile: this.state.userProfile
      }).then(res => {
        this.setState({
          bgColor: "green"
        })
      });
    })
  }

  cancelEdit = e => {
    e.preventDefault();
    this.setState(this.baseState)
    this.props.setCurrentUser(this.props.userID, { ...this.props.user, profile: this.baseState.userProfile })
    axios.post(process.env.REACT_APP_API_URL + "user/", {
      auth: this.props.auth,
      user: this.props.user
    }).then(res => {
      this.props.history.push('/dashboard')
    });
  };

  constructor(props){
    super(props)
    this.state = {userProfile: {...this.props.user.profile}, bgColor: ""}
    this.baseState = {userProfile: {...this.props.user.profile}}
  }

  capitalizeFirstLetter = (str) => str.substring(0, 1).toUpperCase() + str.substring(1)

  render() {
    return (
      <section>
        <p>Welcome home, {JSON.stringify(this.props.user)}</p>
        <form >
        {
          userProfileFields.map(v => (
            <label key={v}>
              {this.capitalizeFirstLetter(v)}:
              <input name={v} value={this.state.userProfile[v] || ""} onChange={this.handleSubmit} style={{backgroundColor: this.state.bgColor}} type="text"/>
            </label>
          ))
        }
        </form>
        <button onClick={this.cancelEdit}>Cancel</button>
        <button onClick={this.handleUpdate}>Update</button>
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
