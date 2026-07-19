const express = require("express");
const { gitCourses, postCourses } = require("../controllers/course.controller");

const router = express.Router();
router.route("/")
    .get(gitCourses)
    .post(postCourses)
module.exports = router