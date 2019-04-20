const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

const api = require("../controllers/api.controller");

router.get("/test", (req, res) => {
  const Answer = require("../models/answer.model");
  const Question = require("../models/question.model");
  const faker = require("faker");
  let answerArray = [];

  let i;
  for (i = 0; i < 10; i++) {
    answerArray.push({ answerText: faker.lorem.word(), isCorrect: false });
    answerArray.push({ answerText: faker.lorem.word(), isCorrect: false });
    answerArray.push({ answerText: faker.lorem.word(), isCorrect: true });
    answerArray.push({ answerText: faker.lorem.word(), isCorrect: false });

    Answer.insertMany(answerArray).then(answers => {
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
    });
  }
});

router.get("/question", api.addQuestionView);
router.get("/question/pending/:page", api.pendingQuestionView);
router.get("/question/pool/:page", api.poolQuestionView);
router.get("/question/reported/:page", api.reportQuestionView);
router.get("/question/dashboard", api.questionDashboardView);

router.get("/about", api.aboutView);
router.get("/submit", api.submitIdeaView);
router.get("/users", api.userDashboardView);

router.get("/question/delete/:id/:page/:type", api.deleteQuestionButton);
router.get("/question/approve/:id/:page/:type", api.approveQuestionButton);
router.get("/question/unapprove/:id/:page/:type", api.unapproveQuestionButton);
router.get("/question/edit/:id/:page/:type", api.editQuestionButton);
router.get("/question/review/:id/:page/:type", api.reviewQuestionButton);

router.post("/question", api.addQuestionMongoose);

router.post("/submit", api.submitIdeaEmail);

module.exports = router;
