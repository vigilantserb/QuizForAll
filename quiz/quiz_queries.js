const Quiz = require("../quiz/quiz.model");
const { generatePageButtons } = require("../tools/utils");

module.exports.getQuizzesByCriteriaQuery = (limit, currentPage, questionCount, buttonCount, criteria) => {
    return new Promise((resolve, reject) => {
        Quiz.countDocuments(criteria)
            .then(quizCount => {
                if (quizCount) {
                    Quiz.find(criteria)
                        .limit(limit)
                        .skip(limit * (currentPage - 1))
                        .sort({ field: "asc", _id: -1 })
                        .then(quizzes => {
                            for (let i = 0; i < quizzes.length; i++) quizzes[i].questionCount = quizzes[i].questions.length;

                            generatePageButtons(quizCount, questionCount, buttonCount, currentPage, pageArray => {
                                resolve({
                                    quizzes,
                                    pageArray,
                                    currentPage
                                });
                            });
                        });
                } else {
                    reject({
                        error: "Quiz count is zero"
                    });
                }
            })
            .catch(err =>
                reject({
                    error: err
                })
            );
    });
};
