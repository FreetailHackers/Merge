import React from "react";
import PropTypes from "prop-types";


function PortfolioCard(props) {
  return (
    <div className="portfolio-card">
      <a
        href={`${props.link}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="portfolioLogo">portfolio</div>
        <div style={{ flexGrow: 2 }}>
          <h5>Portfolio</h5>
          <p>{props.link}</p>
        </div>
      </a>
    </div>
  )
}

/*class PortfolioCard extends Component {
  constructor() {
    super();
    this.state = {
      isLoadingProfile: true,
      profileData: {},
    };
  }

  render = () => (
    <div className="portfolio-card">
      {this.state.loading ? (
        "loading"
      ) : (
        <a
          href={`${this.props.link}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="portfolioLogo">portfolio</div>
          <div style={{ flexGrow: 2 }}>
            <h5>Portfolio</h5>
            <p>{this.props.link}</p>
          </div>
        </a>
      )}
    </div>
  );
}*/

PortfolioCard.propTypes = {
  link: PropTypes.string.isRequired,
};

export default PortfolioCard;
