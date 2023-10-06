import React from "react";


const NavExpandMobile = (props) => {

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
               <a href="/">Logout</a>
          </div>
               <div style={{backgroundColor: 'white', height: '1px'}}/>
        </div>
        </div>
        </>
    )
}

export default NavExpandMobile;