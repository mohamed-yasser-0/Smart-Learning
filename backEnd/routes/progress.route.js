const express = require("express");
const { gitProgress, postProgress} = require("../controllers/progress.controller.js");
const verifyToken = require("../middleware/verifyToken.js");

const processRouter = express.Router();
processRouter.route("/:courseId")
    .post(verifyToken, postProgress)
processRouter.route("/")
    .get(verifyToken,gitProgress)
module.exports = processRouter
