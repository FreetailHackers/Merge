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
    const myTeam = await Team.findOne({ users: { $in: [req.user] } });
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
    let myTeam = await Team.findOne({ users: { $in: [req.user] } });
    if (!otherTeam || !myTeam || req.user != myTeam.leader) {
      return res.sendStatus(400);
    }
    const index = myTeam.mergeRequests.findIndex(
      (e) => String(e.requestingTeam) === String(otherTeam._id)
    );
    if (index == -1) {
      return res.sendStatus(400);
    }
    if (otherTeam.users.length + myTeam.users.length > MAX_TEAM_SIZE) {
      return res.sendStatus(400);
    }
    const absorbed = otherTeam.users.length >= myTeam.users.length;
    let absorbingTeam = absorbed ? otherTeam : myTeam;
    let absorbedTeam = absorbed ? myTeam : otherTeam;
    for (const userID of absorbedTeam.users) {
      let user = await User.findOne({ _id: userID });
      user.team = absorbingTeam._id;
      await user.save();
      absorbingTeam.users.push(userID);
    }
    await Team.deleteOne({ _id: absorbedTeam._id });
    if (!absorbed) {
      myTeam.mergeRequests.splice(index, 1);
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
    let myTeam = await Team.findOne({ users: { $in: [req.user] } });
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
    const myTeam = await Team.findOne({ users: { $in: [req.user] } });
    if (!otherTeam || !myTeam || req.user !== String(myTeam.leader)) {
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
    filters["profile.wantedSkills"] = { $all: [...filters.desiredSkills] };
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
    skip: parseInt(req.query.page ?? 0) * 10,
    limit: 10,
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
    const pages = Math.ceil(itemCount / 10);
    const data = await Team.find(filters, {}, options);
    let foundTeams = [];
    for (let teamItem of data) {
      let team = teamItem.toObject();
      delete team.mergeRequests;
      await addProfilesAndSanitize(team);
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
    const team = await Team.findOne({ users: { $in: [req.params.user] } });
    if (!team) {
      return res.sendStatus(404);
    }
    let teamObj = team.toObject();
    //delete teamObj.mergeRequests;
    await addProfiles(teamObj);
    return res.json(teamObj);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

async function addProfilesAndSanitize(teamObj) {
  await addProfiles(teamObj);
  delete teamObj.mergeRequests;
  delete teamObj.leftSwipeList;
  delete teamObj.rightSwipeList;
  delete teamObj.__v;
}

async function getUserTeamMRs(req, res) {
  try {
    const team = await Team.findOne({ users: { $in: [req.params.user] } });
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
    let myTeam = await Team.findOne({ users: { $in: [req.user] } });
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
  "wantedSkills",
  "competitiveness",
];
const requiredUserFields = ["intro", "skills", "experience", "competitiveness"];

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
        requiredUserFields.every((e) => user.profile[e]?.length !== 0)
      );
    } else {
      return (
        team.profile &&
        requiredTeamFields.every((e) => team.profile[e]?.length !== 0)
      );
    }
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function getTeamsToSwipe(req, res) {
  try {
    const team = await Team.findOne({ users: { $in: [req.user] } });
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
        let newTeam = team.toObject();
        await addProfilesAndSanitize(newTeam);
        if (team.users.length === 1) {
          const user = await User.findById(team.users[0]);
          const userObj = user.toObject();
          newTeam.profile = {
            ...userObj.profile,
            name: userObj.name,
            githubFinished: !!userObj.profile.github,
          };
        }
        out.push(newTeam);
      }
    }
    return res.json({ ready: true, teams: out.slice(0, 5) });
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
    const team = await Team.findOne({ users: { $in: [req.user] } });
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
    const team = await Team.findOne({ users: { $in: [req.user] } });
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
    const team = await Team.findOne({ users: { $in: [req.user] } });
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
    if (req.body.kickedUsers?.length > 0) {
      for (const kickedUserID of req.body.kickedUsers) {
        const kickedUser = await User.findById(kickedUserID);
        if (!kickedUser) {
          return res.sendStatus(404);
        }
        team.users = [...team.users.filter((e) => String(e) !== kickedUserID)];
        await team.save();
        await createTeam({ body: { user: kickedUserID } }, res);
      }
    }
    let teamObj = team.toObject();
    //delete teamObj.mergeRequests;
    await addProfiles(teamObj);
    return res.json(teamObj);
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
};