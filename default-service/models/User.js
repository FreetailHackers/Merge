const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  team: {
    type: Schema.Types.ObjectId,
    required: false, // required in practice, but not to create a user in the database
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  profile: {
    socialMedia: { type: String, required: false },
    school: String,
    major: String,
    class: String,
    skills: [String],
    experience: String,
    intro: String,
    profilePictureUrl: String,
    github: String,
    linkedin: String,
    portfolio: String,
    hours: Number,
    categories: [String],
    roles: [String],
    competitiveness: String,
  },
  //make this a set
  blockList: [],
});

module.exports = mongoose.model("users", UserSchema);
