import React, { useState } from "react";
import PropTypes from "prop-types";
import { MultiSelect } from "@mantine/core";
import { skills } from "../data/skills";

const SkillSelector = (props) => {
  const [data, setData] = useState(skills);

  return (
    <MultiSelect
      label={props.label ?? "Skills"}
      data={data}
      searchable
      creatable
      clearable
      getCreateLabel={(query) => `+ Create ${query}`}
      onCreate={(query) => {
        const item = { value: query, label: query };
        setData((current) => [...current, item]);
        return item;
      }}
      placeholder="Python, Java, C, etc."
      nothingFound="Nothing found"
      value={props.skills}
      onChange={(value) => props.setSkills(value)}
      className="question"
      error={props.skills?.length === 0 ? "Required" : ""}
      required
    />
  );
};

SkillSelector.propTypes = {
  skills: PropTypes.array,
  setSkills: PropTypes.func,
  label: PropTypes.string,
};

export default SkillSelector;
