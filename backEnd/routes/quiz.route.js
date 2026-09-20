const express = require("express");
const { gitQuiz, postQuiz } = require("../controllers/quiz.controller.js");
const verifyToken = require("../middleware/verifyToken.js");

const quizRouter = express.Router();
quizRouter.route("/:courseId")
    .get(gitQuiz)
    .post(verifyToken, postQuiz)
module.exports = quizRouter
