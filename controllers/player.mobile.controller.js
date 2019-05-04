const Player = require("../models/player.model");
const Quiz = require("../models/quiz.model");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randtoken = require("rand-token");

let refreshTokens = {};

const config = require("../config/keys");
let { generatePlayerConfirmationPage } = require("../api/utils");

module.exports.playerRegister = (req, res, next) => {
  let { username, email, password, password2 } = req.body;

  if (!username || !email || !password || !password2) {
    return res.status(401).send("Please fill all the fields.");
  }

  if (password !== password2) {
    return res.status(409).send("Passwords do not match.");
  }

  if (password.length < 6) {
    return res.status(400).send("Password must be atleast 6 characters long.");
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
    res.status(401).send({ message: "Fill all the needed fields." });
  }

  Player.findOne({ username: username }, "username password isVerified", (err, player) => {
    if (err) return next(err);

    if (!player) {
      return res.status(404).send({ message: "Player not found." });
    } else {
      if (player.isBanned) {
        res.status(403).send({ message: "Your account has been banned." });
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
        return res.status(405).send({ message: "Player account not verified." });
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

module.exports.playerQuiz = (req, res) => {
  //Treba mi od igraca kviz na koji je stisnuo
  //Vraca mu pitanja tog kviza sa ponudjenim odgovorima
  let { quizId } = req.params.id;
  if (!quizId) {
    return res.status(400).send({ message: "Please provide a quiz id." });
  }

  Quiz.findById(quizId)
    .populate("questions")
    .then(quiz => {
      console.log(quiz);
    });
};
