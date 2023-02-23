const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  ],
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  ],
  name: {
    type: String,
    required: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("chats", ChatSchema);
