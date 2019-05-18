const express = require("express");
const router = express.Router();

const controller = require("./player_mobile_controller");
const { verifyToken } = require("../config/jwt");

router.post("/login", controller.playerLogin);
router.get("/register", controller.playerRegister);
router.get("/token", controller.playerRefreshAccessToken);
router.get("/player/verify/:token", controller.playerVerifyAccount);
router.get("/player/recovery", controller.playerForgotPasswordEmail);
router.get("/player/update", controller.playerPasswordUpdate);

router.get("/player/quizFinished", controller.playerUpdatePlayedQuiz);

module.exports = router;
