const Player = require("./player_model");

/* Views */

module.exports.playerDashboardView = (req, res) => {
    res.render("player_dashboard");
};

module.exports.activePlayersView = (req, res) => {
    res.render("player_active");
};

module.exports.pendingPlayersView = (req, res) => {
    res.render("player_pending");
};

module.exports.bannedPlayersView = (req, res) => {
    res.render("player_banned");
};

/* Buttons */

/* Mongoose */
