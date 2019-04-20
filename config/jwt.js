var jwt = require("jsonwebtoken");
var config = require("../config/keys");

module.exports = {
  verifyToken: (req, res, next) => {
    var token = req.headers["access-token"];
    if (!token) return res.status(403).send({ message: "No token provided." });
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) return res.status(500).send({ message: "Failed to authenticate token." });

      req.playerId = decoded.id;
      next();
    });
  }
};
