const express = require("express");
const { postSummarie} = require("../controllers/ai.controller.js");
const verifyToken = require("../middleware/verifyToken");
// 
const aiRouter = express.Router();
aiRouter.post("/Summarize", postSummarie)
module.exports = aiRouter
