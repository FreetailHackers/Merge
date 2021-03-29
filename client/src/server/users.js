import { generateUser, generateUsers } from "../utils/generateUserData";

export function addUserRoutes (server) {
  server.get("users/", (schema, { queryParams: { limit } }) => {
    return generateUsers(parseInt(limit));
  });

  server.get("user/", (schema, request) => {
    return generateUser();
  });

  server.post("user/", (schema, { requestBody: { auth, user} }) => {
    return "ok";
  });
}
