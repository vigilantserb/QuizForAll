const Question = require("../models/question.model");
const nodemailer = require("nodemailer");

let questionsPerPage = 10,
  numberOfButtonsPerPage = 10;

const { generatePageButtons } = require("../api/utils");

/* Views */

module.exports.addQuestionView = (req, res) => {
  res.render("add_question", {
    user: req.user,
    style: "style.css"
  });
};

module.exports.submitIdeaView = (req, res) => {
  res.render("submit_idea", {
    user: req.user,
    style: "style.css"
  });
};

module.exports.aboutView = (req, res) => {
  res.render("about", {
    user: req.user,
    style: "style.css"
  });
};

module.exports.userDashboardView = (req, res) => {
  res.render("users_dashboard", {
    user: req.user,
    style: "style.css"
  });
};

module.exports.pendingQuestionView = (req, res, next) => {
  let perPage = 10,
    currentPage = Math.max(0, req.params.page);

  Question.countDocuments({ isApproved: false }, (err, c) => {
    if (err) return next(err);

    if (c) {
      Question.find({ isApproved: false })
        .populate("answers", "answerText")
        .limit(perPage)
        .skip(perPage * (currentPage - 1))
        .sort({ field: "asc", _id: -1 })
        .exec((err, newestQuestions) => {
          if (err) return next(err);

          generatePageButtons(c, questionsPerPage, numberOfButtonsPerPage, currentPage, pages => {
            res.render("question_pending", {
              user: req.user,
              style: "style.css",
              newestQuestions,
              pages,
              page: currentPage
            });
          });
        });
    } else {
      res.render("question_pending", {
        user: req.user,
        style: "style.css"
      });
    }
  });
};

module.exports.poolQuestionView = (req, res, next) => {
  let perPage = 10,
    currentPage = Math.max(0, req.params.page);

  Question.countDocuments({ isApproved: true }, (err, c) => {
    if (err) return next(err);

    if (c) {
      Question.find({ isApproved: true })
        .populate("answers", "answerText")
        .limit(perPage)
        .skip(perPage * (currentPage - 1))
        .sort({ field: "asc", _id: -1 })
        .exec((err, approvedQuestions) => {
          if (err) return next(err);

          generatePageButtons(c, questionsPerPage, numberOfButtonsPerPage, currentPage, pages => {
            res.render("question_pool", {
              user: req.user,
              style: "style.css",
              approvedQuestions,
              pages,
              page: currentPage
            });
          });
        });
    } else {
      res.render("question_pool", {
        user: req.user,
        style: "style.css"
      });
    }
  });
};

module.exports.reportQuestionView = (req, res, next) => {
  let perPage = 10,
    currentPage = Math.max(0, req.params.page);

  Question.countDocuments({ isReported: true }, (err, c) => {
    if (err) return next(err);

    if (c) {
      Question.find({ isReported: true })
        .populate("answers", "answerText")
        .limit(perPage)
        .skip(perPage * (currentPage - 1))
        .sort({ field: "asc", _id: -1 })
        .exec((err, reportedQuestions) => {
          if (err) return next(err);

          generatePageButtons(c, questionsPerPage, numberOfButtonsPerPage, currentPage, pages => {
            res.render("question_reported", {
              user: req.user,
              style: "style.css",
              reportedQuestions,
              pages,
              page: currentPage
            });
          });
        });
    } else {
      res.render("question_reported", {
        user: req.user,
        style: "style.css"
      });
    }
  });
};

module.exports.questionDashboardView = (req, res, next) => {
  Question.find({ isApproved: false })
    .sort({ field: "asc", _id: -1 })
    .limit(5)
    .exec((err, newestQuestions) => {
      if (err) return next(err);

      Question.find({ isApproved: true })
        .sort({ field: "asc", _id: -1 })
        .limit(5)
        .exec((err, approvedQuestions) => {
          if (err) return next(err);

          Question.find({ isReported: true })
            .sort({ field: "asc", _id: -1 })
            .limit(5)
            .exec((err, reportedQuestions) => {
              if (err) return next(err);

              res.render("question_dashboard", {
                newestQuestions,
                approvedQuestions,
                reportedQuestions,
                style: "style.css"
              });
            });
        });
    });
};

