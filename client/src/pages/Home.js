import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../actions/authActions";

class Home extends Component {
  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  render() {
    const { user } = this.props.auth;

    return (
      <section>
        <p>Welcome home, {user.name}</p>
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
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logoutUser }
)(Home);
