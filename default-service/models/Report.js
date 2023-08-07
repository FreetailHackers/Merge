const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  contents: {
    type: String,
    required: true,
  },
  reported: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  ],
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  chatOrigin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

module.exports = mongoose.model("reports", ReportSchema);
