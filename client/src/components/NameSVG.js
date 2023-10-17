import React from "react";
import PropTypes from "prop-types";

function NameSVG(props) {
  return (
    <svg height="100%" width="100%" viewBox="0 0 45 45 ">
      <circle r={22.5} cx={22.5} cy={22.5} fill="#ddd" border="none" />
      <text
        fontSize="22"
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="black"
      >
        {props.name
          .split(" ")
          .map((s) => s[0])
          .join("")
          .toUpperCase()}
      </text>
    </svg>
  );
}

NameSVG.propTypes = {
  name: PropTypes.string.isRequired,
};

export default NameSVG;
