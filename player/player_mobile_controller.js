const Player = require("./player_model");
const Quiz = require("../quiz/quiz_model");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randtoken = require("rand-token");
const moment = require("moment");
const _ = require("lodash");

let refreshTokens = {};

const config = require("../config/keys");
let { generatePlayerConfirmationPage, generatePasswordRecoveryPage } = require("../tools/utils");
let { sortByKey } = require("../tools/sort");

module.exports.playerRegister = (req, res, next) => {
    let { username, email, password, password2 } = req.body;

    if (!username || !email || !password || !password2) {
        return res.status(401).send("Please fill all the fields.");
    }

    if (password !== password2) {
        return res.status(409).send("Passwords do not match.");
    }

    if (password.length < 6) {
        return res.status(400).send("Password must be at least 6 characters long.");
    }

    Player.find({ email: email }).then(player => {
        if (player.length !== 0) return res.status(400).send({ message: "Email taken." });
        else {
            Player.find({ username: username }).then(player => {
                if (player.length !== 0) return res.status(400).send({ message: "Username taken." });
                else {
                    let newPlayer = new Player({
                        username,
                        email,
                        password
                    });

                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) next(err);
                        bcrypt.hash(newPlayer.password, salt, (err, hash) => {
                            if (err) next(err);
                            newPlayer.password = hash;
                            newPlayer
                                .save()
                                .then(player => {
                                    generatePlayerConfirmationPage(player.email);
                                    return res.status(201).send({ message: "Registration successful. Verification email sent." });
                                })
                                .catch(err => next(err));
                        });
                    });
                }
            });
        }
    });
};

module.exports.playerRefreshAccessToken = (req, res) => {
    var { refreshToken, playerId } = req.body;
    if (refreshToken in refreshTokens && refreshTokens[refreshToken] == playerId) {
        var token = jwt.sign({ id: playerId }, config.secret, {
            expiresIn: 3600
        });
        res.status(200).send({
            accessToken: token,
            message: "Token refreshed successfully."
        });
    } else {
        res.status(500).send({
            message: "Token refresh unsuccessful."
        });
    }
};

module.exports.playerLogin = (req, res, next) => {
    let { username, password } = req.body;

    if (!username || !password) {
        return res.status(422).send({ message: "Fill all the needed fields." });
    }

    Player.findOne({ username: username }, "username password isVerified", (err, player) => {
        if (err) return next(err);

        if (!player) {
            return res.status(404).send({ message: "Player not found." });
        } else {
            if (player.isBanned) {
                res.status(418).send({ message: "Your account has been banned." });
            }
            if (player.isVerified) {
                if (bcrypt.compareSync(password, player.password)) {
                    var token = jwt.sign({ id: player._id }, config.secret, {
                        expiresIn: 3600
                    });
                    var refreshToken = randtoken.uid(256);
                    refreshTokens[refreshToken] = player._id;
                    res.status(200).send({
                        accessToken: token,
                        refreshToken: refreshToken,
                        playerId: player._id,
                        message: "Login successful."
                    });
                } else {
                    res.status(401).send({ message: "Invalid credentials." });
                }
            } else {
                return res.status(403).send({ message: "Player account not verified." });
            }
        }
    });
};

module.exports.playerVerifyAccount = (req, res, next) => {
    let { token } = req.params;

    if (!token) {
        return res.status(400).send({ message: "Verification token not provided." });
    }

    jwt.verify(token, require("../config/keys").secret, function(err, decoded) {
        if (err) return next(err);
        if (!decoded) {
            res.status(500).send({ message: "Access token expired. Try again." });
        } else {
            Player.findOneAndUpdate({ email: decoded.email }, { isVerified: true }).then(user => {
                res.status(200).send({ message: "Account confirmation successful." });
            });
        }
    });
};

