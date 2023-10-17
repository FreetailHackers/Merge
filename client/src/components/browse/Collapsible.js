import React, { useState } from "react";
import { BsArrowsCollapse, BsArrowsExpand } from "react-icons/bs";
import PropTypes from "prop-types";

function Collapsible(props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`headerDatabase ${
          props.oddIndex ? "oddCollapsible" : "evenCollapsible"
        }`}
      >
        <span
          style={{
            width: 40,
            display: "inline-block",
            verticalAlign: "middle",
          }}
        >
          {open ? <BsArrowsCollapse /> : <BsArrowsExpand />}
        </span>
        {props.title}
      </button>
      {open ? <div className="contentDatabase">{props.children}</div> : null}
    </div>
  );
}

Collapsible.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  oddIndex: PropTypes.bool,
};
export default Collapsible;
