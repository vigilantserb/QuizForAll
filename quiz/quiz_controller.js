const Quiz = require("./quiz.model");
const Question = require("../question/question_model");

let questionsPerPage = 10,
    numberOfButtonsPerPage = 10;

const { generatePageButtons } = require("../tools/utils");
const { getQuizzesByCriteriaQuery } = require("./quiz_queries");

module.exports.addNewQuizView = (req, res) => {
    res.render("quiz_add_quiz", {
        style: "style.css"
    });
};

module.exports.pendingQuizzesView = (req, res, next) => {
    let perPage = 10,
        currentPage = Math.max(0, req.params.page);
    let criteria = { isApproved: false };

    getQuizzesByCriteriaQuery(perPage, currentPage, questionsPerPage, numberOfButtonsPerPage, criteria)
        .then(viewObject => {
            res.render("quiz_pending", {
                viewObject,
                user: req.user,
                style: "style.css"
            });
        })
        .catch(err => next(err));
};

module.exports.poolQuizzesView = (req, res) => {
    let perPage = 10,
        currentPage = Math.max(0, req.params.page);
    let criteria = { isApproved: true };

    getQuizzesByCriteriaQuery(perPage, currentPage, questionsPerPage, numberOfButtonsPerPage, criteria)
        .then(viewObject => {
            res.render("quiz_pool", {
                viewObject,
                user: req.user,
                style: "style.css"
            });
        })
        .catch(err => next(err));
};

module.exports.reportedQuizzesView = (req, res) => {
    let perPage = 10,
        currentPage = Math.max(0, req.params.page);
    let criteria = { isReported: true };

    getQuizzesByCriteriaQuery(perPage, currentPage, questionsPerPage, numberOfButtonsPerPage, criteria)
        .then(viewObject => {
            res.render("quiz_reported", {
                viewObject,
                user: req.user,
                style: "style.css"
            });
        })
        .catch(err => next(err));
};

module.exports.addQuestionsToQuizView = (req, res, next) => {
    let perPage = 10,
        currentPage = Math.max(0, req.params.page);

    Quiz.findById(req.params.id).then(quiz => {
        Question.countDocuments({ isApproved: true }, (err, c) => {
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
                                if (JSON.stringify(quiz.questions[j]._id) == JSON.stringify(poolQuestions[i]._id)) {
                                    poolQuestions[i].isInQuiz = true;
                                    console.log(quiz.questions[j]._id);
                                }
                            }
                        }

                        for (let j = 0; j < poolQuestions.length; j++) {}

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
            req.flash("success_msg", "Quiz successfully deleted");
            res.redirect(`/quiz/${req.params.type}/${req.params.page}`);
        })
        .catch(err => next(err));
};

module.exports.approveQuizButton = (req, res, next) => {
    Quiz.findByIdAndUpdate({ _id: req.params.id }, { isApproved: true })
        .then(() => {
            req.flash("success_msg", "Quiz successfully approved");
            res.redirect(`/quiz/${req.params.type}/${req.params.page}`);
        })
        .catch(err => next(err));
};

module.exports.unapproveQuizButton = (req, res, next) => {
    Quiz.findByIdAndUpdate({ _id: req.params.id }, { isApproved: false })
        .then(() => {
            req.flash("success_msg", "Quiz successfully unapproved");
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
            req.flash("success_msg", "Quiz successfully reviewed");
            res.redirect(`/quiz/${req.params.type}/${req.params.page}`);
        })
        .catch(err => next(err));
};

module.exports.quizDetailsButton = (req, res, next) => {
    Quiz.findOne({ _id: req.params.id })
        .then(quiz => {
            res.render("quiz_details", {
                quiz,
                user: req.user,
                style: "style.css"
            });
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
        Quiz.update({ _id: quizId }, { $push: { questions: question } }).then(quiz => {
            res.redirect(`/quiz/questions/${quizId}/${page}`);
        });
    });
};

module.exports.removeQuestionFromQuizMongoose = (req, res, next) => {
    let { quizId, questionId, page } = req.params;
    Question.findById(questionId).then(question => {
        var ObjectId = require("mongoose").Types.ObjectId;
        Quiz.update({ _id: quizId }, { $pull: { questions: { _id: new ObjectId(questionId) } } }, { safe: true }).then(quiz => {
            res.redirect(`/quiz/details/${quizId}`);
        });
    });
};

module.exports.quizSingle = (req, res) => {
    let quizId = req.body.quizId;

    if (!quizId) {
        return res.status(400).send({ message: "Please provide a quiz id." });
    }

    Quiz.findById(quizId)
        .populate("questions")
        .then(quiz => {
            res.status(200).send(quiz);
        });
};

module.exports.quizLatest = (req, res, next) => {
    let perPage = 10,
        currentPage = Math.max(0, req.params.page);

    Quiz.find({ isApproved: true }, "quizName quizType ratings numberOfPlays")
        .limit(perPage)
        .skip(perPage * (currentPage - 1))
        .sort({ field: "asc", _id: -1 })
        .then(quizzes => {
            res.status(200).send(quizzes);
        })
        .catch(err => next(err));
};

module.exports.quizExplore = (req, res, next) => {
    let { playerId } = req.body;

    Player.findById(playerId)
        .populate("playedQuizzes")
        .then(player => {
            let counts = { Movies: 0, "TV Shows": 0, Geography: 0, History: 0, Mixed: 0 };

            for (let i = 0; i < player.playedQuizzes.length; i++) {
                if (!counts.hasOwnProperty(player.playedQuizzes[i].quizType)) {
                    counts[player.playedQuizzes[i].quizType] = 1;
                } else {
                    counts[player.playedQuizzes[i].quizType]++;
                }
            }

            let array = [];

            for (var key in counts) {
                if (counts.hasOwnProperty(key)) {
                    array.push({ type: key, count: counts[key] });
                }
            }

            array = sortByKey(array, "count");

            let exploreQuizzes = [];
            let typeCount = 0;

            array.forEach((type, index, array) => {
                Quiz.find({ quizType: type.type }, "quizName quizType")
                    .limit(10)
                    .then(quizzes => {
                        typeCount++;
                        quizzes.forEach(quiz => {
                            exploreQuizzes.push(quiz);
                        });
                        if (typeCount === array.length) {
                            typeCount = 0;
                            exploreQuizzes.forEach((quiz, index, array) => {
                                typeCount++;
                                player.playedQuizzes.forEach(playedQuiz => {
                                    if (JSON.stringify(playedQuiz._id) === JSON.stringify(quiz._id)) {
                                        array.splice(index, 1);
                                    }
                                });
                                if (typeCount === array.length) {
                                    res.send(exploreQuizzes);
                                }
                            });
                        }
                    });
            });
        })
        .catch(err => next(err));
};

module.exports.quizAddRating = (req, res, next) => {
    let { rating, comment, playerId, quizId } = req.body;

    if (!rating || !comment || !playerId || !quizId) {
        return res.status(404).send({ message: "Fields not provided" });
    }

    Player.findById(playerId)
        .then(player => {
            if (player) {
                let object = {
                    playerId,
                    rating,
                    comment
                };
                Quiz.findByIdAndUpdate(quizId, { $push: { ratings: object } })
                    .then(quiz => {
                        if (quiz) {
                            return res.status(200).send({ message: "Rating added successfully." });
                        } else {
                            return res.status(404).send({ message: "Quiz not found." });
                        }
                    })
                    .catch(err => {
                        next(err);
                    });
            } else {
                return res.status(404).send({ message: "Player not found." });
            }
        })
        .catch(err => {
            next(err);
        });
};
