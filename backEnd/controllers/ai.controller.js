const asyncWrapper = require("../middleware/asyncWrapper");
const Lesson = require("../models/lesson.model.js");
const ErrorHandel = require("../utils/appError");
const { SUCCESS, FAIL } = require("../utils/httpStatusText");
const { fetchTranscript } = require("youtube-transcript");
const OpenAI = require("openai");



const postSummarie = async (req, res) => {
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await client.responses.create({
        model: "gpt-5.6-luna",
        input: `
            ${req.body.summary}`
    });
    const respo = response.output_text

    res.send({
        status: SUCCESS,
        respo
    });
};

const getYoutubeTranscript = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                message: "YouTube URL is required",
            });
        }
        const transcript = await fetchTranscript(url);

        const text = transcript
            .map((item) => {
                if (typeof item.text === "string") {
                    return item.text;
                }

                return "";
            })
            .join(" ")
            .replace(/\[موسيقى\]/g, "")
            .replace(/\[object Object\]/g, "")
            .replace(/->>/g, "")
            .replace(/\s+/g, " ")
            .trim();

        return res.status(200).json({
            text,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Could not get YouTube transcript",
        });
    }
};

module.exports = { postSummarie, getYoutubeTranscript }