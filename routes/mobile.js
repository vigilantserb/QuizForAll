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
router.get("/player/quiz", controller.quizFinish);
router.get("/player/quizFinished", controller.playerUpdatePlayedQuiz);

router.get("/quiz/latest/:page", controller.quizLatest);
router.get("/quiz", controller.quizSingle);
router.get("/quiz/explore", controller.quizExplore);
router.get("/quiz/rating", controller.quizAddRating);

//subroutes needed for
//player
//quiz

module.exports = router;
