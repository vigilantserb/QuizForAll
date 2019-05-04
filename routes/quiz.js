const express = require("express");
const router = express.Router();

const { forwardAuthenticated } = require("../config/auth");

const controller = require("../controllers/quiz.controller");

router.get("/test", (req, res, next) => {
  const Quiz = require("../models/quiz.model");
  const Question = require("../models/question.model");
  const faker = require("faker");

  let min = 5;
  let max = 20;
  let randomQuestions = Math.floor(Math.random() * (+max - +min)) + +min;
  let randomQuizzes = Math.floor(Math.random() * (+max - +min)) + +min;

  for (let i = 0; i < randomQuizzes; i++) {
    let newQuiz = new Quiz({
      quizName: faker.lorem.sentence(),
      quizType: faker.lorem.word()
    });

    newQuiz.save().then(quiz => {
      for (let j = 0; j < randomQuestions; j++) {
        Question.findOne({}, "_id").then(question => {
          Quiz.update({ _id: quiz._id }, { $push: { questions: question._id } }).then(quiz => {
            console.log("question added to quiz.");
          });
        });
      }
    });
  }
});

router.get("/add", controller.addNewQuizView);
router.get("/questions/:id/:page", controller.addQuestionsToQuizView);
router.get("/pending/:page", controller.pendingQuizzesView);
router.get("/pool/:page", controller.poolQuizzesView);
router.get("/reported/:page", controller.reportedQuizzesView);
router.get("/dashboard", controller.quizDashboardView);

router.get("/delete/:id/:page/:type", controller.deleteQuizButton);
router.get("/approve/:id/:page/:type", controller.approveQuizButton);
router.get("/unapprove/:id/:page/:type", controller.unapproveQuizButton);
router.get("/edit/:id/:page/:type", controller.editQuizButton);
router.get("/review/:id/:page/:type", controller.reviewQuizButton);

router.post("/add", controller.addNewQuizMongoose);
router.get("/addquestion/:quizId/:questionId/:page", controller.addQuestionsToQuizMongoose);
router.get("/removequestion/:quizId/:questionId/:page", controller.removeQuestionFromQuizMongoose);

module.exports = router;
