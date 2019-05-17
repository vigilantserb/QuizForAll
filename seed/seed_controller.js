const queries = require("./seed_queries");

module.exports.seedPlayers = (req, res) => {
    queries.seedPlayersQuery();
};

module.exports.seedQuestions = (req, res) => {
    queries.seedQuestionsQuery();
};

module.exports.seedQuizzes = (req, res) => {
    queries.seedQuizQuery();
};

module.exports.seedQuizQuestions = (req, res) => {
    queries.seedQuizQuestions();
};
