const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

const api = require("./question_controller");

router.get("/", api.addQuestionView);
router.get("/pending/:page", api.pendingQuestionView);
router.get("/pool/:page", api.poolQuestionView);
router.get("/reported/:page", api.reportQuestionView);
router.get("/dashboard", api.questionDashboardView);

router.get("/delete/:id/:page/:type", api.deleteQuestionButton);
router.get("/approve/:id/:page/:type", api.approveQuestionButton);
router.get("/unapprove/:id/:page/:type", api.unapproveQuestionButton);
router.get("/edit/:id/:page/:type", api.editQuestionButton);
router.get("/review/:id/:page/:type", api.reviewQuestionButton);

router.post("/", api.addQuestionMongoose);

router.post("/submit", api.submitIdeaEmail);

module.exports = router;
