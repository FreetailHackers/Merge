const express = require("express");
const router = express.Router();

const Team = require("../../models/Team");
const User = require("../../models/User");
const Chat = require("../../models/Chat");

const authenticateToken = require("../helpers/authentication");
const addProfiles = require("../helpers/addProfiles");
const createTeam = require("../helpers/createTeam");
router.use(authenticateToken);

const dotenv = require("dotenv");
dotenv.config();

const MAX_TEAM_SIZE = 5;

// @route POST api/team/requestMerge
// @desc Request Team Merge
// @access Public
router.post("/requestMerge/:team", async (req, res) => requestMerge(req, res));

// @route POST api/team/acceptMerge
// @desc Accept Team Merge
// @access Public
router.post("/acceptMerge/:team", async (req, res) => acceptMerge(req, res));

// @route POST api/team/rejectMerge
// @desc Reject Team Merge
// @access Public
router.post("/rejectMerge/:team", async (req, res) => rejectMerge(req, res));

router.post("/cancelRequest/:team", async (req, res) =>
  cancelRequest(req, res)
);

// @route GEI api/team/list
// @desc List teams that pass filters
// @access Public
router.get("/list", async (req, res) => listTeams(req, res));

// @route GET api/:team
// @desc Get a team by its ObjectID
// @access Public
router.get("/:team", async (req, res) => getTeam(req, res));

// @route GET userTeam/:user
// @desc Given a user's ID, return their team
// @access Public
router.get("/userTeam/:user", async (req, res) => getUserTeam(req, res));

router.get("/mergeRequestsInfo/:user", async (req, res) =>
  getUserTeamMRs(req, res)
);

// @route POST api/team/updateProfile
// @desc Update a Team's profile
// @access Public
router.post("/updateProfile", async (req, res) => update(req, res));

router.get("/teamsToSwipe/:user", async (req, res) =>
  getTeamsToSwipe(req, res)
);

router.post("/swipe/resetLeftSwipe", async (req, res) =>
  resetLeftSwipes(req, res)
);

router.post("/swipe", async (req, res) => swipe(req, res));

router.post("/leaveTeam", async (req, res) => leaveTeam(req, res));

router.post("/updateMembership", async (req, res) =>
  updateMembership(req, res)
);

/**
 * Request to merge your team with another.
 *
 * PATH PARAMETER team: ObjectID of the team that the calling users wants to merge their team with
 *
 * BODY PARAMETER team: ObjectID of the team that the calling user belongs to
 */
