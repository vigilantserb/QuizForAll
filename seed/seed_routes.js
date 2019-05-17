const express = require("express");
const router = express.Router();

const api = require("./seed_controller");

router.get("/player", api.seedPlayers);
router.get("/question", api.seedQuestions);
router.get("/quiz", api.seedQuizzes);
router.get("/quizqs", api.seedQuizQuestions);

module.exports = router;
