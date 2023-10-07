import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { NavLink, Link, useNavigate } from "react-router-dom";

const Navbar = (props) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!props.userID) {
      navigate("/login");
    }
  }, [props.userID, navigate]);

  const onLogoutClick = (e) => {
    e.preventDefault();
    props.logoutUser();
    navigate("/login");
  };

  return (
    <div id="navbar-spacing">
      <nav id="navbar">
        <Link to="/dashboard">
          <div className="logo white" />
        </Link>
        <NavLink to="/swipe">Find Team Members</NavLink>
        <NavLink to="/chat">Chat</NavLink>
        <NavLink to="/edit">Edit Profile</NavLink>
        <NavLink to="/myteam">My Team</NavLink>
        <NavLink to="/about">About</NavLink>
        <Link onClick={onLogoutClick} to="/">
          Logout
        </Link>
      </nav>
    </div>
  );
};

Navbar.propTypes = {
  userID: PropTypes.string.isRequired,
  logoutUser: PropTypes.func.isRequired,
  wideScreen: PropTypes.bool,
};

export default Navbar;
