const express = require("express");
const { gitCourses, postCourses, gitSingle, DeleteCourses, patchCourses } = require("../controllers/course.controller");
const verifyToken = require("../middleware/verifyToken");
const uploadImage = require("../middleware/uploadImage");

const router = express.Router();

router.route("/")
    .get(gitCourses)
    .post(
        verifyToken,
        uploadImage.single("thumbnail"),
        postCourses
    );
router.route("/:id")
    .patch(
        verifyToken,
        uploadImage.single("thumbnail"),
        patchCourses
    )
    .get(gitSingle)
    .delete(verifyToken, DeleteCourses)
module.exports = router
