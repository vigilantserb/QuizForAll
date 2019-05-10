const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizSchema = new mongoose.Schema({
  quizType: { type: String, required: true },
  quizName: { type: String, required: true },
  questions: [{ type: Object, required: false }],
  ratings: [{ type: Object, required: false }],
  isReported: { type: Boolean, required: false, default: false },
  isApproved: { type: Boolean, required: false, default: false },
  lastEdited: { type: Date, required: false }
});

const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;
