const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizSchema = new mongoose.Schema({
  quizType: { type: String, required: true },
  quizName: { type: String, required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: "Question", required: false }]
});

const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;
