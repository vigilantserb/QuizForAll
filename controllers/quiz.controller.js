const Quiz = require("../models/quiz.model");
const Question = require("../models/question.model");

let questionsPerPage = 10,
  numberOfButtonsPerPage = 10;

const { generatePageButtons } = require("../api/utils");

module.exports.addNewQuizView = (req, res) => {
  res.render("quiz_add_quiz", {
    style: "style.css"
  });
};

module.exports.pendingQuizzesView = (req, res, next) => {
  let perPage = 10,
    currentPage = Math.max(0, req.params.page);

  Quiz.countDocuments({ isApproved: false }).then(c => {
    if (c) {
      Quiz.find({ isApproved: false })
        .populate("questions", "id")
        .limit(perPage)
        .skip(perPage * (currentPage - 1))
        .sort({ field: "asc", _id: -1 })
        .exec((err, newestQuizzes) => {
          if (err) next(err);

          for (let i = 0; i < newestQuizzes.length; i++) newestQuizzes[i].questionCount = newestQuizzes[i].questions.length;

          generatePageButtons(c, questionsPerPage, numberOfButtonsPerPage, currentPage, pages => {
            res.render("quiz_pending", {
              newestQuizzes,
              pages,
              page: currentPage,
              user: req.user,
              style: "style.css"
            });
          });
        });
    } else {
      req.flash("error_msg", "Fetching quizzes unsuccessful.");
      res.render("quiz_pending", {
        user: req.user,
        style: "style.css"
      });
    }
  });
};

module.exports.poolQuizzesView = (req, res) => {
  let perPage = 10,
    currentPage = Math.max(0, req.params.page);
  Quiz.countDocuments({ isApproved: true }).then(c => {
    if (c) {
      Quiz.find({ isApproved: true })
        .populate("questions", "id")
        .limit(perPage)
        .skip(perPage * (currentPage - 1))
        .sort({ field: "asc", _id: -1 })
        .exec((err, poolQuizzes) => {
          if (err) next(err);

          for (let i = 0; i < poolQuizzes.length; i++) poolQuizzes[i].questionCount = poolQuizzes[i].questions.length;

          generatePageButtons(c, questionsPerPage, numberOfButtonsPerPage, currentPage, pages => {
            res.render("quiz_pool", {
              poolQuizzes,
              pages,
              page: currentPage,
              user: req.user,
              style: "style.css"
            });
          });
        });
    } else {
      req.flash("error_msg", "Fetching quizzes unsuccessful.");
      res.render("quiz_pool", {
        user: req.user,
        style: "style.css"
      });
    }
  });
};

module.exports.reportedQuizzesView = (req, res) => {
  let perPage = 10,
    currentPage = Math.max(0, req.params.page);
  Quiz.countDocuments({ isReported: true }).then(c => {
    if (c) {
      Quiz.find({ isApproved: true })
        .populate("questions", "id")
        .limit(perPage)
        .skip(perPage * (currentPage - 1))
        .sort({ field: "asc", _id: -1 })
        .exec((err, reportedQuizzes) => {
          if (err) next(err);

          for (let i = 0; i < reportedQuizzes.length; i++) reportedQuizzes[i].questionCount = reportedQuizzes[i].questions.length;

          generatePageButtons(c, questionsPerPage, numberOfButtonsPerPage, currentPage, pages => {
            res.render("quiz_reported", {
              reportedQuizzes,
              pages,
              page: currentPage,
              user: req.user,
              style: "style.css"
            });
          });
        });
    } else {
      req.flash("error_msg", "Fetching quizzes unsuccessful.");
      res.render("quiz_reported", {
        user: req.user,
        style: "style.css"
      });
    }
  });
};

module.exports.addQuestionsToQuizView = (req, res, next) => {
  let perPage = 10,
    currentPage = Math.max(0, req.params.page);
  Quiz.findById(req.params.id)
    .populate("questions", "id")
    .then(quiz => {
      Question.countDocuments({ isApproved: false }, (err, c) => {
        if (err) return next(err);

        if (c) {
          Question.find({ isApproved: true })
            .limit(perPage)
            .skip(perPage * (currentPage - 1))
            .sort({ field: "asc", _id: -1 })
            .exec((err, poolQuestions) => {
              if (err) return next(err);
              for (let i = 0; i < poolQuestions.length; i++) {
                for (let j = 0; j < quiz.questions.length; j++) {
                  if (quiz.questions[j].id === poolQuestions[i].id) {
                    poolQuestions[i].isInQuiz = true;
                  }
                }
              }

              generatePageButtons(c, questionsPerPage, numberOfButtonsPerPage, currentPage, pages => {
                res.render("quiz_add_questions", {
                  user: req.user,
                  style: "style.css",
                  poolQuestions,
                  pages,
                  currentPage,
                  quizId: req.params.id
                });
              });
            });
        } else {
          res.render("quiz_add_questions", {
            user: req.user,
            style: "style.css"
          });
        }
      });
    });
};

