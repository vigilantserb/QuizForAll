const express = require("express");
const router = express.Router();

const { forwardAuthenticated } = require("../config/auth");

const controller = require("../controllers/quiz.controller");

router.get("/add", controller.addNewQuizView);
router.get("/questions/:id/:page", controller.addQuestionsToQuizView);
router.get("/dashboard", controller.quizDashboardView);

router.post("/add", controller.addNewQuizMongoose);
router.get("/addquestion/:quizId/:questionId/:page", controller.addQuestionsToQuizMongoose);
router.get("/removequestion/:quizId/:questionId/:page", controller.removeQuestionFromQuizMongoose);

module.exports = router;
