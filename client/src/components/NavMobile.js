/* eslint-disable */
import React, { useState } from "react";
import PropTypes from "prop-types";

// components

// assets
// nav bar icons
import burgerbar from "../assets/navbar icons/burger-bar.svg";
import teams from "../assets/navbar icons/team-icon.svg";
import home from "../assets/navbar icons/home-icon.svg";
import chat from "../assets/navbar icons/chat-icon.svg";
import profile from "../assets/navbar icons/profile-icon.svg";
import NavExpandMobile from "./NavExpandMobile";

const NavMobile = (props) => {
    const [showExtendedMenu, setExtendedMenu] = useState(false);

    function showMenu() {
        setExtendedMenu(!showExtendedMenu);
    }

    return (
        <>
        {showExtendedMenu && <NavExpandMobile userID={props.userID} logoutUser={props.logoutUser}/>}
        <div className="mobile-navbar" style={{backgroundColor: '#174D7E'}} >
            <img src={burgerbar} style={{height: '20px'}} onClick ={showMenu}/>
            {!showExtendedMenu && <>
                <a href="/myteam">
                    <img src={teams} style={{height: '33px'}}/>
                </a>
                <a href="/swipe">
                    <img src={home} style={{height: '35px'}}/>
                </a>
                <a href="/chat">
                    <img src={chat} style={{height: '38px'}}/>
                </a>
                <a href="/edit">
                    <img src={profile} style={{height: '39px'}}/>
                </a>
            </> }
        </div>
        </>
    )
}

NavMobile.propTypes = {
    userID: PropTypes.string.isRequired,
    logoutUser: PropTypes.func.isRequired
}

export default NavMobile;