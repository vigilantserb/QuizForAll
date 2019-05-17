const Player = require("../player/player_model");
const Quiz = require("../quiz/quiz_model");
const Question = require("../question/question_model");
const faker = require("faker");
const _ = require("lodash");

module.exports.seedPlayersQuery = () => {
    let PLAYERS_TO_ADD = 100;

    const players = _.times(PLAYERS_TO_ADD, () => createPlayer());

    Player.insertMany(players).then(done => {
        if (done) console.log("done");
    });
};

function createPlayer() {
    return {
        username: faker.name.firstName(),
        email: `${faker.commerce.color()}@gmail.com`,
        password: "$2a$10$MNZjrSWOJXPQPa5tTnRFfOMIR1RWZkH/BU6nm94zNURI8sW1ZWAy."
    };
}

module.exports.seedQuestionsQuery = () => {
    let QUESTIONS_TO_ADD = 100;

    const questions = _.times(QUESTIONS_TO_ADD, () => createQuestion());

    Question.insertMany(questions).then(done => {
        if (done) console.log("done");
    });
};

function createQuestion() {
    let types = ["Movies", "TV Shows", "Geography", "History", "Mixed"];
    let min = 0;
    let max = 4;
    let randomCategory = Math.floor(Math.random() * (+max - +min)) + +min;
    let answers = [];

    answers.push({ answerText: faker.lorem.word(), isCorrect: false });
    answers.push({ answerText: faker.lorem.word(), isCorrect: false });
    answers.push({ answerText: faker.lorem.word(), isCorrect: true });
    answers.push({ answerText: faker.lorem.word(), isCorrect: false });

    return {
        questionBody: faker.lorem.sentence(),
        questionCategory: types[randomCategory],
        answers
    };
}

module.exports.seedQuizQuery = () => {
    let QUIZZES_TO_ADD = 100;

    let quizzes = _.times(QUIZZES_TO_ADD, () => createQuiz());

    Quiz.insertMany(quizzes).then(done => {
        if (done) console.log("done");
    });
};

function createQuiz() {
    let types = ["Movies", "TV Shows", "Geography", "History", "Mixed"];
    let rndType = Math.floor(Math.random() * (+4 - +0)) + +0;

    return {
        quizName: faker.lorem.sentence(),
        quizType: types[rndType]
    };
}

module.exports.seedQuizQuestions = () => {
    let ADD_QS_TO_QUIZZES = 100;
    Quiz.find({}).then(quizzes => {
        const quizPromise = _.times(ADD_QS_TO_QUIZZES, () => addQuestionsToQuiz(quizzes));
        Promise.all(quizPromise).then(() => console.log("done"));
    });
};

function addQuestionsToQuiz(quizzes) {
    const questions = _.times(10, () => getQuestionsForQuiz());
    Promise.all(questions).then(questions => {
        let min = 11;
        let max = quizzes.length;
        let rndQuiz = Math.floor(Math.random() * (+max - +min)) + +min;
        let quiz = quizzes[rndQuiz];

        Quiz.update({ _id: quiz._id }, { $push: { questions: questions } }).then(quiz => {});
    });
}

function getQuestionsForQuiz() {
    let min = 1;
    let max = 99;
    let rndQuestion = Math.floor(Math.random() * (+max - +min)) + +min;

    return Question.findOne({})
        .limit(1)
        .skip(rndQuestion)
        .then();
}
