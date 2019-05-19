const express = require("express");
const router = express.Router();

const controller = require("./quiz_controller");
const { verifyToken } = require("../config/jwt");

router.get("/quiz/latest", controller.quizLatest);
router.get("/quiz", controller.quizSingle);
router.get("/quiz/explore", controller.quizExplore);
router.get("/quiz/rating", controller.quizAddRating);

module.exports = router;
