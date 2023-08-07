const Team = require("../../models/Team");
const User = require("../../models/User");
const addProfiles = require("./addProfiles");

module.exports = async function createTeam(req, res) {
  const userID = req.body.user;
  try {
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return res.sendStatus(400);
    }
    const team = new Team({
      users: [userID],
      leader: userID,
      mergeRequests: [],
    });
    const saved = await team.save();
    user.team = team._id;
    await user.save();
    let teamObj = saved.toObject();
    await addProfiles(teamObj);
    return teamObj;
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};
