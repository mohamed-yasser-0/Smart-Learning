const mongoose = require("mongoose");
const Lesson = require("../models/lesson.model.js");
const Courses = require("../models/courses.model.js");
const Progres = require("../models/Progres.model.js");
const asyncWrapper = require("../middleware/asyncWrapper");
const ErrorHandel = require("../utils/appError");
const { SUCCESS } = require("../utils/httpStatusText");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const MAX_DURATION_SECONDS = 10 * 60 * 60; // 10 ساعات

// الحقول المسموح للعميل يبعتها (مفيش new Lesson(req.body))
const LESSON_FIELDS = ["title", "order", "type", "articleContent", "questions"];

const pick = (obj, keys) =>
  Object.fromEntries(
    keys.filter((k) => obj?.[k] !== undefined).map((k) => [k, obj[k]]),
  );

// يرجّع الـ video id من أي صيغة لينك يوتيوب، أو null
const getYouTubeId = (url) => {
  try {
    const u = new URL(String(url).trim());
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1) || null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/shorts/"))
        return u.pathname.split("/")[2] || null;
      return u.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
};

// المدة بالثواني (الفرونت بيبعتها محوّلة من الدقايق)
const parseDuration = (value) => {
  const d = Number(value ?? 0);
  if (!Number.isFinite(d) || d < 0 || d > MAX_DURATION_SECONDS) {
    throw ErrorHandel("invalid video duration", 400);
  }
  return Math.round(d);
};

const validateQuestions = (questions) =>
  Array.isArray(questions) &&
  questions.length > 0 &&
  questions.every(
    (q) =>
      typeof q?.question === "string" &&
      q.question.trim() &&
      Array.isArray(q.options) &&
      q.options.length >= 2 &&
      q.options.every((o) => typeof o === "string" && o.trim()) &&
      q.options.includes(q.correctAnswer),
  );

const fetchTranscriptText = async (url) => {
  let response;
  try {
    response = await fetch(
      `https://getyoutubetranscript.com/api/v1/transcript?v=${encodeURIComponent(
        url,
      )}&timestamps=true`,
      {
        headers: {
          Authorization: `Bearer ${process.env.YOUTUBE_TRANSCRIPT_API_KEY}`,
        },
        signal: AbortSignal.timeout(20000),
      },
    );
  } catch (err) {
    console.error("Transcript API request failed:", err.message);
    throw ErrorHandel("transcript service unavailable", 502);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    // بنسجّل السبب في اللوج بس، ومش بنبعت status الخدمة الخارجية للعميل
    // (401 من الخدمة دي ممكن الفرونت يفهمها إنها انتهاء جلسة المستخدم)
    console.error("Transcript API error:", response.status, data?.message);
    throw ErrorHandel(
      "تعذر جلب نص الفيديو، تأكد إن الفيديو عليه ترجمة (subtitles)",
      502,
    );
  }

  const transcript = data.data?.transcript;
  return Array.isArray(transcript)
    ? transcript.map((s) => s?.text ?? "").join(" ")
    : String(transcript ?? "");
};

// بيبني كائن الفيديو: يوتيوب بس
const buildVideo = async (video) => {
  const url = typeof video?.url === "string" ? video.url.trim() : "";
  if (!getYouTubeId(url)) {
    throw ErrorHandel("invalid youtube url", 400);
  }
  const duration = parseDuration(video.duration);
  const text = await fetchTranscriptText(url);
  return { url, provider: "youTube", duration, text };
};

// يجيب الدرس ويتأكد إن المستخدم صاحب الكورس
const getOwnedLesson = async (lessonId, userId) => {
  if (!mongoose.isValidObjectId(lessonId)) {
    throw ErrorHandel("invalid lesson id", 400);
  }
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw ErrorHandel("not found lesson", 404);
  }
  const course = await Courses.findById(lesson.course);
  if (!course || course.userId.toString() !== userId.toString()) {
    throw ErrorHandel("you are not the owner of this course", 403);
  }
  return lesson;
};

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------
const gitLessons = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  if (!mongoose.isValidObjectId(courseId)) {
    return next(ErrorHandel("invalid course id", 400));
  }

  const lesson = await Lesson.find({ course: courseId }, { __v: false }).sort({
    order: 1,
  });
  res.status(200).json({ status: SUCCESS, data: { lesson } });
});

const gitSingle = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(ErrorHandel("invalid lesson id", 400));
  }

  const lesson = await Lesson.findById(id, { __v: false });
  if (!lesson) {
    return next(ErrorHandel("not found lesson", 404));
  }
  res.status(200).json({ status: SUCCESS, data: { lesson } });
});

const postLesson = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  if (!mongoose.isValidObjectId(courseId)) {
    return next(ErrorHandel("invalid course id", 400));
  }

  const course = await Courses.findById(courseId);
  if (!course) {
    return next(ErrorHandel("course not found", 404));
  }
  if (course.userId.toString() !== req.user.id.toString()) {
    return next(ErrorHandel("you are not the owner of this course", 403));
  }

  const lesson = new Lesson({
    ...pick(req.body, LESSON_FIELDS),
    course: courseId,
  });

  if (lesson.type === "video") {
    lesson.video = await buildVideo(req.body.video);
  } else if (lesson.type === "quiz") {
    if (!validateQuestions(req.body.questions)) {
      return next(ErrorHandel("invalid quiz questions", 400));
    }
  } else if (lesson.type === "article") {
    if (
      typeof req.body.articleContent !== "string" ||
      !req.body.articleContent.trim()
    ) {
      return next(ErrorHandel("article content is required", 400));
    }
  }

  await lesson.save();

  res.status(201).json({ status: SUCCESS, data: lesson });
});

const patchLesson = asyncWrapper(async (req, res, next) => {
  const lesson = await getOwnedLesson(req.params.id, req.user.id);

  // نوع الدرس مش بيتغير بعد الإنشاء
  lesson.set(
    pick(
      req.body,
      LESSON_FIELDS.filter((k) => k !== "type"),
    ),
  );

  if (lesson.type === "quiz" && req.body.questions !== undefined) {
    if (!validateQuestions(req.body.questions)) {
      return next(ErrorHandel("invalid quiz questions", 400));
    }
  }

  if (lesson.type === "video" && req.body.video) {
    const { url, duration } = req.body.video;
    const urlChanged =
      typeof url === "string" && url.trim() !== lesson.video?.url;

    if (urlChanged) {
      // لينك جديد: بنجيب النص (transcript) من أول وجديد
      lesson.video = await buildVideo({
        url,
        duration: duration ?? lesson.video?.duration,
      });
    } else if (duration !== undefined) {
      lesson.set("video.duration", parseDuration(duration));
    }
  }

  await lesson.save();

  res.status(200).json({ status: SUCCESS, data: lesson });
});

// ممكن الـ id يجي من الـ URL (/lessons/:id) أو من الـ body (lessonId) زي الأول
const DeleteLesson = asyncWrapper(async (req, res, next) => {
  const lessonId =
    req.params.id ?? req.params.lessonId ?? req.body?.lessonId;

  const lesson = await getOwnedLesson(lessonId, req.user.id);

  await lesson.deleteOne();
  await Progres.deleteMany({ lessonId: lesson._id });

  res.status(200).json({ status: SUCCESS });
});

module.exports = { gitLessons, postLesson, gitSingle, DeleteLesson, patchLesson };