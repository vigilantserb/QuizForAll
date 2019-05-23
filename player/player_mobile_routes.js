const express = require("express");
const router = express.Router();

const controller = require("./player_mobile_controller");
const { verifyToken } = require("../config/jwt");

router.post("/login", controller.playerLogin);
router.post("/register", controller.playerRegister);
router.get("/token", controller.playerRefreshAccessToken);
router.get("/player/verify/:token", controller.playerVerifyAccount);
router.post("/player/recovery", controller.playerForgotPasswordEmail);
router.post("/player/update", controller.playerPasswordUpdate);

router.get("/player/quizFinished", controller.playerUpdatePlayedQuiz);

router.post("/player/addQuizToFavorites", controller.addQuizToFavorites);
router.post("/player/removeQuizFromFavorites", controller.removeQuizToFavorites);

module.exports = router;
