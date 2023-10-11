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

const NavMobile = (props) => {
  const closeBurgerMenu = () => {
    props.setDisplaySidebar((prev) => !prev);
  };
  const showScreen = () => props.setDisplaySidebar(false);

  return (
    <>
      <div className={"mobile-navbar"}>
        <img
          className="burgerbar"
          src={burgerbar}
          style={{ height: "20px" }}
          onClick={closeBurgerMenu}
          alt="more options"
        />
        <NavLink to="/myteam" onClick={showScreen}>
          <img src={teams} style={{ height: "33px" }} alt="my team" />
        </NavLink>
        <NavLink to="/swipe" onClick={showScreen}>
          <img src={home} style={{ height: "35px" }} alt="home/swipe" />
        </NavLink>
        <NavLink to="/chat" onClick={showScreen}>
          <img src={chat} style={{ height: "38px" }} alt="chat" />
        </NavLink>
        <NavLink to="/edit" onClick={showScreen}>
          <img src={profile} style={{ height: "39px" }} alt="profile" />
        </NavLink>
      </div>
    </>
  );
};

NavMobile.propTypes = {
  userID: PropTypes.string.isRequired,
  setDisplaySidebar: PropTypes.func,
};

export default NavMobile;
