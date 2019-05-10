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

  for (let i = 0; i < 150; i++) {
    let types = ["Movies", "TV Shows", "Geography", "History", "Mixed"];
    let rndType = Math.floor(Math.random() * (+4 - +0)) + +0;

    let newQuiz = new Quiz({
      quizName: faker.lorem.sentence(),
      quizType: types[rndType]
    });

    newQuiz.save().then(quiz => {
      for (let j = 0; j < randomQuestions; j++) {
        let rnd = Math.floor(Math.random() * (+max - +min)) + +min;
        Question.findOne({})
          .skip(rnd)
          .then(question => {
            Quiz.update({ _id: quiz._id }, { $push: { questions: question } }).then(quiz => {
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
router.get("/details/:id", controller.quizDetailsButton);

router.post("/add", controller.addNewQuizMongoose);
router.get("/addquestion/:quizId/:questionId/:page", controller.addQuestionsToQuizMongoose);
router.get("/removequestion/:quizId/:questionId/:page", controller.removeQuestionFromQuizMongoose);

module.exports = router;
