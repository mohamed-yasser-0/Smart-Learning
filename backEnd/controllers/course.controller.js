const mongoose = require("mongoose");
const asyncWrapper = require("../middleware/asyncWrapper");
const Courses = require("../models/courses.model");
const Lesson = require("../models/lesson.model");
const Progres = require("../models/Progres.model");
const ErrorHandel = require("../utils/appError");
const cloudinary = require("../config/cloudinary");
const { SUCCESS } = require("../utils/httpStatusText");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// الحقول المسموح للعميل يبعتها (userId و thumbnail مش منهم)
const COURSE_FIELDS = [
    "title",
    "description",
    "instructor",
    "category",
    "level",
    "status",
];
const STATUSES = ["draft", "published"];

// بياخد الـ strings المسموحة بس (يرفض objects عشان NoSQL injection) ويشيل الفاضي
const cleanBody = (body) => {
    const data = {};
    for (const key of COURSE_FIELDS) {
        const value = body?.[key];
        if (typeof value !== "string") continue;
        const trimmed = value.trim();
        if (trimmed) data[key] = trimmed;
    }
    return data;
};

const validateCourseData = (data, { requireAll = false } = {}) => {
    if (requireAll && (!data.title || !data.description)) {
        return "title and description are required";
    }
    if (data.status && !STATUSES.includes(data.status)) {
        return "invalid status";
    }
    return null;
};

// الصورة بتتحمّل على Cloudinary قبل ما الـ controller يشتغل، فلو الطلب فشل
// بنمسحها عشان ما تفضلش صور يتيمة (orphans)
const discardUpload = async (file) => {
    if (!file?.filename) return;
    try {
        await cloudinary.uploader.destroy(file.filename);
    } catch (err) {
        console.error("Failed to discard uploaded image:", err.message);
    }
};

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------
const gitMyCourses = asyncWrapper(async (req, res) => {
    const course = await Courses.find(
        { userId: req.user.id },
        { __v: false },
    ).sort({ createdAt: -1 });

    res.status(200).json({ status: SUCCESS, data: { course } });
});

const gitCourses = asyncWrapper(async (req, res) => {
    const course = await Courses.find(
        { status: "published" },
        { __v: false },
    ).sort({ createdAt: -1 });

    res.status(200).json({ status: SUCCESS, data: { course } });
});

const gitSingle = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return next(ErrorHandel("invalid course id", 400));
    }

    const course = await Courses.findById(id, { __v: false });
    if (!course) {
        return next(ErrorHandel("not found course", 404));
    }

    // المسودة تظهر لصاحبها بس
    const isOwner =
        Boolean(req.user?.id) && course.userId.toString() === req.user.id.toString();
    if (course.status !== "published" && !isOwner) {
        return next(ErrorHandel("not found course", 404));
    }

    res.status(200).json({ status: SUCCESS, data: { course } });
});

const postCourses = asyncWrapper(async (req, res, next) => {
    const data = cleanBody(req.body);

    const error = validateCourseData(data, { requireAll: true });
    if (error) {
        await discardUpload(req.file);
        return next(ErrorHandel(error, 400));
    }

    const course = new Courses({
        ...data,
        instructor: data.instructor || req.user.username,
        userId: req.user.id, // من التوكن دايماً، مش من الـ body
        thumbnail: req.file?.path, // الصورة ملف مرفوع بس، مش لينك من العميل
    });

    try {
        await course.save();
    } catch (err) {
        await discardUpload(req.file);
        throw err;
    }

    res.status(201).json({ status: SUCCESS, data: { course } });
});

const patchCourses = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        await discardUpload(req.file);
        return next(ErrorHandel("invalid course id", 400));
    }

    const data = cleanBody(req.body);

    const error = validateCourseData(data);
    if (error) {
        await discardUpload(req.file);
        return next(ErrorHandel(error, 400));
    }

    // لو اترفعت صورة جديدة بنستبدل القديمة، وإلا بنسيبها زي ما هي
    if (req.file?.path) data.thumbnail = req.file.path;

    let update;
    try {
        update = await Courses.findOneAndUpdate(
            { _id: id, userId: req.user.id }, // صاحب الكورس بس
            { $set: data },
            { new: true, runValidators: true },
        );
    } catch (err) {
        await discardUpload(req.file);
        throw err;
    }

    if (!update) {
        await discardUpload(req.file);
        return next(ErrorHandel("course not found", 404));
    }

    res.status(200).json({ status: SUCCESS, data: { update } });
});

const DeleteCourses = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return next(ErrorHandel("invalid course id", 400));
    }

    const deleteCourse = await Courses.findOneAndDelete({
        _id: id,
        userId: req.user.id,
    });

    if (!deleteCourse) {
        return next(ErrorHandel("not found course", 404));
    }

    await Promise.all([
        Lesson.deleteMany({ course: id }),
        Progres.deleteMany({ courseId: id }),
    ]);

    res.status(200).json({ status: SUCCESS });
});

module.exports = {
    gitCourses,
    gitSingle,
    postCourses,
    DeleteCourses,
    patchCourses,
    gitMyCourses,
};