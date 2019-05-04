const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

const api = require("../controllers/question.controller");

router.get("/test", (req, res) => {
  const Answer = require("../models/answer.model");
  const Question = require("../models/question.model");
  const faker = require("faker");
  let answers = [];

  let i;
  for (i = 0; i < 5; i++) {
    answers.push({ answerText: faker.lorem.word(), isCorrect: false });
    answers.push({ answerText: faker.lorem.word(), isCorrect: false });
    answers.push({ answerText: faker.lorem.word(), isCorrect: true });
    answers.push({ answerText: faker.lorem.word(), isCorrect: false });

    let newQuestion = new Question({
      questionBody: faker.lorem.sentence(),
      questionCategory: faker.lorem.word(),
      answers
    });

    newQuestion
      .save()
      .then(() => {
        console.log("Question added successfully.");
      })
      .catch(err => console.log(err));
  }
});

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
