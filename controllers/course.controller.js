const Courses = require("../models/courses.model")



const gitCourses = async (req, res) => {
    const course = await Courses.find();
    res.send(course)
}

const postCourses = async (req, res) => {
    const course = new Courses(req.body);
    await course.save()
    res.send("course was added")
}
module.exports = {gitCourses,postCourses}