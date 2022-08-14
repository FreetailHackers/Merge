import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../actions/authActions";

import "./Dashboard.css";

class Dashboard extends Component {
  onLogoutClick = (e) => {
    e.preventDefault();
    this.props.logoutUser();
  };

  render() {
    const name = this.props.user.name;

    return (
      <section id="dashboard">
        <h1>Welcome home{name ? `, ${name}` : `!`}</h1>
        <p>Start finding your hackathon team members!</p>
        <div className="team-image">
          <div className="background" />
          <div className="main" />
          <div className="primary" />
          <div className="secondary" />
        </div>
      </section>
    );
  }
}

Dashboard.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  logoutUser: PropTypes.func.isRequired,
  auth: state.auth,
  user: state.auth.user,
});

export default connect(mapStateToProps, { logoutUser })(Dashboard);
