const express = require("express");
const { postSummarie , getYoutubeTranscript} = require("../controllers/ai.controller.js");
const verifyToken = require("../middleware/verifyToken");
// 
const aiRouter = express.Router();
aiRouter.post("/Summarize", postSummarie)
aiRouter.post("/youtube-transcript", getYoutubeTranscript);
module.exports = aiRouter
