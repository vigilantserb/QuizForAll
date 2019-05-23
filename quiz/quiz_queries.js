const Quiz = require("./quiz_model");
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
                        statusCode: 404,
                        error: "Quiz count is zero"
                    });
                }
            })
            .catch(err =>
                reject({
                    statusCode: 500,
                    error: err
                })
            );
    });
};

module.exports.randomQuizzesQuery = (limit, page) => {
    let min = 0;
    let max = 99;
    let array = [];
    for (let i = 0; i < limit; i++) {
        let rnd = Math.floor(Math.random() * (+max - +min)) + +min;
        array.push(
            Quiz.findOne({}, "quizName quizType numberOfPlays ratings lastEdited")
                .skip(rnd + page)
                .limit(1)
                .then()
        );
    }
    return array;
};
