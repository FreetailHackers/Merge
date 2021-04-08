import { generateUser, generateUsers } from "../utils/generateUserData";

export function addUserRoutes (server) {
  server.get("users/", (schema, { queryParams: { limit, page, filterName, filterUniversity, filterSkills, dateSent } }) => {
    return {
      users: generateUsers(parseInt(limit)),
      page,
      dateSent
    };
  });

  server.get("user/", (schema, request) => {
    return generateUser();
  });

  server.post("user/", (schema, { requestBody: { auth, user} }) => {
    return "ok";
  });

  server.post("user/profile-picture", (schema, { requestBody: { auth, user} }) => {
    return {
      url: "https://th.bing.com/th/id/Ra210ad551a36a508bec3b41101e96512?rik=P8n14gIVXipDQQ&riu=http%3a%2f%2fi.imgur.com%2f0tTpv1C.jpg&ehk=YzUVouWRSfnk4Frv1kjAg6FCfoPa%2bRX3txktTxiwgH4%3d&risl=&pid=ImgRaw"
    };
  });
}
