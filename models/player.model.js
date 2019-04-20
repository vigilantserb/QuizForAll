const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  correctAnswers: { type: String, required: true, default: "0" },
  wrongAnswers: { type: String, required: true, default: "0" },
  attendedQuizes: { type: String, required: true, default: "0" },
  isBanned: { type: String, required: true, default: false },
  isVerified: { type: String, required: true, default: false },
  latestActivity: { type: Date, required: false }
});

const Question = mongoose.model("Player", PlayerSchema);

module.exports = Question;
