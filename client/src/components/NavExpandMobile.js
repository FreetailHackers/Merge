import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";


const NavExpandMobile = (props) => {
     
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
        <>
        <div className="extended-mobile-nav"> 
        <div style={{marginTop: '20vw'}}>
          <div className="menuItem">
               <a href="/about">About</a>
          </div>
               <div style={{backgroundColor: 'white', height: '1px'}}/>
          <div className="menuItem">
               <a href="/dashboard">Help & Support</a>
          </div>
               <div style={{backgroundColor: 'white', height: '1px'}}/>
          <div className="menuItem">
               <a href="/login" onClick={onLogoutClick}>Logout</a>
          </div>
               <div style={{backgroundColor: 'white', height: '1px'}}/>
        </div>
        </div>
        </>
    )
}

NavExpandMobile.propTypes = {
     userID: PropTypes.string.isRequired,
     logoutUser: PropTypes.func.isRequired
}

export default NavExpandMobile;