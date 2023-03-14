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
    props.flipDisplaySidebar();
    e.preventDefault();
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
            ≡
          </button>
        )}
        <Link to="/dashboard" onClick={props.flipDisplaySidebar}>
          <div className="logo white" />
        </Link>
        <NavLink to="/swipe" onClick={props.flipDisplaySidebar}>
          Find Team Members
        </NavLink>
        <NavLink to="/chat" onClick={props.flipDisplaySidebar}>
          Chat
        </NavLink>
        <NavLink to="/edit" onClick={props.flipDisplaySidebar}>
          Edit Profile
        </NavLink>
        {/*<NavLink to="/database">User List</NavLink>*/}
        {props.user.admin ? <NavLink to="/admin">Admin</NavLink> : null}
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
  auth: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  logoutUser: PropTypes.func.isRequired,
  wideScreen: PropTypes.bool,
  flipDisplaySidebar: PropTypes.func,
};

export default Navbar;
