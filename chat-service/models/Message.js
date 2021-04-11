const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  fromUserId: {
    type: String,
    required: true
  },
  toUserId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

MessageSchema.index({ fromUserId: 1 });
MessageSchema.index({ toUserId: 1 });
MessageSchema.index({ date: 1 });
MessageSchema.index({ toUserId: 1, fromUserId: 1 });

module.exports = Message = mongoose.model("messages", MessageSchema);
