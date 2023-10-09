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
        <div className="logo white" />
        {props.wideScreen && (
          <>
            <NavLink to="/swipe">Home</NavLink>
            <div className="nav-line" />
            <NavLink to="/chat">Chat</NavLink>
            <div className="nav-line" />
            <NavLink to="/edit">Profile</NavLink>
            <div className="nav-line" />
            <NavLink to="/myteam">My Team</NavLink>
            <div className="nav-line" />
          </>
        )}
        <NavLink to="/about">About</NavLink>
        <div className="nav-line" />
        <NavLink to="/dashboard">Help & Support</NavLink>
        <div className="nav-line" />
        <Link onClick={onLogoutClick} to="/">
          Logout
        </Link>
        <div className="nav-line" />
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
