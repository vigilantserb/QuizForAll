const express = require("express");
const router = express.Router();

const controller = require("../controllers/player.mobile.controller");
const { verifyToken } = require("../config/jwt");

router.get("/login", controller.playerLogin);
router.get("/register", controller.playerRegister);
router.get("/token", controller.playerRefreshAccessToken);
router.get("/verify/:token", controller.playerVerifyAccount);
router.get("/quiz/:id", verifyToken, controller.playerQuiz);

module.exports = router;
