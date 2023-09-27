export const rolesDict = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Full Stack",
  ml: "ML/Data Scientist",
  mobile: "Mobile Dev",
  design: "Design",
};

export const roles = [
  ...Object.keys(rolesDict).map((e) => ({ value: e, label: rolesDict[e] })),
];
