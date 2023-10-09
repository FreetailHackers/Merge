import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { NavLink, Link, useNavigate } from "react-router-dom";
import toggleBars from "../assets/images/toggle-bars-white.png";

const Navbar = (props) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!props.userID) {
      navigate("/login");
    }
  }, [props.userID, navigate]);

  const onLogoutClick = (e) => {
    e.preventDefault();
    props.flipDisplaySidebar();
    props.logoutUser();
    navigate("/login");
  };

  return (
    <div id="navbar-spacing">
      <nav id="navbar">
        {!props.wideScreen && (
          <button
            className="toggle toggleSidebar"
            onClick={props.flipDisplaySidebar}
          >
            <img src={toggleBars} alt="toggle bars" />
          </button>
        )}
        <Link to="/dashboard" onClick={props.flipDisplaySidebar}>
          <div className="logo white" />
        </Link>
        <NavLink to="/swipe" onClick={props.flipDisplaySidebar}>
          Find Team Members
        </NavLink>
        <NavLink
          to="/chat"
          onClick={() => {
            props.flipDisplaySidebar();
            props.setUpdates((prev) => ({ ...prev, chat: false }));
          }}
        >
          {props.updates.chat ? <span className="unreadBubble" /> : null}
          Chat
        </NavLink>
        <NavLink to="/edit" onClick={props.flipDisplaySidebar}>
          Edit Profile
        </NavLink>
        <NavLink
          to="/myteam"
          onClick={() => {
            props.flipDisplaySidebar();
            props.setUpdates((prev) => ({ ...prev, myteam: false }));
          }}
        >
          {props.updates.myteam ? <span className="unreadBubble" /> : null}
          My Team
        </NavLink>
        <NavLink to="/about" onClick={props.flipDisplaySidebar}>
          About
        </NavLink>
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
  flipDisplaySidebar: PropTypes.func,
  updates: PropTypes.object,
  setUpdates: PropTypes.func,
};

export default Navbar;
