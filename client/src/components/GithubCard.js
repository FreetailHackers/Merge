import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import './GithubCard.css';

class GithubCard extends Component {
  constructor () {
    super();
    this.state = {
      isLoadingProfile: true,
      profileData: {}
    }
  }

  componentDidMount () {
    axios.get(process.env.REACT_APP_API_URL + `github/user/${this.props.username}`).then(response => {
      this.setState({
        profileData: response.data,
        isLoadingProfile: false
      });
    });
  }

  render = () => (
    <div className='github-card'>
      {
        this.state.loading
        ? "loading"
        : 
        <a href={`https://github.com/${this.state.profileData.login}`} target="_blank" rel="noopener noreferrer">
          <img src={this.state.profileData.avatar_url} className='githubImage' alt='' />
          <div style={{ flexGrow: 2 }}>
            <h5>{this.state.profileData.login}</h5>
            <p>{this.state.profileData.bio}</p>
            <p className='ligher'>{this.state.profileData.followers} Followers • {this.state.profileData.following} Following • {this.state.profileData.public_repos} Repos</p>
          </div>
          <div className='githubLogo'>github</div>
        </a>
      }
    </div>
  )
}

GithubCard.propTypes = {
  username: PropTypes.string.isRequired
}

export default GithubCard;
