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
        <form>
              <label>
                First Name:
                <input type="text"/>
              </label>
              <label>
                Last Name:
                <input type="text"/>
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
            </form>

        <Link to="/dashboard">Cancel</Link>
        <button onClick={this.onLogoutClick}>Save</button>
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
