import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../actions/authActions";
import { Link } from "react-router-dom";

class Edit extends Component {

  onLogoutClick = e => {
    this.props.history.push('/dashboard')
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
