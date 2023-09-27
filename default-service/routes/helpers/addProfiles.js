const User = require("../../models/User");

module.exports = async function addProfiles(obj, addRoles = false) {
  obj.profiles = {};
  for (const user of obj.users) {
    obj.profiles[user] = {};
    const userObj = await User.findOne({ _id: user });
    obj.profiles[user].name = userObj.name;
    obj.profiles[user].profilePictureUrl = userObj.profile?.profilePictureUrl;
    if (addRoles) {
      obj.profiles[user].roles = userObj.profile?.roles;
    }
  }
};
