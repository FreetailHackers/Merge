const User = require("../../models/User");

module.exports = async function addProfiles(obj) {
  obj.profiles = {};
  for (const user of obj.users) {
    obj.profiles[user] = {};
    const userObj = await User.findOne({ _id: user });
    obj.profiles[user].name = userObj.name;
    obj.profiles[user].profilePictureUrl =
      userObj.profile[0]?.profilePictureUrl;
  }
};
