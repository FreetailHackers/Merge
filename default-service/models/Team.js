const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const TeamSchema = new Schema({
  leader: {
    type: ObjectId,
    required: true,
  },
  users: {
    type: [ObjectId],
    required: true,
  },
  mergeRequests: [
    {
      requestingTeam: { type: ObjectId, required: true },
      message: { type: String, required: false },
      timestamp: { type: Date, required: true, default: Date.now },
    },
  ],
  profile: {
    displayTeamProfile: {
      type: Boolean,
      required: true,
      default: true,
    },
    name: {
      type: String,
      required: false,
    },
    skills: {
      type: [String],
      required: false,
    },
    desiredSkills: {
      type: [String],
      required: false,
    },
    competitiveness: {
      type: String,
      required: false,
    },
    desiredRoles: {
      type: [String],
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
  },
  leftSwipeList: {
    type: [ObjectId],
    required: false,
  },
  rightSwipeList: {
    type: [ObjectId],
    required: false,
  },
});

module.exports = mongoose.model("teams", TeamSchema);
