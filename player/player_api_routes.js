const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

const api = require("../question/question_controller");

router.get("/", api.userDashboardView);

module.exports = router;
