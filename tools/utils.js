const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

module.exports = {
    generatePasswordResetPage: function(email) {
        let token = jwt.sign({ email: email }, require("../config/keys").secret, {
            expiresIn: 3600
        });
        let link = `https://safe-sea-80392.herokuapp.com/user/reset_password/${token}`;

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "forthepeoplequizapp@gmail.com",
                pass: "quizapp995"
            }
        });
        const mailOptions = {
            from: "noreply@quizapp.com",
            to: email,
            subject: "Password reset link",
            html: `This link will expire in 60 minutes. ${link}`
        };
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) console.log(err);
            else {
                console.log("Email sent successfully.", info);
            }
        });
    },
    generateAccountConfirmationPage: function(email) {
        let token = jwt.sign({ email: email }, require("../config/keys").secret, {
            expiresIn: 3600
        });
        console.log(token);
        let link = `https://safe-sea-80392.herokuapp.com/user/confirm_account/${token}`;

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "forthepeoplequizapp@gmail.com",
                pass: "quizapp995"
            }
        });
        const mailOptions = {
            from: "noreply@quizapp.com",
            to: email,
            subject: "Account confirmation link",
            html: `This link will expire in 60 minutes. ${link}`
        };
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) console.log(err);
            else {
                console.log("Email sent successfully.", info);
            }
        });
    },
    generatePlayerConfirmationPage: function(email) {
        let token = jwt.sign({ email: email }, require("../config/keys").secret, {
            expiresIn: 3600
        });
        console.log(token);
        let link = `https://safe-sea-80392.herokuapp.com/mobile/player/verify/${token}`;

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "forthepeoplequizapp@gmail.com",
                pass: "quizapp995"
            }
        });
        const mailOptions = {
            from: "noreply@quizapp.com",
            to: email,
            subject: "Account confirmation link",
            html: `This link will expire in 60 minutes. ${link}`
        };
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) console.log(err);
            else {
                console.log("Email sent successfully.", info);
            }
        });
    },
    generatePasswordRecoveryPage: function(email) {
        const Player = require("../player/player_model");
        const randtoken = require("rand-token");
        let token = randtoken.uid(6).toUpperCase();
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "forthepeoplequizapp@gmail.com",
                pass: "quizapp995"
            }
        });
        const mailOptions = {
            from: "noreply@quizapp.com",
            to: email,
            subject: "Password recovery link",
            html: `Please enter this code in the application. ${token}`
        };
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) console.log(err);
            else {
                let updateToken = { token, dateOfApproval: Date.now() };
                Player.findOneAndUpdate({ email: email }, { updateToken }).then(user => {
                    console.log("Email sent successfully.");
                });
            }
        });
    },
    generatePageButtons: function(count, numberOfButtons, elementsPerPage, currentPage, callback) {
        let pages = [];
        if (count < numberOfButtons * elementsPerPage) {
            for (let i = 1; i <= Math.ceil(count / elementsPerPage); i++) {
                pages.push(i);
            }
            callback(pages);
        } else {
            if (currentPage > 5) {
                for (let i = currentPage - 5; i < currentPage; i++) {
                    pages.push(i);
                    numberOfButtons--;
                }
            } else if (currentPage > 4) {
                for (let i = currentPage - 4; i < currentPage; i++) {
                    pages.push(i);
                    numberOfButtons--;
                }
            } else if (currentPage > 3) {
                for (let i = currentPage - 3; i < currentPage; i++) {
                    pages.push(i);
                    numberOfButtons--;
                }
            } else if (currentPage > 2) {
                for (let i = currentPage - 2; i < currentPage; i++) {
                    pages.push(i);
                    numberOfButtons--;
                }
            } else if (currentPage > 1) {
                for (let i = currentPage - 1; i < currentPage; i++) {
                    pages.push(i);
                    numberOfButtons--;
                }
            }
            for (let i = currentPage; i < numberOfButtons + currentPage; i++) {
                pages.push(i);
            }
            while (pages[pages.length - 1] * elementsPerPage > count) {
                pages.pop();
            }
            callback(pages);
        }
    }
};
