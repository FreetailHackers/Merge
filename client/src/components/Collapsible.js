import React, { Component } from "react";
import { BsArrowsCollapse, BsArrowsExpand } from "react-icons/bs";

class Collapsible extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.togglePanel = () => {
      this.setState({ open: !this.state.open });
    };
  }

  componentDidUpdate() {}

  render() {
    return (
      <div>
        <button onClick={this.togglePanel} className="headerDatabase">
          <span
            style={{
              width: 40,
              display: "inline-block",
              verticalAlign: "middle",
            }}
          >
            {this.state.open ? <BsArrowsCollapse /> : <BsArrowsExpand />}
          </span>
          {this.props.title}
        </button>
        {this.state.open ? (
          <div className="contentDatabase">{this.props.children}</div>
        ) : null}
      </div>
    );
  }
}

export default Collapsible;
