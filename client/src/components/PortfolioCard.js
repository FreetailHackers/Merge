import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './PortfolioCard.css';

class PortfolioCard extends Component {
  constructor () {
    super();
    this.state = {
      isLoadingProfile: true,
      profileData: {}
    }
  }

  render = () => (
    <div className='portfolio-card'>
      {
        this.state.loading
        ? "loading"
        : 
        <a href={`${this.props.link}`} target="_blank" rel="noopener noreferrer">
          <div className='portfolioLogo'>portfolio</div>
          <div style={{ flexGrow: 2 }}>
            <h5>Portfolio</h5>
            <p>{this.props.link}</p>
          </div>
        </a>
      }
    </div>
  )
}

PortfolioCard.propTypes = {
  link: PropTypes.string.isRequired
}

export default PortfolioCard;