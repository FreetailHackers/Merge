import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { NavLink, Link, useNavigate } from "react-router-dom";

import "./Navbar.css";

const Navbar = (props) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!props.auth.userID) {
      navigate("/login");
    }
  }, [props.auth, navigate]);

  if (!props.user) return null;

  const onLogoutClick = (e) => {
    e.preventDefault();
    props.logoutUser();
    navigate("/login");
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
        {/*<NavLink to="/database">User List</NavLink>*/}
        {props.user.admin ? <NavLink to="/admin">Admin</NavLink> : null}
        <NavLink to="/about">About</NavLink>
        <Link onClick={onLogoutClick} to="/">
          Logout
        </Link>
      </nav>
    </div>
  );
};

Navbar.propTypes = {
  auth: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  logoutUser: PropTypes.func.isRequired,
};

export default Navbar;
