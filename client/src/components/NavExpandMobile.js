import React from "react";



const NavExpandMobile = (props) => {

    return (
        <>
        <div className="extended-mobile-nav"> 
               <a href="/about">
                    About
               </a>
               <a href="/dashboard">
                    Help & Support
               </a>
               <a href="/">
                    Logout
               </a>
        </div>
        </>
    )
}

export default NavExpandMobile;