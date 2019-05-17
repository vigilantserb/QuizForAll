const express = require("express");
const router = express.Router();

const { forwardAuthenticated } = require("../config/auth");

const controller = require("./quiz_controller");

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
