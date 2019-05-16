const Quiz = require("../quiz/quiz.model");
const { generatePageButtons } = require("../tools/utils");

module.exports.getQuizzesByCriteriaQuery = (numberOfElementsPerPage, currentPage, questionsPerPage, numberOfButtonsPerPage, criteria) => {
    return new Promise((resolve, reject) => {
        Quiz.countDocuments(criteria).then(quizCount => {
            if (quizCount) {
                Quiz.find(criteria)
                    .limit(numberOfElementsPerPage)
                    .skip(numberOfElementsPerPage * (currentPage - 1))
                    .sort({ field: "asc", _id: -1 })
                    .then(quizzes => {
                        for (let i = 0; i < quizzes.length; i++) quizzes[i].questionCount = quizzes[i].questions.length;

                        generatePageButtons(quizCount, questionsPerPage, numberOfButtonsPerPage, currentPage, pageArray => {
                            resolve({
                                quizzes,
                                pageArray,
                                currentPage
                            });
                        });
                    });
            } else {
                reject({
                    quizCount,
                    message: "Quiz count is zero"
                });
            }
        });
    });
};
