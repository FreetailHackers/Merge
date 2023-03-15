import React from "react";
import "./ChatsMissing.css";
import "../pages/Dashboard.css";
import PropTypes from "prop-types";

function ChatMissing(props) {
  return (
    <div className="chatsMissingWindow">
      {!props.wideScreen && (
        <div className="windowToggleHolder">
          <button className="toggleSidebar" onClick={props.flipDisplaySidebar}>
            ←
          </button>
        </div>
      )}
      <h1>No conversations to display!</h1>
      <p>Match with more people to start conversations!</p>
      <div className="team-image">
        <div className="background" />
        <div className="main" />
        <div className="primary" />
        <div className="secondary" />
      </div>
    </div>
  );
}

ChatMissing.propTypes = {
  wideScreen: PropTypes.bool,
  flipDisplaySidebar: PropTypes.func,
};

export default ChatMissing;
