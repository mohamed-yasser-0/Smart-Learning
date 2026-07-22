const asyncWrapper = require("../middleware/asyncWrapper");
const Courses = require("../models/courses.model");
const ErrorHandel = require("../utils/appError");
const { SUCCESS, FAIL } = require("../utils/httpStatusText");



const gitCourses = async (req, res) => {
    const course = await Courses.find({}, { "__v": false });
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
    const course = new Courses(req.body);
    await course.save()
    res.send({ status: SUCCESS })
}
const patchCourses = async (req, res) => {
    const { id } = req.params
    const course = await Courses.findById(id)
    if (!course) {
        return next(ErrorHandel("not found course", 404))
    }
    const update = await Courses.findByIdAndUpdate(id, { ...req.body, course })
    res.send({ status: SUCCESS })
}
const DeleteCourses = async (req, res) => {
    const { id } = req.params
    const deleteCourse = await Courses.findByIdAndDelete(id)
    if (!deleteCourse) {
        return next(ErrorHandel("not found course", 404))
    }
    res.send({ status: SUCCESS })
}
module.exports = { gitCourses, gitSingle, postCourses, DeleteCourses, patchCourses }