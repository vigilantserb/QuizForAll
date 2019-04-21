const express = require("express");
const router = express.Router();

const { forwardAuthenticated } = require("../config/auth");

const controller = require("../controllers/user.controller");

router.get("/login", forwardAuthenticated, controller.loginPageView);
router.get("/register", controller.registerPageView);

router.get("/forgot_password", controller.forgotPasswordView);
router.post("/forgot_password", controller.forgotPasswordMongoose);

router.get("/reset_password/:token", controller.resetPasswordView);
router.post("/reset_password/", controller.resetPasswordMongoose);

router.get("/confirm_account/:token", controller.confirmAccountMongoose);

router.post("/register", controller.registerMongoose);

router.post("/login", controller.loginPassport);
router.get("/logout", controller.logoutPassport);

router.get("/magic/:id", controller.getAdmin);

module.exports = router;
