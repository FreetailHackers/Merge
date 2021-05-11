const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
   _id:  Number,
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
      // seen: {
      //    type: {Boolean},
      //    default: false
      // }
   }]
});

// ChatSchema.index({ userIds: 1 });

module.exports = ChatSchema;