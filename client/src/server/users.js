import { generateUser, generateUsers } from "../utils/generateUserData";

export function addUserRoutes(server) {
  server.get(
    "users/",
    (
      schema,
      {
        queryParams: {
          limit,
          page,
          filterName,
          filterUniversity,
          filterSkills,
          dateSent,
        },
      }
    ) => {
      return {
        users: generateUsers(parseInt(limit)),
        page,
        dateSent,
      };
    }
  );

  server.get("user/", (schema, request) => {
    return generateUser();
  });

  server.get("github/user/", async (schema, request) => {
    // The real API should make a call to https://api.github.com/users/:username
    return {
      login: "bintay",
      id: 13704341,
      node_id: "MDQ6VXNlcjEzNzA0MzQx",
      avatar_url: "https://avatars.githubusercontent.com/u/13704341?v=4",
      gravatar_id: "",
      url: "https://api.github.com/users/bintay",
      html_url: "https://github.com/bintay",
      followers_url: "https://api.github.com/users/bintay/followers",
      following_url:
        "https://api.github.com/users/bintay/following{/other_user}",
      gists_url: "https://api.github.com/users/bintay/gists{/gist_id}",
      starred_url: "https://api.github.com/users/bintay/starred{/owner}{/repo}",
      subscriptions_url: "https://api.github.com/users/bintay/subscriptions",
      organizations_url: "https://api.github.com/users/bintay/orgs",
      repos_url: "https://api.github.com/users/bintay/repos",
      events_url: "https://api.github.com/users/bintay/events{/privacy}",
      received_events_url:
        "https://api.github.com/users/bintay/received_events",
      type: "User",
      site_admin: false,
      name: "Ben Taylor",
      company: null,
      blog: "https://bentaylor.xyz/",
      location: "Texas",
      email: null,
      hireable: true,
      bio: "I like looking at the clouds",
      twitter_username: null,
      public_repos: 23,
      public_gists: 3,
      followers: 54,
      following: 61,
      created_at: "2015-08-08T07:11:07Z",
      updated_at: "2021-04-03T19:55:56Z",
    };
  });

  server.post("user/", (schema, { requestBody: { auth, user } }) => {
    return "ok";
  });

  server.post(
    "user/profile-picture",
    (schema, { requestBody: { auth, user } }) => {
      return {
        url: "https://th.bing.com/th/id/Ra210ad551a36a508bec3b41101e96512?rik=P8n14gIVXipDQQ&riu=http%3a%2f%2fi.imgur.com%2f0tTpv1C.jpg&ehk=YzUVouWRSfnk4Frv1kjAg6FCfoPa%2bRX3txktTxiwgH4%3d&risl=&pid=ImgRaw",
      };
    }
  );
}
