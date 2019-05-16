module.exports.submitIdeaView = (req, res) => {
    res.render("submit_idea", {
        user: req.user,
        style: "style.css"
    });
};

module.exports.aboutView = (req, res) => {
    res.render("about", {
        user: req.user,
        style: "style.css"
    });
};
