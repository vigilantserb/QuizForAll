const express = require("express");
const router = express.Router();

const controller = require("../controllers/player.mobile.controller");
const { verifyToken } = require("../config/jwt");

router.get("/login", controller.playerLogin);
router.get("/register", controller.playerRegister);
router.get("/token", controller.playerRefreshAccessToken);
router.get("/player/verify/:token", controller.playerVerifyAccount);
router.get("/player/recovery", controller.playerForgotPasswordEmail);
router.get("/player/update", controller.playerPasswordUpdate);

router.get("/quiz/latest", controller.latestQuizzes);
router.get("/quiz", controller.playerQuiz);
router.get("/quiz/explore", controller.exploreQuizzes);

router.get("/player/quizFinished", controller.updatePlayedQuizzesPlayer);

//subroutes needed for
//player
//quiz

module.exports = router;