async function requestMerge(req, res) {
  try {
    let otherTeam = await Team.findOne({ _id: req.params.team });
    const myTeam = await Team.findOne({ users: req.user });
    if (!otherTeam || !myTeam) {
      return res.sendStatus(400);
    }
    if (otherTeam.users.length + myTeam.users.length > MAX_TEAM_SIZE) {
      return res.sendStatus(400);
    }
    let mr = {
      requestingTeam: myTeam._id,
      message: req.body.message,
    };
    otherTeam.mergeRequests.push(mr);
    const saved = await otherTeam.save();
    let mrObj =
      saved.toObject().mergeRequests[
        saved.mergeRequests.findIndex(
          (e) =>
            String(e.requestingTeam) === String(myTeam._id) &&
            e.message === mr.message
        )
      ];
    return res.json(mrObj);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

async function combineProfiles(absorbingTeam, absorbedTeam) {
  if (absorbingTeam.users.length === 1) {
    // implies that the absorbed team is also size 1
    const absorbingLeader = await User.findById(absorbingTeam.leader);
    const absorbedLeader = await User.findById(absorbedTeam.leader);
    absorbingTeam.profile.skills = [
      ...new Set([
        ...(absorbingLeader.profile.skills ?? []),
        ...(absorbedLeader.profile.skills ?? []),
      ]),
    ];
    absorbingTeam.profile.competitiveness =
      absorbingLeader.profile.competitiveness;
    absorbingTeam.profile.name = `${absorbingLeader.name}'s Team`;
  } else if (absorbedTeam.users.length === 1) {
    // implies that the absorbing team is bigger than 1
    const absorbedLeader = await User.findById(absorbedTeam.leader);
    absorbingTeam.profile.skills = [
      ...new Set([
        ...(absorbingTeam.profile.skills ?? []),
        ...(absorbedLeader.profile.skills ?? []),
      ]),
    ];
  } else {
    // both teams bigger than 1
    absorbingTeam.profile.skills = [
      ...new Set([
        ...(absorbingTeam.profile.skills ?? []),
        ...(absorbedTeam.profile.skills ?? []),
      ]),
    ];
  }
  absorbingTeam = await absorbingTeam.save();
}

/**
 * Accept an outstanding request to merge your team with another.
 * If the other team is greater or equal in size, your team will be absorbed by them.
 * Otherwise, they will be absorbed by you.
 *
 * PATH PARAMETER team: ObjectID of the team that the calling user's team will be merged with
 *
 * BODY PARAMETER team: ObjectID of the team that the calling user currently belongs to
 */
async function acceptMerge(req, res) {
  try {
    let otherTeam = await Team.findOne({ _id: req.params.team });
    let myTeam = await Team.findOne({ users: req.user });
    if (
      !otherTeam ||
      !myTeam ||
      req.user != myTeam.leader ||
      otherTeam.users.length + myTeam.users.length > MAX_TEAM_SIZE
    ) {
      return res.sendStatus(400);
    }
    const index = myTeam.mergeRequests.findIndex(
      (e) => String(e.requestingTeam) === String(otherTeam._id)
    );
    if (index == -1) {
      return res.sendStatus(400);
    }
    const absorbed = otherTeam.users.length >= myTeam.users.length;
    let absorbingTeam = absorbed ? otherTeam : myTeam;
    let absorbedTeam = absorbed ? myTeam : otherTeam;

    await combineProfiles(absorbingTeam, absorbedTeam);

    for (const userID of absorbedTeam.users) {
      let user = await User.findOne({ _id: userID });
      user.team = absorbingTeam._id;
      await user.save();
      absorbingTeam.users.push(userID);
    }
    await Team.deleteOne({ _id: absorbedTeam._id });
    if (!absorbed) {
      myTeam.mergeRequests.splice(index, 1); // is this necessary?
    }
    const saved = await absorbingTeam.save();
    await Team.updateMany(
      {},
      {
        $pull: {
          leftSwipeList: absorbedTeam._id,
          rightSwipeList: absorbedTeam._id,
          mergeRequests: { requestingTeam: absorbedTeam._id },
        },
      }
    );
    let newTeam = saved.toObject();
    await addProfiles(newTeam);
    return res.json(newTeam);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

/**
 * Reject an outstanding request to merge your team with another.
 *
 * PATH PARAMETER team: ObjectID of the team that the calling user does not want to merge their team with
 *
 * BODY PARAMETER team: ObjectID of the team that the calling user belongs toO
 */
async function rejectMerge(req, res) {
  try {
    let otherTeam = await Team.findOne({ _id: req.params.team });
    let myTeam = await Team.findOne({ users: req.user });
    if (!otherTeam || !myTeam || req.user !== String(myTeam.leader)) {
      return res.sendStatus(400);
    }
    const index = myTeam.mergeRequests.findIndex(
      (e) => String(e.requestingTeam) === String(otherTeam._id)
    );
    if (index > -1) {
      myTeam.mergeRequests.splice(index, 1);
    } else {
      return res.sendStatus(404);
    }
    await myTeam.save();
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

async function cancelRequest(req, res) {
  try {
    let otherTeam = await Team.findOne({ _id: req.params.team });
    const myTeam = await Team.findOne({ users: req.user });
    if (!otherTeam || !myTeam) {
      return res.sendStatus(400);
    }
    const index = otherTeam.mergeRequests.findIndex(
      (e) => String(e.requestingTeam) === String(myTeam._id)
    );
    if (index > -1) {
      otherTeam.mergeRequests.splice(index, 1);
    } else {
      return res.sendStatus(404);
    }
    await otherTeam.save();
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * List all teams that match the provided filter
 *
 * BODY PARAMETER filters: filters to list teams for
 */
async function listTeams(req, res) {
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;
  let filters =
    req.query.filters === undefined ? {} : JSON.parse(req.query.filters);
  if (filters.name) {
    filters["profile.name"] = { $regex: filters.name, $options: "i" };
    delete filters.name;
  }
  if (filters.skills) {
    filters["profile.skills"] = { $all: [...filters.skills] };
    delete filters.skills;
  }
  if (filters.desiredSkills) {
    filters["profile.desiredSkills"] = { $all: [...filters.desiredSkills] };
    delete filters.desiredSkills;
  }
  if (filters.competitiveness) {
    filters["profile.competitiveness"] = filters.competitiveness;
    delete filters.competitiveness;
  }
  if (filters.size) {
    filters.users = { $size: filters.size };
    delete filters.size;
  }
  var options = {
    skip: parseInt(req.query.page ?? 0) * pageSize,
    limit: pageSize,
  };
  try {
    if (filters.memberName) {
      const users = await User.find({
        name: { $regex: filters.memberName, $options: "i" },
      });
      const userIDs = [...users.map((e) => e._id)];
      filters.users = { ...filters.users, $in: userIDs };
      delete filters.memberName;
    }
    const itemCount = await Team.countDocuments(filters);
    const pages = Math.ceil(itemCount / pageSize);
    const data = await Team.find(filters, {}, options);
    let foundTeams = [];
    for (let teamItem of data) {
      let team = await standardizeTeamObj(teamItem);
      delete team.mergeRequests;
      //await addProfilesAndSanitize(team, true);
      foundTeams.push(team);
    }
    return res.json({
      list: foundTeams,
      pages,
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

/**
 * Get a team by id
 *
 * BODY PARAMETER id: id to get team of
 */
async function getTeam(req, res) {
  try {
    const team = await Team.findOne({ _id: req.params.team });
    if (!team) {
      return res.sendStatus(404);
    }
    let teamObj = team.toObject();
    delete teamObj.mergeRequests;
    await addProfiles(teamObj);
    return res.json(teamObj);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

async function getUserTeam(req, res) {
  try {
    const team = await Team.findOne({ users: req.params.user });
    if (!team) {
      return res.sendStatus(404);
    }
    let teamObj = team.toObject();
    //delete teamObj.mergeRequests;
    await addProfiles(teamObj, true);
    return res.json(teamObj);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

async function addProfilesAndSanitize(teamObj, addRoles = false) {
  await addProfiles(teamObj, addRoles);
  delete teamObj.mergeRequests;
  delete teamObj.leftSwipeList;
  delete teamObj.rightSwipeList;
  delete teamObj.__v;
}

async function getUserTeamMRs(req, res) {
  try {
    const team = await Team.findOne({ users: req.params.user });
    if (!team) {
      return res.sendStatus(404);
    }
    let teamObj = team.toObject();
    let ingoingRequests = [];
    for (const mr of teamObj.mergeRequests) {
      const otherTeam = await Team.findById(mr.requestingTeam);
      if (otherTeam) {
        let otherTeamObj = otherTeam.toObject();
        await addProfilesAndSanitize(otherTeamObj);
        let obj = { ...mr, requestingTeam: otherTeamObj };
        ingoingRequests.push(obj);
      }
    }
    const invitedTeams = await Team.find({
      mergeRequests: { $elemMatch: { requestingTeam: team._id } },
    });
    let outgoingRequests = [];
    for (const otherTeam of invitedTeams) {
      let otherTeamObj = otherTeam.toObject();
      let mr = {
        ...otherTeamObj.mergeRequests.filter(
          (e) => String(e.requestingTeam) === String(team._id)
        )[0],
      };
      await addProfilesAndSanitize(otherTeamObj);
      mr.requestedTeam = otherTeamObj;
      outgoingRequests.push(mr);
    }
    return res.json({ ingoing: ingoingRequests, outgoing: outgoingRequests });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * Update the calling user's team's profile
 *
 * BODY PARAMETER team: id to update team of
 *
 * BODY PARAMETER newProfile: new profile version
 */
async function update(req, res) {
  try {
    let myTeam = await Team.findOne({ users: req.user });
    if (!myTeam) {
      return res.sendStatus(400);
    }
    myTeam.profile = { ...req.body.newProfile };
    await myTeam.save();
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

const requiredTeamFields = [
  "name",
  "bio",
  "skills",
  "desiredSkills",
  "competitiveness",
  "desiredRoles",
];
const requiredUserFields = [
  "bio",
  "skills",
  "experience",
  "competitiveness",
  "roles",
];

async function isTeamSwipeReady(teamId) {
  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return false;
    }
    if (team.users.length === 1) {
      const user = await User.findById(team.leader);
      return (
        user &&
        user.name?.length !== 0 &&
        user.profile &&
        requiredUserFields.every(
          (e) => user.profile[e] && user.profile[e].length !== 0
        )
      );
    } else {
      return (
        team.profile &&
        requiredTeamFields.every(
          (e) => team.profile[e] && team.profile[e]?.length !== 0
        )
      );
    }
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function standardizeTeamObj(team) {
  let newTeam = team.toObject();
  await addProfilesAndSanitize(newTeam, team.users.length > 1);
  if (team.users.length === 1) {
    const user = await User.findById(team.users[0]);
    const userObj = user.toObject();
    newTeam.profile = {
      ...userObj.profile,
      name: userObj.name,
      githubFinished: !!userObj.profile.github,
    };
  } else {
    newTeam.profile.roles = [
      ...new Set(
        Object.values(newTeam.profiles)
          .map((e) => e.roles)
          .flat()
      ),
    ];
  }
  return newTeam;
}

function prioritizeSkillMatches(yourTeam, teamList) {
  function skillScore(team) {
    let out = 0;
    if (yourTeam.profile.desiredSkills) {
      const intersection = team.profile.skills.filter((e) =>
        yourTeam.profile.desiredSkills.includes(e)
      );
      out += intersection.length * 2;
    }
    if (team.profile.desiredSkills) {
      const intersection = yourTeam.profile.skills.filter((e) =>
        team.profile.desiredSkills.includes(e)
      );
      out += intersection.length;
    }
    return out;
  }

  function roleScore(team) {
    let out = 0;
    if (yourTeam.profile.desiredRoles && team.profile.roles) {
      const intersection = team.profile.roles.filter((e) =>
        yourTeam.profile.desiredRoles.includes(e)
      );
      out += intersection.length * 2;
    }
    if (team.profile.desiredRoles && yourTeam.profile.roles) {
      const intersection = yourTeam.profile.roles.filter((e) =>
        team.profile.desiredRoles.includes(e)
      );
      out += intersection.length;
    }
    if (yourTeam.users.length === 1 && team.users.length === 1) {
      const disjointRoles = [
        ...yourTeam.profile.roles.filter(
          (e) => !team.profile.roles.includes(e)
        ),
        ...team.profile.roles.filter(
          (e) => !yourTeam.profile.roles.includes(e)
        ),
      ];
      out += disjointRoles.length;
    }
    return out;
  }

  function compScore(team) {
    return yourTeam.profile.competitiveness === team.profile.competitiveness
      ? 1
      : 0;
  }
  teamList.sort((a, b) => skillScore(b) - skillScore(a));
  teamList.sort((a, b) => roleScore(b) - roleScore(a));
  teamList.sort((a, b) => compScore(b) - compScore(a));
}

async function getAverageData(team) {
  const expOptions = ["<1", "1-3", ">3"];
  const users = await User.find({ team: team._id });
  let hours = 0;
  let experience = 0;
  for (const user of users) {
    hours += user.profile.hours ?? 12;
    experience += expOptions.indexOf(user.profile.experience);
  }
  hours /= users.length * 2;
  experience /= users.length * 24;
  return { hours, experience };
}

async function sortByAverages(yourTeam, teamList) {
  const yourAverageInfo = await getAverageData(yourTeam);
  let averageInfo = {};
  for (const team of teamList) {
    const info = await getAverageData(team);
    averageInfo[team._id] = info;
  }
  function averageScore(team) {
    return (
      Math.abs(averageInfo[team._id].hours - yourAverageInfo.hours) +
      Math.abs(averageInfo[team._id].experience - yourAverageInfo.experience)
    );
  }
  teamList.sort((a, b) => averageScore(a) - averageScore(b));
}

async function getTeamsToSwipe(req, res) {
  try {
    const team = await Team.findOne({ users: req.user });
    if (!team) {
      console.error("Invalid user ID provided");
      return res.sendStatus(400);
    }
    const swipeReady = await isTeamSwipeReady(team);
    if (!swipeReady) {
      return res.json({ ready: false, teams: [] });
    }
    const userFilter =
      req.query.idealSize && req.query.idealSize > 0
        ? { users: { $size: req.query.idealSize } }
        : { users: { $not: { $size: MAX_TEAM_SIZE } } };
    let teamList = await Team.find({
      ...userFilter,
      "profile.displayTeamProfile": true,
      _id: { $nin: [...team.leftSwipeList, ...team.rightSwipeList, team._id] },
    });
    if (!teamList) {
      console.error("no teams found");
      return res.sendStatus(404);
    }
    let out = [];
    for (const team of teamList) {
      const swipeReady = await isTeamSwipeReady(team);
      if (swipeReady) {
        const newTeam = await standardizeTeamObj(team);
        out.push(newTeam);
      }
    }
    const yourTeam = await standardizeTeamObj(team);
    await sortByAverages(yourTeam, out);
    prioritizeSkillMatches(yourTeam, out);
    return res.json({ ready: true, teams: out.slice(0, 5) });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

async function resetLeftSwipes(req, res) {
  try {
    const team = await Team.findOne({ users: req.user });
    if (!team) {
      console.error("Incorrect team ID provided");
      return res.sendStatus(400);
    }
    const list = "leftSwipeList";
    await Team.updateOne({ _id: team._id }, { $set: { [list]: [] } });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

async function generateTeamName(team) {
  if (team.profile.name) {
    return team.profile.name;
  }
  const leaderUser = await User.findById(team.leader);
  if (team.users.length > 1) {
    return `${leaderUser.name}'s team`;
  }
  return leaderUser.name;
}

async function swipe(req, res) {
  try {
    const team = await Team.findOne({ users: req.user });
    const otherTeam = await Team.findById(req.body.otherTeamID);
    if (!team || !otherTeam) {
      console.error("Incorrect team ID provided");
      return res.sendStatus(400);
    }
    const list = `${
      req.body.decision === "accept-committed" ? "right" : "left"
    }SwipeList`;
    await Team.updateOne(
      { _id: team._id },
      { $push: { [list]: otherTeam._id } },
      { upsert: true }
    );

    if (req.body.decision === "accept-committed") {
      const firstName = await generateTeamName(team);
      const secondName = await generateTeamName(otherTeam);
      const name = `${firstName} and ${secondName}`;

      let chat = new Chat({
        users: [...team.users, ...otherTeam.users],
        name: name,
        owner: req.user,
      });
      await chat.save();
    }
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

async function leaveTeam(req, res) {
  try {
    const team = await Team.findOne({ users: req.user });
    if (!team) {
      throw new Error("User not in a team!");
    }
    if (team.users.length === 1 || req.user === String(team.leader)) {
      return res.sendStatus(400);
    }
    if (team.users.length === 2) {
      team.displayTeamProfile = true;
    }
    team.users = [...team.users.filter((e) => String(e) !== req.user)];
    await team.save();
    const newTeam = await createTeam({ body: { user: req.user } }, res);
    return res.json(newTeam);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

async function updateMembership(req, res) {
  try {
    const team = await Team.findOne({ users: req.user });
    if (!team) {
      throw new Error("User not in a team!");
    }
    if (
      req.user !== String(team.leader) ||
      req.body.kickedUsers?.includes(req.user) ||
      (req.body.newLeader && req.body.kickedUsers?.includes(req.body.newLeader))
    ) {
      return res.sendStatus(400);
    }
    if (req.body.newLeader) {
      team.leader = req.body.newLeader;
      await team.save();
    }
    let newTeams = {};
    if (req.body.kickedUsers?.length > 0) {
      for (const kickedUserID of req.body.kickedUsers) {
        const kickedUser = await User.findById(kickedUserID);
        if (!kickedUser) {
          return res.sendStatus(404);
        }
        team.users = [...team.users.filter((e) => String(e) !== kickedUserID)];
        await team.save();
        const newTeam = await createTeam({ body: { user: kickedUserID } }, res);
        newTeams[kickedUserID] = newTeam._id;
      }
    }
    let teamObj = team.toObject();
    //delete teamObj.mergeRequests;
    await addProfiles(teamObj);
    return res.json({ team: teamObj, newTeams });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

module.exports = {
  router,
  requestMerge,
  acceptMerge,
  rejectMerge,
  listTeams,
  getTeam,
  update,
  getTeamsToSwipe,
  resetLeftSwipes,
};
