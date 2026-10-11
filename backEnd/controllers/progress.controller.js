const mongoose = require("mongoose");
const Progres = require("../models/Progres.model.js");
const Lesson = require("../models/lesson.model.js");
const asyncWrapper = require("../middleware/asyncWrapper");
const ErrorHandel = require("../utils/appError");
const { SUCCESS } = require("../utils/httpStatusText");

// الشكل المتوقع: [score, total, percentage]
const isValidQuizScore = (q) =>
    Array.isArray(q) &&
    q.length === 3 &&
    q.every(Number.isFinite) &&
    q[1] > 0 &&
    q[0] >= 0 &&
    q[0] <= q[1] &&
    q[2] >= 0 &&
    q[2] <= 100;

// GET /api/progress            -> تقدم المستخدم في كل الكورسات
// GET /api/progress?courseId=  -> تقدمه في كورس واحد
const getProgress = asyncWrapper(async (req, res, next) => {
    const filter = { userId: req.user.id };

    const { courseId } = req.query;
    if (courseId !== undefined) {
        if (typeof courseId !== "string" || !mongoose.isValidObjectId(courseId)) {
            return next(ErrorHandel("invalid course id", 400));
        }
        filter.courseId = courseId;
    }

    const progres = await Progres.find(filter, { __v: false });

    // مصفوفة فاضية مش خطأ: المستخدم الجديد معندوش تقدم لسه
    res.status(200).json({ status: SUCCESS, data: { progres } });
});

// POST /api/progress/:courseId   body: { lessonId, quizScore? }
const postProgress = asyncWrapper(async (req, res, next) => {
    const { courseId } = req.params;
    const { lessonId, quizScore } = req.body; // بس الحقول المسموحة (مفيش new Progres(req.body))
    const userId = req.user.id;

    if (
        !mongoose.isValidObjectId(courseId) ||
        typeof lessonId !== "string" ||
        !mongoose.isValidObjectId(lessonId)
    ) {
        return next(ErrorHandel("invalid course or lesson id", 400));
    }

    if (quizScore !== undefined && !isValidQuizScore(quizScore)) {
        return next(ErrorHandel("invalid quiz score", 400));
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        return next(ErrorHandel("lesson not found", 404));
    }

    // الدرس لازم يكون تابع للكورس اللي في الـ URL (غيّر الاسم لو الحقل عندك مش `course`)
    if (String(lesson.course) !== courseId) {
        return next(ErrorHandel("lesson does not belong to this course", 400));
    }

    // upsert: كل (مستخدم، درس) له سجل واحد بس، فمفيش تكرار بيضخّم الساعات والـ streak
    const update = {
        $setOnInsert: {
            courseId,
            duration: lesson.video?.duration ?? 0, // مقال/كويز/يوتيوب من غير مدة = 0
        },
    };
    if (quizScore !== undefined) update.$set = { quizScore };

    const progress = await Progres.findOneAndUpdate({ userId, lessonId }, update, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
    });

    res.status(201).json({ status: SUCCESS, data: progress });
});

module.exports = {
    getProgress,
    postProgress,
};