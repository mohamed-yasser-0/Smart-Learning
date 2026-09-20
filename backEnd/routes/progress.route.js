const express = require("express");
const { gitProgress, postProgress} = require("../controllers/progress.controller.js");
const verifyToken = require("../middleware/verifyToken.js");

const processRouter = express.Router();
processRouter.route("/:courseId")
    .get(verifyToken,gitProgress)
    .post(verifyToken, postProgress)
module.exports = processRouter
