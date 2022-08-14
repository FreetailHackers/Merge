import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../actions/authActions";
import { NavLink, Link } from "react-router-dom";

import "./Navbar.css";

const Navbar = (props) => {
  if (!props.user) return null;

  const onLogoutClick = (e) => {
    e.preventDefault();
    props.logoutUser();
  };

  return (
    <div>
      <div id="navbar-spacing" />
      <nav id="navbar">
        <Link to="/dashboard">
          <div className="logo white" />
        </Link>
        <NavLink to="/swipe">Find Team Members</NavLink>
        <NavLink to="/chat">Chat</NavLink>
        <NavLink to="/edit">Edit Profile</NavLink>
        <NavLink to="/database">User List</NavLink>
        {props.user.admin ? <NavLink to="/admin">Admin</NavLink> : null}
        <Link onClick={onLogoutClick} to="/">
          Logout
        </Link>
      </nav>
    </div>
  );
};

Navbar.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  logoutUser: PropTypes.func.isRequired,
  auth: state.auth,
  user: state.auth.user,
});

export default connect(mapStateToProps, { logoutUser })(Navbar);