module.exports.playerUpdatePlayedQuiz = (req, res, next) => {
    let { quizId, playerId } = req.body;

    if (!quizId || !playerId) {
        return res.status(404).send({ message: "Provided the needed fields." });
    }

    Quiz.findById(quizId)
        .then(quiz => {
            Player.findOne({ _id: playerId })
                .populate("playedQuizzes")
                .then(player => {
                    let isQuizPlayed = false;
                    if (player) {
                        for (let i = 0; i < player.playedQuizzes.length; i++) {
                            if (JSON.stringify(player.playedQuizzes[i]._id) === JSON.stringify(quizId)) {
                                isQuizPlayed = true;
                            }
                        }
                    }
                    if (!isQuizPlayed) {
                        if (quiz) {
                            quiz.numberOfPlays = quiz.numberOfPlays + 1;
                            Player.updateOne({ _id: playerId }, { $push: { playedQuizzes: quiz._id } })
                                .then(player => {
                                    if (player) {
                                        Quiz.findByIdAndUpdate(quizId, { numberOfPlays: quiz.numberOfPlays }).then(quiz => {
                                            if (quiz) {
                                                return res.status(200).send({ message: "Quiz successfully finished." });
                                            }
                                        });
                                    } else {
                                        return res.status(404).send({ message: "No player found with provided id." });
                                    }
                                })
                                .catch(err => next(err));
                        } else {
                            return res.status(404).send({ message: "No quiz found with provided id." });
                        }
                    } else {
                        return res.status(400).send({ message: "User has already participated in the quiz." });
                    }
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
};

module.exports.playerForgotPasswordEmail = (req, res, next) => {
    //take email
    let { email } = req.body;
    //check if email exists
    Player.findOne({ email: email })
        .then(player => {
            if (player) {
                generatePasswordRecoveryPage(player.email);
                res.status(200).send({ message: "Email sent successfully." });
            } else {
                res.status(404).send({ message: "Player with that email not found." });
            }
        })
        .catch(err => next(err));
};

module.exports.playerPasswordUpdate = (req, res, next) => {
    let { password, password2, email, token } = req.body;
    let currentDate = Date.now();
    if (!password || !password2 || !email || !token) {
        return res.status(404).send({ message: "Please provide the needed fields." });
    }

    if (password.localeCompare(password2) != 0) {
        return res.status(422).send({ message: "Password do not match." });
    }

    Player.findOne({ email })
        .then(player => {
            if (player) {
                if (player.updateToken.dateOfApproval) {
                    if (player.updateToken.token.localeCompare(token) == 0) {
                        let date1 = moment(player.updateToken.dateOfApproval),
                            date2 = moment(currentDate);
                        let duration = moment.duration(date2.diff(date1));
                        if (duration.asHours() < 1) {
                            bcrypt.genSalt(10, (err, salt) => {
                                if (err) next(err);

                                bcrypt.hash(password, salt, (err, hash) => {
                                    if (err) next(err);

                                    Player.findOneAndUpdate({ email: email }, { updateToken: {}, password: hash }, { new: true }).then(user => {
                                        res.status(200).send({ message: "Password update sucessfull." });
                                    });
                                });
                            });
                        } else {
                            res.status(401).send({ message: "Token expired." });
                        }
                    } else {
                        res.status(421).send({ message: "Tokens do not match." });
                    }
                } else {
                    res.status(420).send({ message: "Update token not acquired." });
                }
            } else {
                res.status(423).send({ message: "Email not found." });
            }
        })
        .catch(err => next(err));
};

module.exports.addQuizToFavorites = (req, res, next) => {
    let { playerId, quizId } = req.query;

    if (!playerId || !quizId) {
        return res.status(400).send({ message: "Provide the needed fields." });
    }

    Player.findById(playerId).then(player => {
        if (player) {
            Quiz.findById(quizId)
                .then(quiz => {
                    if (quiz) {
                        player.favoriteQuizzes.push(quiz);

                        player
                            .save()
                            .then(() => {
                                res.status(200).send("save succ");
                            })
                            .catch(err => next(err));
                    } else {
                        res.status(404).send({ message: "Quiz not found." });
                    }
                })
                .catch(err => next(err));
        } else {
            res.status(404).send({ message: "Player not found." });
        }
    });
};

module.exports.removeQuizToFavorites = (req, res, next) => {
    let { playerId, quizId } = req.query;

    if (!playerId || !quizId) {
        return res.status(400).send({ message: "Provide the needed fields." });
    }

    Player.findById(playerId).then(player => {
        if (player) {
            Quiz.findById(quizId)
                .then(quiz => {
                    if (quiz) {
                        player.favoriteQuizzes.pop(quiz);

                        player
                            .save()
                            .then(() => {
                                res.status(200).send("remove succ");
                            })
                            .catch(err => next(err));
                    } else {
                        res.status(404).send({ message: "Quiz not found." });
                    }
                })
                .catch(err => next(err));
        } else {
            res.status(404).send({ message: "Player not found." });
        }
    });
};

module.exports.getFavoriteQuizzes = (req, res, next) => {
    let { playerId, limit, page } = req.query;

    if (!playerId) {
        return res.status(400).send({ message: "Provide the needed fields." });
    }

    Player.findById(playerId, "playedQuizzes")
        .populate("playedQuizzes")
        .limit(limit)
        .skip(limit * (page - 1))
        .then(player => {
            if (player) {
                res.status(200).send(player);
            } else {
                res.status(404).send({ message: "Player not found." });
            }
        });
};
