const quiz = require("../models/Quiz.model.js");
const asyncWrapper = require("../middleware/asyncWrapper");
const ErrorHandel = require("../utils/appError");
const { SUCCESS, FAIL } = require("../utils/httpStatusText");
const { decode } = require("jsonwebtoken");

const gitQuiz = async (req, res, next) => {
    const { courseId } = req.params
    const quizs = await quiz.find({ courseId }, { "__v": false });
    if (quizs.length === 0) {
        return next(ErrorHandel("quiz not found", 404));
    }
    res.send({ status: SUCCESS, data: { quizs } })
}
// نسيت الاويت يا شاطر
const postQuiz = asyncWrapper(async (req, res, next) => {
    const { courseId } = req.params

    const quize = new quiz(req.body);
    quize.courseId = courseId
    await quize.save()
    res.status(201).send({ status: SUCCESS, data: quiz });
})
module.exports = { gitQuiz, postQuiz }