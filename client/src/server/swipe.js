export function addSwipeRoutes (server) {
  server.post("swipe/", (schema, { requestBody: { auth, otherUser, decision } }) => {
    return "ok";
  });
}
