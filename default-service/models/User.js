const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
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
  profile: [
    {
      socialMedia: { String, required: false },
      school: String,
      major: String,
      class: String,
      skills: String,
      experience: String,
      intro: String,
      profilePictureUrl: String,
      github: String,
      linkedin: String,
      portfolio: String,
    },
  ],
});

module.exports = mongoose.model("users", UserSchema);
