import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import jwt_decode from "jwt-decode";

import axios from "axios"

class Dashboard extends Component {

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  constructor(props) {
    super(props)
    this.state = {
      userData : null
    }
  }

  componentDidMount() {
    let token = localStorage.getItem("jwtToken")
    let userID = jwt_decode(token)
    axios
    .get("http://localhost:3000/api/users/" + userID).
    then((res) => {this.setState({userData : res})})
  }

  render() {
    console.log(this.props.auth)
    const { user } = this.props.auth;

    return (
      this.state.userData == null ?
      <div>loading...</div> :
      <section>
        <p>Welcome home, {JSON.stringify(this.state.userData)}</p>
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
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logoutUser }
)(Dashboard);
