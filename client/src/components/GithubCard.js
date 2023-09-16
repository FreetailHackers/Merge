import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";

class GithubCard extends Component {
  constructor() {
    super();
    this.state = {
      isLoadingProfile: true,
      profileData: {},
      oldUser: null,
    };
  }

  componentDidMount() {
    axios
      .get(process.env.REACT_APP_API_URL + "/api/users/github/user", {
        params: {
          username: this.props.username,
        },
      })
      .then((response) => {
        this.setState({
          profileData: response.data,
          isLoadingProfile: false,
          oldUser: this.props.username,
        });
      });
  }

  componentDidUpdate() {
    if (this.props.change && this.state.oldUser !== this.props.username) {
      this.componentDidMount();
    }
  }

  render = () => (
    <div className="github-card">
      {this.state.loading ? (
        "loading"
      ) : (
        <a
          href={`https://github.com/${this.state.profileData.login}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={this.state.profileData.avatar_url}
            className="githubImage"
            alt=""
          />
          <div style={{ flexGrow: 2 }}>
            <h5>{this.state.profileData.login}</h5>
            <p>{this.state.profileData.bio}</p>
            <p className="ligher">
              {this.state.profileData.followers} Followers •{" "}
              {this.state.profileData.following} Following •{" "}
              {this.state.profileData.public_repos} Repos
            </p>
          </div>
          <div className="githubLogo">github</div>
        </a>
      )}
    </div>
  );
}

GithubCard.propTypes = {
  username: PropTypes.string.isRequired,
  change: PropTypes.bool.isRequired,
};

export default GithubCard;
