import { generateUser, generateUsers } from "../utils/generateUserData";

export function addUserRoutes (server) {
  server.get("/api/users/", (schema, { queryParams: { limit } }) => {
    return generateUsers(parseInt(limit));
  });

  server.get("/api/user/", (schema, request) => {
    return generateUser();
  });
}
