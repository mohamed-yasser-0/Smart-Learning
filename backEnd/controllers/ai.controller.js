const asyncWrapper = require("../middleware/asyncWrapper");
const Lesson = require("../models/lesson.model.js");
const ErrorHandel = require("../utils/appError");
const { SUCCESS, FAIL } = require("../utils/httpStatusText");
const { fetchTranscript } = require("youtube-transcript");
const { GoogleGenAI } = require("@google/genai");


const postSummarie = async (req, res) => {
    try {
        const client = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const start = Date.now();

        const interaction = await client.interactions.create({
            model: "gemini-3.5-flash-lite",
            input: "أهلا",
            generation_config: {
                thinking_level: "low",
                max_output_tokens: 65536,
            },
        });

        console.log(`Gemini took ${Date.now() - start}ms`);

        const respo = interaction.output_text;

        res.send({
            status: SUCCESS,
            respo,
        });

    } catch (error) {
        console.error("Gemini Error:", error);

        res.status(500).send({
            status: FAIL,
            message: error.message,
        });
    }
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

        // Duration
        const lastItem = transcript[transcript.length - 1];

        const duration = lastItem
            ? lastItem.offset + lastItem.duration
            : 0;

        const durationInSeconds = Math.floor(duration / 1000);

        return res.status(200).json({
            text,
            duration: durationInSeconds,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Could not get YouTube transcript",
        });
    }
};

module.exports = { postSummarie, getYoutubeTranscript }