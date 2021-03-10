import { Response } from "miragejs";
import jwt from "jsonwebtoken";
import getRandomElement from '../utils/getRandomElement';

function createSuccessfulLoginResponse () {
  const payload = {
    id: 0,
    name: 'John Doe'
  };

  const token = "Bearer " + jwt.sign(
    payload,
    'secret'
  );

  return { token, success: true }
}

function createIncorrectEmailLoginResponse () {
  return new Response(404, {}, { emailnotfound: "Email not found" });
}

function createIncorrectPasswordLoginResponse () {
  return new Response(400, {}, { passwordincorrect: "Password incorrect" });
}

function createSuccessfulRegisterResponse () {
  return { name: 'Jane Doe', email: 'janedoe@example.com', password: 'secure' };
}

function createEmailExistsRegisterResponse () {
  return new Response(404, {}, { email: "Email already exists" });
}

function createInvalidRegisterResponse () {
  const possibleInvalidErrors = [
    ["name", "Name field is required"],
    ["email", "Email field is required"],
    ["email", "Email is invalid"],
    ["password", "Password field is required"],
    ["password2", "Confirm password field is required"],
    ["password", "Password must be at least 6 characters"],
    ["password2", "Passwords must match"]
  ]

  const invalidError = getRandomElement(possibleInvalidErrors);
  return new Response(400, {}, { [invalidError[0]]: invalidError[1] });
}

export function addAuthRoutes (server) {
  server.post("/api/users/login", (schema, request) => {
    const user = JSON.parse(request.requestBody)

    if (!user.email) {
      return createIncorrectEmailLoginResponse();
    }

    if (!user.password) {
      return createIncorrectPasswordLoginResponse();
    }

    return createSuccessfulLoginResponse();
  });

  server.post("/api/users/register", (schema, request) => {
    const user = JSON.parse(request.requestBody)

    if (!user.name || !user.email || !user.password || !user.password2) {
      return createInvalidRegisterResponse();
    }

    if (user.email === "exists") {
      return createEmailExistsRegisterResponse();
    }

    return createSuccessfulRegisterResponse();
  });
}
