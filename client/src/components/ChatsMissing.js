import React from "react";
import "./ChatsMissing.css";
import "../pages/Dashboard.css";

export default function ChatMissing() {
  return (
    <div className="chatsMissingWindow">
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
