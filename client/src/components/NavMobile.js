import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

// components

// assets
// nav bar icons
import burgerbar from "../assets/navbar icons/burger-bar.svg";
import teams from "../assets/navbar icons/team-icon.svg";
import home from "../assets/navbar icons/home-icon.svg";
import chat from "../assets/navbar icons/chat-icon.svg";
import profile from "../assets/navbar icons/profile-icon.svg";
import Navbar from "./Navbar";

const NavMobile = (props) => {
  const closeBurgerMenu = () => {
    if (!props.wideScreen) {
      props.displaySideBar();
    }
  };

  return (
    <>
      {!props.displaySideBar && (
        <Navbar
          userID={props.userID}
          logoutUser={props.logoutUser}
          wideScreen={props.wideScreen}
        />
      )}
      <div className={props.displaySideBar ? "mobile-navbar" : "extend-menu"}>
        <img
          className="burgerbar"
          src={burgerbar}
          style={{ height: "20px" }}
          onClick={closeBurgerMenu}
          alt="more options"
        />
        {props.displaySideBar && (
          <>
            <NavLink to="/myteam">
              <img src={teams} style={{ height: "33px" }} alt="my team" />
            </NavLink>
            <NavLink to="/swipe">
              <img src={home} style={{ height: "35px" }} alt="home/swipe" />
            </NavLink>
            <NavLink to="/chat">
              <img src={chat} style={{ height: "38px" }} alt="chat" />
            </NavLink>
            <NavLink to="/edit">
              <img src={profile} style={{ height: "39px" }} alt="profile" />
            </NavLink>
          </>
        )}
      </div>
    </>
  );
};

NavMobile.propTypes = {
  userID: PropTypes.string.isRequired,
  logoutUser: PropTypes.func.isRequired,
  wideScreen: PropTypes.bool,
  displaySideBar: PropTypes.func.isRequired,
};

export default NavMobile;
