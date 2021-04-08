import { generateUser, generateUsers } from "../utils/generateUserData";

export function addUserRoutes (server) {
  server.get("users/", (schema, { queryParams: { limit, page } }) => {
    return {
      users: generateUsers(parseInt(limit)),
      page
    };
  });

  server.get("user/", (schema, request) => {
    return generateUser();
  });

  server.post("user/", (schema, { requestBody: { auth, user} }) => {
    return "ok";
  });
}
