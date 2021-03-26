import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../actions/authActions";
import { Link } from "react-router-dom";

class Edit extends Component {

  handleSubmit = (event) => {
    event.preventDefault()
    this.props.user.profile.name = event.target[0].value
    this.props.user.profile.school = event.target[1].value
    this.props.user.profile.major = event.target[2].value
    this.props.user.profile.class = event.target[3].value
    this.props.user.profile.skills = event.target[4].value
    this.props.user.profile.experience = event.target[5].value
    this.props.user.profile.intro = event.target[6].value
    this.props.history.push('/dashboard')
  }

  render() {
    return (
      <section>
        <p>Welcome home, {JSON.stringify(this.props.user)}</p>
        <form onSubmit={this.handleSubmit}>
              <label>
                Name:
                <input defaultValue = {this.props.user.profile.name} type="text"/>
              </label>
              <label>
                School:
                <input type="text"/>
              </label>
              <label>
                Major:
                <input type="text"/>
              </label>
              <label>
                Class:
                <input type="text"/>
              </label>
              <label>
                Skills:
                <input type="text"/>
              </label>
              <label>
                Experience Level:
                <input type="text"/>
              </label>
              <label>
                About:
                <input type="text"/>
              </label>
              <button type = "submit">Save</button>
            </form>

        <Link to="/dashboard">Cancel</Link>
        
      </section>
    );
  }
}

Edit.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  logoutUser: PropTypes.func.isRequired,
  auth: state.auth,
  user: state.auth.user,
});

export default connect(
  mapStateToProps,
  { logoutUser }
)(Edit);
