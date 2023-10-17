export const rolesDict = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Full Stack",
  ml: "ML",
  mobile: "Mobile Dev",
  design: "Design",
  data: "Data Science",
};

export const roles = [
  ...Object.keys(rolesDict).map((e) => ({ value: e, label: rolesDict[e] })),
];
