import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../actions/authActions";

class Dashboard extends Component {

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  render() {
    return (
      <section>
        <p>Welcome home, {JSON.stringify(this.props.user)}</p>
        <button onClick={this.onLogoutClick}>Logout</button>
      </section>
    );
  }
}

Home.propTypes = {
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
)(Home);
