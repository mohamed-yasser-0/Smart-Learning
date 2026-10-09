const express = require("express");
const { getUsers, logInUser, registerUser, googleLogin } = require("../controllers/user.controller");
const verifyToken = require("../middleware/verifyToken");
// 
const userRouter = express.Router();
userRouter.get("/", getUsers)
userRouter.post("/logIn", logInUser)
userRouter.post("/register", registerUser)
userRouter.post("/google-login", googleLogin);
module.exports = userRouter
