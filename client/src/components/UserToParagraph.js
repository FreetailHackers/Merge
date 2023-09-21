import React from "react";
import PropTypes from "prop-types";
import { startCase, isArray } from "lodash";

export const UserToParagraph = ({ user, hideKeys }) => (
  <p>
    {Object.keys(user)
      .filter((key) => !hideKeys || !hideKeys.includes(key))
      .map((key) => (
        <span key={key}>
          <b>{startCase(key)}</b>:{" "}
          {isArray(user[key])
            ? user[key].toString().replaceAll(",", ", ")
            : user[key]}
          <br />
        </span>
      ))}
  </p>
);

UserToParagraph.propTypes = {
  user: PropTypes.object.isRequired,
  hideKeys: PropTypes.array,
};
