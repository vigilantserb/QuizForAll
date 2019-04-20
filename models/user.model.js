const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: false },
  date: { type: Date, default: Date.now },
  isVerified: { type: Boolean, required: true, default: false }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
