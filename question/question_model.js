const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new mongoose.Schema({
  questionBody: { type: String, required: true },
  questionCategory: { type: String, required: true },
  answers: [{ answerText: String, isCorrect: Boolean }],
  isReported: { type: Boolean, required: false, default: false },
  isApproved: { type: Boolean, required: false, default: false },
  lastEdited: { type: Date, required: false }
});

const Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;
