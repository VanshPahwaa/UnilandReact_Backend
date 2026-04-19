const express = require("express");
const router = express.Router();
const { checkUser } = require("../controller/auth.js");
const { logout, getMe } = require("../controller/authHandlers.js");

// router.post("/register", createUser)

router.post("/login", checkUser);

router.post("/logout", logout);

router.get("/me", getMe);

module.exports = router;