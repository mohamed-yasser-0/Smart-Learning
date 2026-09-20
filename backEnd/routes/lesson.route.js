const express = require("express");
const { gitLessons, postLesson, gitSingle, DeleteLesson, patchLesson } = require("../controllers/lessons.controller.js");
const verifyToken = require("../middleware/verifyToken.js");
const upload = require("../middleware/upload.js");

const lessonRouter = express.Router();
lessonRouter.route("/:courseId")
    .get(gitLessons)
    .post(verifyToken, upload.single("video"), postLesson)
lessonRouter.route("/:id")
    .patch(verifyToken, patchLesson)
    .get(gitSingle)
    .delete(verifyToken, DeleteLesson)
module.exports = lessonRouter