/* Buttons */

module.exports.deleteQuestionButton = (req, res, next) => {
  Question.deleteOne({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "Question successfully deleted");
      res.redirect(`/question/${req.params.type}/${req.params.page}`);
    })
    .catch(err => next(err));
};

module.exports.editQuestionButton = (req, res, next) => {
  Question.findOne({ _id: req.params.id })
    .then(() => {
      req.flash("error_msg", "Functionality in development.");
      res.redirect(`/question/${req.params.type}/${req.params.page}`);
    })
    .catch(err => next(err));
};

module.exports.approveQuestionButton = (req, res, next) => {
  Question.findOneAndUpdate({ _id: req.params.id }, { isApproved: true, lastEdited: Date.now() })
    .then(question => {
      req.flash("success_msg", "Question successfully approved.");
      res.redirect(`/question/${req.params.type}/${req.params.page}`);
    })
    .catch(err => next(err));
};

module.exports.unapproveQuestionButton = (req, res, next) => {
  Question.findOneAndUpdate({ _id: req.params.id }, { isApproved: false, lastEdited: Date.now() })
    .then(question => {
      req.flash("success_msg", "Question successfully unapproved.");
      res.redirect(`/question/${req.params.type}/${req.params.page}`);
    })
    .catch(err => next(err));
};

module.exports.reviewQuestionButton = (req, res, next) => {
  Question.findOneAndUpdate({ _id: req.params.id }, { isReported: false, lastEdited: Date.now() })
    .then(question => {
      req.flash("success_msg", "Question successfully reviewed and added back into the pool.");
      res.redirect(`/question/${req.params.type}/${req.params.page}`);
    })
    .catch(err => next(err));
};

/* Mongoose */

module.exports.addQuestionMongoose = (req, res, next) => {
  let { questionBody, questionCategory, isCorrect, answer1, answer2, answer3, answer4 } = req.body;
  let errors = [];

  if (!questionBody || !questionCategory || !answer1 || !answer2 || !answer3 || !answer4) {
    errors.push({ msg: "Please fill all the fields." });
  }

  if (isCorrect !== undefined) {
    if (isCorrect.length > 1) {
      errors.push({ msg: "There can be only one right answer." });
    }
  } else {
    errors.push({ msg: "Please choose an answer." });
  }

  if (errors.length > 0) {
    res.render("add_question", {
      errors,
      style: "style.css",
      questionBody,
      questionCategory,
      answer1,
      answer2,
      answer3,
      answer4
    });
  } else {
    let correctAnswer = isCorrect[0];
    let isCorrectArray = [];
    let answers = [];

    if (correctAnswer === "1") isCorrectArray.push(true);
    else isCorrectArray.push(false);
    if (correctAnswer === "2") isCorrectArray.push(true);
    else isCorrectArray.push(false);
    if (correctAnswer === "3") isCorrectArray.push(true);
    else isCorrectArray.push(false);
    if (correctAnswer === "4") isCorrectArray.push(true);
    else isCorrectArray.push(false);

    answers.push({ answerText: answer1, isCorrect: isCorrectArray[0] });
    answers.push({ answerText: answer2, isCorrect: isCorrectArray[1] });
    answers.push({ answerText: answer3, isCorrect: isCorrectArray[2] });
    answers.push({ answerText: answer4, isCorrect: isCorrectArray[3] });
    let newQuestion = new Question({
      questionBody,
      questionCategory,
      answers
    });

    newQuestion
      .save()
      .then(question => {
        req.flash("success_msg", "Question submitted successfully.");
        res.redirect("/dashboard");
      })
      .catch(err => next(err));
  }
};

module.exports.submitIdeaEmail = (req, res, next) => {
  let { email, body } = req.body;
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "forthepeoplequizapp@gmail.com",
      pass: "quizapp995"
    }
  });
  const mailOptions = {
    from: "noreply@quizapp.com",
    to: "forthepeoplequizapp@gmail.com",
    subject: "New idea submitted",
    html: `Email sender - ${email}. Submition body - ${body}`
  };
  transporter.sendMail(mailOptions, function(err, info) {
    if (err) return next(err);
    else {
      req.flash("success_msg", "Question submitted successfully.");
      res.redirect("/submit");
    }
  });
};
