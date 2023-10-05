import React from "react";
// import { Link } from "react-router-dom";

// nav bar icons
import burgerbar from "../assets/navbar icons/burger-bar.svg";
import teams from "../assets/navbar icons/team-icon.svg";
import home from "../assets/navbar icons/home-icon.svg";
import chat from "../assets/navbar icons/chat-icon.svg";
import profile from "../assets/navbar icons/profile-icon.svg";

const NavMobile = (props) => {
    return (
        <>
        <div className="mobile-navbar" style={{backgroundColor: '#174D7E'}} >
            <a href="/dashboard">
                <img src={burgerbar} style={{height: '35px'}}/>
            </a>
            <a href="/myteam">
                <img src={teams} style={{height: '48px'}}/>
            </a>
            <a href="/swipe">
                <img src={home} style={{height: '62px'}}/>
            </a>
            <a href="/chat">
                <img src={chat} style={{height: '43px'}}/>
            </a>
            <a href="/edit">
                <img src={profile} style={{height: '51px'}}/>
            </a>
        </div>
        </>
    )
}

export default NavMobile;