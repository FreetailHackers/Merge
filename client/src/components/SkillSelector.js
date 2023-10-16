import React, { useState } from "react";
import PropTypes from "prop-types";
import { MultiSelect } from "@mantine/core";
import { skills } from "../data/skills";

const SkillSelector = (props) => {
  const skillValues = skills.map((e) => e.value);
  const [data, setData] = useState([
    ...skills,
    ...props.skills
      .filter((e) => !skillValues.includes(e))
      .map((e) => ({ value: e, label: e })),
  ]);

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
      onChange={(value) => {
        props.setSkills(value);
        console.log(skills);
      }}
      className="question"
      error={!props.optional && props.skills?.length === 0 ? "Required" : ""}
      required={!props.optional}
    />
  );
};

SkillSelector.propTypes = {
  skills: PropTypes.array,
  setSkills: PropTypes.func,
  label: PropTypes.string,
  optional: PropTypes.bool,
};

export default SkillSelector;
