const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: false },
  date: { type: Date, default: Date.now },
  favoriteQuizzes: [{ type: Schema.Types.ObjectId, ref: "Quiz", required: false }],
  playedQuizzes: [{ type: Schema.Types.ObjectId, ref: "Quiz", required: false }],
  isVerified: { type: Boolean, required: true, default: false },
  isAdmin: { type: Boolean, required: true, default: false }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
