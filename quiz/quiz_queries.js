const Quiz = require("../quiz/quiz.model");
const { generatePageButtons } = require("../tools/utils");

module.exports.pendingQuizzesQuery = (numberOfElementsPerPage, currentPage, questionsPerPage, numberOfButtonsPerPage, criteria) => {
    return new Promise((resolve, reject) => {
        Quiz.countDocuments(criteria).then(quizCount => {
            if (quizCount) {
                Quiz.find(criteria)
                    .limit(numberOfElementsPerPage)
                    .skip(numberOfElementsPerPage * (currentPage - 1))
                    .sort({ field: "asc", _id: -1 })
                    .then(newestQuizzes => {
                        for (let i = 0; i < newestQuizzes.length; i++) newestQuizzes[i].questionCount = newestQuizzes[i].questions.length;

                        generatePageButtons(quizCount, questionsPerPage, numberOfButtonsPerPage, currentPage, pageArray => {
                            resolve({
                                newestQuizzes,
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
