import React from "react";
import PropTypes from "prop-types";
import { startCase, isArray } from "lodash";
import { skillsDict } from "../data/skills";
import { rolesDict } from "../data/roles";

export const UserToParagraph = ({ user, hideKeys }) => (
  <p>
    {Object.keys(user)
      .filter(
        (key) =>
          !(hideKeys && hideKeys.includes(key)) &&
          !(isArray(user[key]) && user[key].length === 0)
      )
      .map((key) => {
        let val = user[key];
        if (key === "skills" || key === "desiredSkills") {
          val = val.map((e) => skillsDict[e] ?? e);
        }
        if (key === "desiredRoles" || key === "roles") {
          val = val.map((e) => rolesDict[e] ?? e);
        }
        if (key === "experience") {
          val += " years";
        }
        if (key === "competitiveness") {
          if (val === "learn") {
            val = "Trying to win";
          } else {
            val = "Looking to learn/have fun";
          }
        }
        if (key === "hours") {
          val = `${val} hours`;
        }
        return (
          <span key={key}>
            <b>{key === "hours" ? "Willing to work for" : startCase(key)}:</b>{" "}
            {isArray(val) ? val.toString().replaceAll(",", ", ") : val}
            <br />
          </span>
        );
      })}
  </p>
);

UserToParagraph.propTypes = {
  user: PropTypes.object.isRequired,
  hideKeys: PropTypes.array,
};
