const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
   userIds: [String],
   messages: [{
      fromUserId: {
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
      },
      seen: {
         type: Boolean,
         default: false
      }
   }]
});

MessageSchema.index({ userIds: 1 });

module.exports = Message = mongoose.model("messages", MessageSchema);
