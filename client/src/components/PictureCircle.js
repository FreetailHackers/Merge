import React from "react";
import PropTypes from "prop-types";
import NameSVG from "./NameSVG";

function PictureCircle(props) {
  const {profiles} = props
  return <div
    style={
      profiles.length === 1 && profiles[0].profilePictureUrl
        ? {
            backgroundImage: `url(${profiles[0].profilePictureUrl})`,
          }
        : {}
    }
    className={`outerCircle ${props.outerClass ?? ""}`}
  > 
    {profiles?.length === 1 && !profiles[0].profilePictureUrl && <NameSVG name={profiles[0].name}/>}
    {profiles?.length > 1 &&
      profiles.map((prof, i) => {
        const mu = Math.sqrt(
          (1 - Math.cos((2 * Math.PI) / profiles.length)) / 2
        );
        const theta = Math.PI / 2 + (2 * Math.PI * i) / profiles.length;
        const size = (100 * mu) / (1 + mu);
        const r = 100 / 2 / (1 + mu);
        const top = 100 / 2 - r * Math.sin(theta) - size / 2;
        const left = 100 / 2 + r * Math.cos(theta) - size / 2;
        return (
          <div
            key={i}
            style={{
              backgroundImage: `url("${prof.profilePictureUrl}")`,
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}%`,
            }}
            className="innerCircle"
          >
            {!prof.profilePictureUrl && prof.name && (
              <NameSVG name={prof.name}/>
            )}
          </div>
        );
      })}
  </div>
}

PictureCircle.propTypes = {
  outerClass: PropTypes.string,
  profiles: PropTypes.array,
}

export default PictureCircle;
