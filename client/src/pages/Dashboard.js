import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../actions/authActions";

import "./Dashboard.css";

class Dashboard extends Component {
  onLogoutClick = (e) => {
    e.preventDefault();
    this.props.logoutUser();
    this.props.history.push("/login");
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
        <div className="forms">
          <div className="help">
            <h1>Help and Support</h1>
            <p>
              For help and support please reach out to a Freetail organizer.
            </p>
          </div>
          <div className="links">
            <span>
              <a href="https://forms.gle/ixKqxd8w9gmeGAYV6">Feedback</a> for
              Merge is greatly appreciated as it is in early access!{" "}
            </span>
            <br /> <br />
            <span>
              Have any issues with inappropriate behavior? Please let us know
              using this{" "}
              <a href="freetailhackers.com/htf-report">Misconduct Form</a>.
            </span>
          </div>
        </div>
      </section>
    );
  }
}

Dashboard.propTypes = {
  auth: PropTypes.object.isRequired,
  logoutUser: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  logoutUser: PropTypes.func.isRequired,
  auth: state.auth,
  user: state.auth.user,
});

export default connect(mapStateToProps, { logoutUser })(Dashboard);
