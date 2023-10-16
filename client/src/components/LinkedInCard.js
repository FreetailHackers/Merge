import React from "react";
import PropTypes from "prop-types";

function LinkedInCard(props) {
  return (
    <div className="linkedin-card">
      <a href={`${props.link}`} target="_blank" rel="noopener noreferrer">
        <div className="linkedinLogo">linkedin</div>
        <div style={{ flexGrow: 2 }}>
          <h5>LinkedIn Profile</h5>
          <p>{props.link}</p>
        </div>
      </a>
    </div>
  );
}

LinkedInCard.propTypes = {
  link: PropTypes.string.isRequired,
};

export default LinkedInCard;
