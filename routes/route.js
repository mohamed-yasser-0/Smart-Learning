const express = require("express");
const { gitCourses, postCourses, gitSingle, DeleteCourses, patchCourses } = require("../controllers/course.controller");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();
router.route("/")
    .get(gitCourses)
    .post(verifyToken,postCourses)
router.route("/:id")
    .patch(verifyToken,patchCourses)
    .get(gitSingle)
    .delete(verifyToken,DeleteCourses)
module.exports = router