module.exports.quizDashboardView = (req, res, next) => {
  Quiz.find({ isApproved: false })
    .sort({ field: "asc", _id: -1 })
    .limit(5)
    .exec((err, newestQuizzes) => {
      if (err) return next(err);

      Quiz.find({ isApproved: true })
        .sort({ field: "asc", _id: -1 })
        .limit(5)
        .exec((err, quizPool) => {
          if (err) return next(err);

          Quiz.find({ isReported: true })
            .sort({ field: "asc", _id: -1 })
            .limit(5)
            .exec((err, reportedQuizzes) => {
              if (err) return next(err);

              res.render("quiz_dashboard", {
                newestQuizzes,
                quizPool,
                reportedQuizzes,
                style: "style.css"
              });
            });
        });
    });
};

module.exports.deleteQuizButton = (req, res, next) => {
  Quiz.deleteOne({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "Question successfully deleted");
      res.redirect(`/quiz/${req.params.type}/${req.params.page}`);
    })
    .catch(err => next(err));
};

module.exports.approveQuizButton = (req, res, next) => {
  Quiz.findByIdAndUpdate({ _id: req.params.id }, { isApproved: true })
    .then(() => {
      req.flash("success_msg", "Question successfully deleted");
      res.redirect(`/quiz/${req.params.type}/${req.params.page}`);
    })
    .catch(err => next(err));
};

module.exports.unapproveQuizButton = (req, res, next) => {
  Quiz.findByIdAndUpdate({ _id: req.params.id }, { isApproved: false })
    .then(() => {
      req.flash("success_msg", "Question successfully deleted");
      res.redirect(`/quiz/${req.params.type}/${req.params.page}`);
    })
    .catch(err => next(err));
};

module.exports.editQuizButton = (req, res, next) => {
  Quiz.findById({ _id: req.params.id })
    .then(() => {
      req.flash("error_msg", "Not available.");
      res.redirect(`/quiz/${req.params.type}/${req.params.page}`);
    })
    .catch(err => next(err));
};

module.exports.reviewQuizButton = (req, res, next) => {
  Quiz.findByIdAndUpdate({ _id: req.params.id }, { isReported: false })
    .then(() => {
      req.flash("success_msg", "Question successfully deleted");
      res.redirect(`/quiz/${req.params.type}/${req.params.page}`);
    })
    .catch(err => next(err));
};

module.exports.addNewQuizMongoose = (req, res, next) => {
  let { quizType, quizName } = req.body;
  let errors = [];

  if (!quizType || !quizName) {
    errors.push({ msg: "Please fill in all the fields." });
  }

  if (errors.length > 0) {
    res.render("quiz_add_quiz", {
      errors,
      style: "style.css"
    });
  } else {
    const newQuiz = new Quiz({
      quizType,
      quizName
    });

    newQuiz
      .save()
      .then(quiz => {
        res.redirect(`/quiz/questions/${quiz._id}/1`);
      })
      .catch(err => next(err));
  }
};

module.exports.addQuestionsToQuizMongoose = (req, res, next) => {
  let { questionId, quizId, page } = req.params;
  Question.findById(questionId).then(question => {
    Quiz.update({ _id: quizId }, { $push: { questions: question._id } }).then(quiz => {
      res.redirect(`/quiz/questions/${quizId}/${page}`);
    });
  });
};

module.exports.removeQuestionFromQuizMongoose = (req, res, next) => {
  let { questionId, quizId, page } = req.params;
  Question.findById(questionId).then(question => {
    Quiz.update({ _id: quizId }, { $pull: { questions: question._id } }).then(quiz => {
      res.redirect(`/quiz/questions/${quizId}/${page}`);
    });
  });
};
