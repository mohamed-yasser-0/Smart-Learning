const asyncWrapper = require("../middleware/asyncWrapper");
const Lesson = require("../models/lesson.model.js");
const ErrorHandel = require("../utils/appError");
const { SUCCESS, FAIL } = require("../utils/httpStatusText");
const OpenAI = require("openai");



const postSummarie = async (req, res) => {
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await client.responses.create({
        model: "gpt-5.6-luna",
        input: `You are an educational assistant for Smart Learning Platform.

Your job is to help students understand courses,
        lessons, quizzes, and programming concepts.

Explain concepts simply and clearly.
If the student asks for an explanation, give examples.
Do not make up information.

Student message:
            ${req.body.summary}`
    });
    const respo = response.output_text

    res.send({
        status: SUCCESS,
        respo
    });
};
module.exports = { postSummarie }