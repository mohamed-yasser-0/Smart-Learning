const asyncWrapper = require("../middleware/asyncWrapper");
const Courses = require("../models/courses.model");
const ErrorHandel = require("../utils/appError");
const { SUCCESS, FAIL } = require("../utils/httpStatusText");



const gitMyCourses = async (req, res) => {
    const course = await Courses.find({ userId: req.user.id }, { "__v": false });
    res.send({ status: SUCCESS, data: { course } })
}
const gitCourses = async (req, res) => {
    const course = await Courses.find({ status: "published" }, { "__v": false });
    res.send({ status: SUCCESS, data: { course } })
}
const gitSingle = asyncWrapper(async (req, res, next) => {
    const { id } = req.params
    const course = await Courses.findById(id, { "__v": false });
    if (!course) {
        return next(ErrorHandel("not found course", 404))
    }
    res.send({ status: SUCCESS, data: { course } })
})
// نسيت الاويت يا شاطر
const postCourses = async (req, res) => {
    const course = new Courses({
        userId: req.user.id,
        ...req.body,
        thumbnail: req.file?.path || req.body.thumbnail,
    });

    await course.save();

    res.send({
        status: SUCCESS,
        course
    });
};
const patchCourses = async (req, res, next) => {
    const { id } = req.params

    const update = await Courses.findOneAndUpdate(
        {
            _id: id,
            userId: req.user.id,
        },
        {
            ...req.body,
        },
        {
            new: true,
        }
    );
    if (!update) {
        return next(ErrorHandel("course not found", 404))
    }
    res.send({ status: SUCCESS, data: { update } })
}
const DeleteCourses = async (req, res) => {
    const { id } = req.params
    const deleteCourse = await Courses.findByIdAndDelete(id)
    if (!deleteCourse) {
        return next(ErrorHandel("not found course", 404))
    }
    res.send({ status: SUCCESS })
}
module.exports = { gitCourses, gitSingle, postCourses, DeleteCourses, patchCourses, gitMyCourses }