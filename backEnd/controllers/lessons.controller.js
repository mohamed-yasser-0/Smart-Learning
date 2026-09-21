const Lesson = require("../models/lesson.model.js");
const asyncWrapper = require("../middleware/asyncWrapper");
const ErrorHandel = require("../utils/appError");
const { SUCCESS, FAIL } = require("../utils/httpStatusText");
const cloudinary = require("../config/cloudinary");
const { fetchTranscript } = require("youtube-transcript");

const gitLessons = async (req, res) => {
    const { courseId } = req.params
    const lesson = await Lesson.find({ course: courseId }, { "__v": false });
    res.send({ status: SUCCESS, data: { lesson } })
}
const gitSingle = asyncWrapper(async (req, res, next) => {
    const { id } = req.params
    const lesson = await Lesson.findById(id, { "__v": false });
    if (!lesson) {
        return next(ErrorHandel("not found lesson", 404))
    }
    res.send({ status: SUCCESS, data: { lesson } })
})
// نسيت الاويت يا شاطر

const postLesson = asyncWrapper(async (req, res) => {
    const { courseId } = req.params;

    const lesson = new Lesson(req.body);
    lesson.course = courseId;



    if (req.file) {
        const result = await cloudinary.api.resource(
            req.file.filename,
            {
                resource_type: "video",
                media_metadata: true
            }
        );

        lesson.video = {
            url: req.file.path,
            provider: "cloudinary",
            duration: result.duration
        };
    }
    if (lesson.video.provider === "youTube") {
        const { url } = lesson.video
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
        lesson.video = {
            url,
            provider: lesson.video.provider,
            duration: durationInSeconds,
            text: text
        };
    }
    await lesson.save();

    res.status(201).send({
        status: SUCCESS,
        data: lesson,
    });
});
const patchLesson = async (req, res) => {
    const { id } = req.params

    const lesson = await Lesson.findById(id)
    if (!lesson) {
        return next(ErrorHandel("not found lesson", 404))
    }
    const update = await Lesson.findByIdAndUpdate(id, { ...req.body, lesson })
    res.send({ status: SUCCESS })
}
const DeleteLesson = async (req, res) => {
    const { id } = req.params
    const deleteCourse = await Lesson.findByIdAndDelete(id)
    if (!deleteCourse) {
        return next(ErrorHandel("not found lesson", 404))
    }
    res.send({ status: SUCCESS })
}
module.exports = { gitLessons, postLesson, gitSingle, DeleteLesson, patchLesson }