import { Response } from "miragejs";
import jwt from "jsonwebtoken";

function createSuccessfulLoginResponse () {
  const payload = {
    _id : "5f850fa8ce6dafd59eab4f08",
    profile : { adult : false, skills : [ ], socialMedia : [ ] },
    confirmation : { dietaryRestrictions : [ ], platforms : [ ] },
    status : { completedProfile : true, admitted : true, confirmed : true, declined : false, checkedIn : false, reimbursementGiven : false },
    sponsorFields : { tier : "", workshop : false, estimatedCost : 0 },
    userAtEvent : { receivedLunch : false, receivedDinner : false, workshopsAttended : [ ], tablesVisited : [ ] },
    admin : false,
    sponsor : false,
    timestamp : 1602555582361,
    lastUpdated : 1602555582361,
    verified : true,
    email : "baz@bar.edu",
  }


  const token = jwt.sign(
    payload._id,
    'shhhh super secret code here bro'
  );

  return { token, user: payload, success: true }
}

function createIncorrectEmailLoginResponse () {
  return new Response(404, {}, { emailnotfound: "Email not found" });
}

function createIncorrectPasswordLoginResponse () {
  return new Response(400, {}, { passwordincorrect: "Password incorrect" });
}

export function addAuthRoutes(server) {
  server.post("auth/login", (schema, request) => {
    const user = JSON.parse(request.requestBody)

    if (!user.email) {
      return createIncorrectEmailLoginResponse();
    }

    if (!user.password) {
      return createIncorrectPasswordLoginResponse();
    }

    return createSuccessfulLoginResponse();
  });
}
