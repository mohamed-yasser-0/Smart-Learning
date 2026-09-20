const Progres = require("../models/Progres.model.js");
const asyncWrapper = require("../middleware/asyncWrapper");
const ErrorHandel = require("../utils/appError");
const { SUCCESS, FAIL } = require("../utils/httpStatusText");
const { decode } = require("jsonwebtoken");
const Lesson = require("../models/lesson.model.js");

const gitProgress = async (req, res, next) => {
    const { id } = req.user
    const progres = await Progres.find({ userId: id }, { "__v": false });
    if (progres.length === 0) {
        return next(ErrorHandel("progress not found", 404));
    }
    res.send({ status: SUCCESS, data: { progres } })
}
// نسيت الاويت يا شاطر
const postProgress = asyncWrapper(async (req, res) => {
    const { courseId } = req.params
    const { lessonId } = req.body
    const { id } = req.user
    const { quizScore } = req.body

    const progress = new Progres(req.body);
    progress.userId = id
    progress.courseId = courseId
    progress.lessonId = lessonId
    const lesson = await Lesson.findById(lessonId);
    progress.duration = lesson.video.duration
    await progress.save()
    res.status(201).send({ status: SUCCESS, data: progress });
})
module.exports = { gitProgress, postProgress }