const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

const api = require("../controllers/question.controller");

router.get("/", api.userDashboardView);

module.exports = router;
