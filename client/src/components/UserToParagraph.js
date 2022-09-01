import React from "react";
import PropTypes from "prop-types";
import { startCase } from "lodash";

export const UserToParagraphFragment = (user, key) => (
  <span key={key}>
    <b>{startCase(key)}</b>: {user[key]}
    <br />
  </span>
);

export const UserToParagraph = ({ user, keys }) => (
  <p>{keys.map((key) => UserToParagraphFragment(user, key))}</p>
);

UserToParagraph.propTypes = {
  user: PropTypes.array.isRequired,
  keys: PropTypes.array.isRequired,
};
