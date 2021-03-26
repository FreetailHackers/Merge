import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../actions/authActions";
import { Link } from "react-router-dom";

class Dashboard extends Component {

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  render() {
    return (
      <section>
        <p>Welcome home, {JSON.stringify(this.props.user)}</p>
        <Link to="/swipe">Find team members</Link>
        <Link to="/edit">Edit profile</Link>
        <button onClick={this.onLogoutClick}>Logout</button>
      </section>
    );
  }
}

Dashboard.propTypes = {
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
)(Dashboard);
