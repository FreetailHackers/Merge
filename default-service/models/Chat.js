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
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

module.exports = mongoose.model("chats", ChatSchema);
