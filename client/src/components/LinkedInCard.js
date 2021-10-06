import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import './LinkedInCard.css';

class LinkedInCard extends Component {
  constructor () {
    super();
    this.state = {
      isLoadingProfile: true,
      profileData: {}
    }
  }

  componentDidMount () {
    axios.get(process.env.REACT_APP_API_URL + `${this.props.link}`).then(response => {
      this.setState({
        profileData: response.data,
        isLoadingProfile: false
      });
    });
  }

  render = () => (
    <div className='linkedin-card'>
      {
        this.state.loading
        ? "loading"
        : 
        <a href={`${this.props.link}`} target="_blank" rel="noopener noreferrer">
          <div className='linkedinLogo'>linkedin</div>
        </a>
      }
    </div>
  )
}

LinkedInCard.propTypes = {
  link: PropTypes.string.isRequired
}

export default LinkedInCard;
