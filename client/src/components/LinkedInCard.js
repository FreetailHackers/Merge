import React, { Component } from "react";
import PropTypes from "prop-types";

import "./LinkedInCard.css";

class LinkedInCard extends Component {
  constructor() {
    super();
    this.state = {
      isLoadingProfile: true,
      profileData: {},
    };
  }

  render = () => (
    <div className="linkedin-card">
      {this.state.loading ? (
        "loading"
      ) : (
        <a
          href={`${this.props.link}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="linkedinLogo">linkedin</div>
          <div style={{ flexGrow: 2 }}>
            <h5>LinkedIn Profile</h5>
            <p>{this.props.link}</p>
          </div>
        </a>
      )}
    </div>
  );
}

LinkedInCard.propTypes = {
  username: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

export default LinkedInCard;
