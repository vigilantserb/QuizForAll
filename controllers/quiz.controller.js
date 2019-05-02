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

module.exports.addNewQuizMongoose = (req, res, next) => {
  let { quizType, quizName } = req.body;
  //do the checks here

  const newQuiz = new Quiz({
    quizType,
    quizName
  });

  newQuiz.save().then(quiz => {
    //provide the quiz id as a parameter to this call
    res.redirect(`/quiz/questions/${quiz._id}/1`);
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
            .populate("answers", "answerText")
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

              console.log(newestQuizzes);

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
