const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

const api = require("./api_controller");

router.get("/submit", api.submitIdeaView);

module.exports = router;
