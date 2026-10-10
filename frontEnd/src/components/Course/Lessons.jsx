import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PlayCircleIcon from "@mui/icons-material/PlayCircleRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";
import ArticleRounded from "@mui/icons-material/ArticleRounded";
import QuizRounded from "@mui/icons-material/QuizRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import GroupRounded from "@mui/icons-material/GroupRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import CloudUploadRounded from "@mui/icons-material/CloudUploadRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SmartToyRounded from "@mui/icons-material/SmartToyRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
// نفس الـ axios instance المستخدم في CourseLibrary (انقله لملف مشترك)
import { api } from "../../api/client";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------
const MAX_SUMMARIES = 3; // UX فقط — الحد الحقيقي لازم يتحقق منه الـ backend

const INITIAL_MESSAGES = [
  {
    id: "welcome",
    role: "bot",
    text: "أهلاً! أنا مساعدك الذكي، اسألني عن أي شيء وسأحاول مساعدتك.",
  },
];

function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    return token ? jwtDecode(token) : null;
  } catch {
    return null;
  }
}

const getOwnerId = (course) => course?.userId?._id ?? course?.userId;

function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/shorts/"))
      return u.pathname.split("/")[2] || null;
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

const typeIcon = (type, done) => {
  if (done)
    return <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />;
  if (type === "quiz")
    return <QuizRounded sx={{ fontSize: 18, color: "primary.light" }} />;
  if (type === "article")
    return <ArticleRounded sx={{ fontSize: 18, color: "primary.light" }} />;
  return <PlayCircleIcon sx={{ fontSize: 18, color: "primary.light" }} />;
};

// ---------------------------------------------------------------------------
// Small presentational components
// ---------------------------------------------------------------------------
function UploadLessonButton({ onClick, isMobile }) {
  return (
    <Button
      variant="contained"
      aria-label="رفع درس"
      onClick={onClick}
      startIcon={<CloudUploadRounded sx={{ m: 0 }} />}
      sx={{
        borderRadius: isMobile ? "50%" : "12px",
        minWidth: isMobile ? 48 : "auto",
        width: isMobile ? 48 : "auto",
        height: isMobile ? 48 : "auto",
        p: isMobile ? 0 : "8px 24px",
        textTransform: "none",
        fontWeight: "bold",
        "& .MuiButton-startIcon": { margin: isMobile ? 0 : undefined },
      }}
    >
      {!isMobile && "رفع"}
    </Button>
  );
}

function LessonHeader({ lesson }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontSize: 12,
          color: "primary.light",
          fontWeight: 600,
          letterSpacing: 0.5,
          mb: 0.5,
        }}
      >
        LESSON {lesson.order}
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: 20, sm: 24 },
          fontWeight: 700,
          overflowWrap: "anywhere",
          lineHeight: 1.4,
        }}
      >
        {lesson.title}
      </Typography>
    </Box>
  );
}

function MetaItem({ icon, value, color = "text.secondary" }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
      {icon}
      <Typography sx={{ fontSize: 13, color }}>{value}</Typography>
    </Stack>
  );
}

function CourseMeta({ course }) {
  if (!course) return null;
  const name = course.instructor?.name;
  return (
    <Stack
      direction="row"
      spacing={2.5}
      sx={{ mb: 3, alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
    >
      {name && (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Avatar
            src={course.instructor?.image}
            alt={name}
            sx={{ width: 22, height: 22, fontSize: 12, bgcolor: "primary.main" }}
          >
            {name.charAt(0)}
          </Avatar>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {name}
          </Typography>
        </Stack>
      )}
      <MetaItem
        icon={<AccessTimeRounded sx={{ fontSize: 15, color: "text.secondary" }} />}
        value={course.duration}
      />
      <MetaItem
        icon={<GroupRounded sx={{ fontSize: 15, color: "text.secondary" }} />}
        value={course.students}
      />
      <MetaItem
        icon={<StarRounded sx={{ fontSize: 16, color: "warning.main" }} />}
        value={course.rating}
        color="warning.main"
      />
    </Stack>
  );
}

function VideoPlayer({ lesson }) {
  const video = lesson.video;

  if (!video?.url) {
    return (
      <Typography sx={{ color: "text.secondary" }}>
        لا يوجد فيديو لهذا الدرس
      </Typography>
    );
  }

  const videoId = getYouTubeId(video.url);
  if (!videoId) {
    return (
      <Typography sx={{ color: "text.secondary" }}>
        رابط اليوتيوب غير صالح
      </Typography>
    );
  }

  return (
    <iframe
      key={lesson._id}
      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
      title={lesson.title}
      style={{ width: "100%", height: "100%", border: 0 }}
      allow="accelerometer; encrypted-media; picture-in-picture"
      allowFullScreen
    />
  );
}

function LessonNav({ hasPrev, onPrev, onComplete, done, pending }) {
  return (
    <>
      <Divider sx={{ my: 3 }} />
      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          disabled={!hasPrev}
          onClick={onPrev}
          sx={{
            borderColor: "divider",
            color: "text.secondary",
            textTransform: "none",
            borderRadius: "10px",
            px: 2.5,
          }}
        >
          الدرس السابق ←
        </Button>
        <Button
          variant="contained"
          onClick={onComplete}
          disabled={pending || done}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            px: 3,
            fontWeight: 600,
          }}
        >
          {pending ? (
            <CircularProgress size={24} color="inherit" />
          ) : done ? (
            "تم إكمال الدرس"
          ) : (
            "تحديد الدرس كمكتمل"
          )}
        </Button>
      </Stack>
    </>
  );
}

// ---------------------------------------------------------------------------
// AI chat (lesson summary)
// ---------------------------------------------------------------------------
function ChatPanel({ lesson }) {
  const theme = useTheme();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [summaries, setSummaries] = useState(0);
  const scrollRef = useRef(null);

  const addMessage = (role, text) =>
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, role, text },
    ]);

  const chatMutation = useMutation({
    mutationFn: async (summary) => {
      const res = await api.post("/api/ai/Summarize", { summary });
      return res.data;
    },
    onSuccess: (data) =>
      addMessage("bot", data?.respo ?? "لم أتمكن من توليد رد."),
    onError: (err) =>
      addMessage("bot", err.response?.data?.message || "حصل خطأ، حاول مرة أخرى."),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, chatMutation.isPending]);

  const send = (text, label) => {
    const trimmed = text.trim();
    if (!trimmed || chatMutation.isPending) return;
    addMessage("user", label ?? trimmed);
    chatMutation.mutate(trimmed);
  };

  const handleSend = () => {
    send(input);
    setInput("");
  };

  const handleSummary = () => {
    if (summaries >= MAX_SUMMARIES) {
      toast.error("وصلت للحد الأقصى من الملخصات");
      return;
    }
    if (!lesson.video?.text) {
      toast.error("لا يوجد نص متاح لتلخيص هذا الفيديو");
      return;
    }
    setSummaries((n) => n + 1);
    send(
      `${lesson.video.text}\n\nاعملي ملخص سهل للفهم بدون إيموجي ومرتب`,
      "ملخص الدرس",
    );
  };

  return (
    <Box
      sx={{
        mt: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "18px",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        spacing={1.2}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.8,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        }}
      >
        <Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }}>
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              color: "primary.main",
            }}
          >
            <SmartToyRounded fontSize="small" />
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
              مساعد الدرس
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
              يلخصلك الفيديو ويجاوب على أسئلتك
            </Typography>
          </Box>
        </Stack>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleSummary}
          disabled={chatMutation.isPending}
          sx={{ borderRadius: "10px", textTransform: "none", whiteSpace: "nowrap" }}
        >
          ملخص الفيديو
        </Button>
      </Stack>

      <Box
        ref={scrollRef}
        sx={{
          maxHeight: 360,
          minHeight: 180,
          overflowY: "auto",
          px: 2.5,
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <Stack
              key={m.id}
              direction="row"
              sx={{ justifyContent: isUser ? "flex-end" : "flex-start" }}
            >
              <Box
                sx={{
                  maxWidth: "78%",
                  px: 1.8,
                  py: 1.1,
                  borderRadius: "14px",
                  borderBottomRightRadius: isUser ? 4 : 14,
                  borderBottomLeftRadius: isUser ? 14 : 4,
                  bgcolor: isUser
                    ? "primary.main"
                    : alpha(theme.palette.text.primary, 0.04),
                  color: isUser ? "primary.contrastText" : "text.primary",
                }}
              >
                <Typography
                  sx={{ fontSize: 13.5, lineHeight: 1.7, whiteSpace: "pre-wrap" }}
                >
                  {m.text}
                </Typography>
              </Box>
            </Stack>
          );
        })}
        {chatMutation.isPending && (
          <Box
            sx={{
              alignSelf: "flex-start",
              px: 1.8,
              py: 1.1,
              borderRadius: "14px",
              borderBottomLeftRadius: 4,
              bgcolor: alpha(theme.palette.text.primary, 0.04),
            }}
          >
            <CircularProgress size={16} thickness={5} />
          </Box>
        )}
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "flex-end",
          px: 2,
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder="اكتب سؤالك..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: 13.5 } }}
        />
        <IconButton
          aria-label="إرسال"
          onClick={handleSend}
          disabled={chatMutation.isPending || !input.trim()}
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderRadius: "10px",
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": {
              bgcolor: alpha(theme.palette.text.primary, 0.08),
              color: "text.disabled",
            },
          }}
        >
          <SendRounded fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Quiz — state بيتصفر لوحده لما الدرس يتغير (key={lesson._id} عند الاستخدام)
// ---------------------------------------------------------------------------
function QuizView({ lesson, savedScore, saving, onFinish }) {
  const questions = lesson.questions ?? [];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [localResult, setLocalResult] = useState(null);

  const result =
    localResult ??
    (Array.isArray(savedScore)
      ? { score: savedScore[0], total: savedScore[1], percentage: savedScore[2] }
      : null);

  if (!questions.length) {
    return (
      <Typography sx={{ color: "text.secondary", textAlign: "center" }}>
        لا توجد أسئلة في هذا الاختبار بعد.
      </Typography>
    );
  }

  if (result) {
    return (
      <Box>
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: { xs: 3, sm: 5 },
            textAlign: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: 24, sm: 30 }, mb: 2 }}>
            🎉 Quiz Finished
          </Typography>
          <Typography sx={{ fontSize: { xs: 48, sm: 64 }, fontWeight: 800, color: "#7C6BF0", lineHeight: 1, mb: 2 }}>
            {result.score} / {result.total}
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {result.percentage}%
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            You answered {result.score} out of {result.total} questions correctly.
          </Typography>
        </Box>

        {answers.length > 0 && (
          <Box
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              p: { xs: 2.5, sm: 4 },
            }}
          >
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
              Review Answers
            </Typography>
            <Stack spacing={2.5}>
              {questions.map((q, index) => {
                const userAnswer = answers[index];
                if (userAnswer === undefined) return null;
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <Box
                    key={index}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor: isCorrect ? "success.main" : "error.main",
                      bgcolor: isCorrect ? "rgba(46,125,50,0.06)" : "rgba(211,47,47,0.06)",
                    }}
                  >
                    <Typography fontWeight={700} sx={{ mb: 1.5 }}>
                      {index + 1}. {q.question}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 0.7, color: isCorrect ? "success.main" : "error.main" }}
                    >
                      Your answer: {userAnswer}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "success.main", fontWeight: 600 }}>
                      Correct answer: {q.correctAnswer}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}
      </Box>
    );
  }

  const question = questions[current];
  const isLast = current === questions.length - 1;

  const handleNext = async () => {
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);

    if (!isLast) {
      setSelected(null);
      setCurrent((c) => c + 1);
      return;
    }

    const total = questions.length;
    const score = questions.filter((q, i) => newAnswers[i] === q.correctAnswer).length;
    const percentage = Math.round((score / total) * 100);

    try {
      // طلب واحد بس: بيحفظ التقدم + الدرجة
      await onFinish([score, total, percentage]);
      setLocalResult({ score, total, percentage });
    } catch {
      /* الـ toast بيتعرض من الـ mutation */
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: 20, sm: 24 } }}>
        {lesson.title}
      </Typography>
      <Typography
        variant="body2"
        fontFamily="monospace"
        sx={{ color: "text.secondary", mt: 0.5, mb: 2 }}
      >
        Question {current + 1} of {questions.length}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={((current + 1) / questions.length) * 100}
        sx={{ height: 6, borderRadius: 5, mb: 3 }}
      />

      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1px solid #777777b6",
          borderRadius: 3,
          p: { xs: 2.5, sm: 4 },
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, fontSize: { xs: 16, sm: 18 } }}>
          {question.question}
        </Typography>

        <Stack spacing={2}>
          {question.options.map((option, index) => {
            const isSelected = selected === option;
            return (
              <Box
                key={index}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(option)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelected(option);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 2.5,
                  py: 2,
                  borderRadius: 2.5,
                  cursor: "pointer",
                  bgcolor: isSelected ? "rgba(124,107,240,0.18)" : "#7777771c",
                  border: isSelected
                    ? "1px solid #7C6BF0"
                    : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: isSelected ? "rgba(124,107,240,0.22)" : "#7777775b",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    bgcolor: isSelected ? "#7C6BF0" : "rgba(124,107,240,0.12)",
                    border: isSelected ? "none" : "1px solid rgba(124,107,240,0.3)",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ color: isSelected ? "#fff" : "#9B8CFF" }}
                  >
                    {String.fromCharCode(65 + index)}
                  </Typography>
                </Box>
                <Typography fontWeight={500}>{option}</Typography>
              </Box>
            );
          })}
        </Stack>

        <Button
          onClick={handleNext}
          disabled={selected === null || saving}
          sx={{
            mt: 3.5,
            bgcolor: "#7C6BF0",
            color: "#fff",
            fontWeight: 700,
            textTransform: "none",
            px: 3.5,
            py: 1.2,
            borderRadius: 2,
            width: { xs: "100%", sm: "auto" },
            "&:hover": { bgcolor: "#6C5CE0" },
            "&.Mui-disabled": {
              bgcolor: "rgba(124,107,240,0.35)",
              color: "rgba(255,255,255,0.6)",
            },
          }}
        >
          {saving ? (
            <CircularProgress size={24} color="inherit" />
          ) : isLast ? (
            "Submit Quiz"
          ) : (
            "Next Question"
          )}
        </Button>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function CourseLessons() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const user = useMemo(getUserFromToken, []);
  const userId = user?.id ?? user?._id;

  const [lessonId, setLessonId] = useState(null);

  // ---- Data ----
  const lessonsQuery = useQuery({
    queryKey: ["lessons", id],
    queryFn: async () => (await api.get(`/api/lessons/${id}`)).data,
    enabled: !!id,
  });

  const progressQuery = useQuery({
    queryKey: ["progress", id],
    queryFn: async () => (await api.get("/api/progress")).data,
    enabled: !!id,
  });

  // نفس الـ key بتاع تاب "My Courses" في CourseLibrary عشان الكاش يتشارك
  const courseQuery = useQuery({
    queryKey: ["courses", 0],
    queryFn: async () => (await api.get("/api/courses/mycourses")).data,
  });

  const progressMutation = useMutation({
    mutationFn: async (payload) =>
      (await api.post(`/api/progress/${id}`, payload)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["progress", id] }),
    onError: (err) =>
      toast.error(err.response?.data?.message || "تعذر حفظ التقدم"),
  });

  // ---- Derived ----
  const lessonsData = lessonsQuery.data?.data?.lesson;
  const lessons = useMemo(
    () => [...(lessonsData ?? [])].sort((a, b) => a.order - b.order),
    [lessonsData],
  );

  const progressList = progressQuery.data?.data?.progres;
  const completedLessons = useMemo(
    () => new Set((progressList ?? []).map((p) => p.lessonId)),
    [progressList],
  );

  const activeCourse = courseQuery.data?.data?.course?.find(
    (c) => c._id === id,
  );
  const isOwner = Boolean(userId) && getOwnerId(activeCourse) === userId;

  // أول درس بيتفتح تلقائياً لو المستخدم لسه ما اختارش
  const activeLesson = lessons.find((l) => l._id === lessonId) ?? lessons[0];
  const activeIndex = activeLesson
    ? lessons.findIndex((l) => l._id === activeLesson._id)
    : -1;
  const completedCount = lessons.filter((l) =>
    completedLessons.has(l._id),
  ).length;
  const savedScore = progressList?.find(
    (p) => p.lessonId === activeLesson?._id,
  )?.quizScore;

  // ---- Handlers ----
  const goToUpload = () => navigate(`${location.pathname}/UploadLesson`);

  const handleMarkComplete = async () => {
    try {
      await progressMutation.mutateAsync({ lessonId: activeLesson._id });
      if (activeIndex < lessons.length - 1) {
        setLessonId(lessons[activeIndex + 1]._id);
      }
    } catch {
      /* الـ toast بيتعرض من الـ mutation */
    }
  };

  const handleQuizFinish = (quizScore) =>
    progressMutation.mutateAsync({ lessonId: activeLesson._id, quizScore });

  const goPrev = () => {
    if (activeIndex > 0) setLessonId(lessons[activeIndex - 1]._id);
  };

  // ---- Loading / error / empty ----
  if (lessonsQuery.isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (lessonsQuery.isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          حصل خطأ: {lessonsQuery.error.response?.data?.message || lessonsQuery.error.message}
        </Alert>
      </Box>
    );
  }

  if (!lessons.length) {
    return isOwner ? (
      <Box sx={{ p: 4 }}>
        <UploadLessonButton onClick={goToUpload} isMobile={isMobile} />
      </Box>
    ) : (
      <Typography sx={{ p: 4, fontSize: 14, color: "text.secondary" }}>
        الدورة فارغة
      </Typography>
    );
  }

  // ---- Render ----
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Top bar */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: "center" }}>
        <IconButton
          size="small"
          aria-label="Back to courses"
          onClick={() => navigate("/courses")}
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "10px",
            color: "text.secondary",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ArrowBackRounded fontSize="small" />
        </IconButton>
        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
          Course Library
          <Box component="span" sx={{ color: "text.disabled", mx: 1 }}>
            /
          </Box>
          <Box component="span" sx={{ color: "text.primary" }}>
            {activeCourse?.title ?? "Course"}
          </Box>
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", lg: "row" },
        }}
      >
        {/* ---------------- Main content ---------------- */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {activeLesson.type === "video" && (
            <>
              <Box
                sx={{
                  borderRadius: "18px",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  aspectRatio: "16/9",
                  bgcolor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <VideoPlayer lesson={activeLesson} />
              </Box>

              <LessonHeader lesson={activeLesson} />
              <CourseMeta course={activeCourse} />

              {activeLesson.description && (
                <Typography
                  sx={{ fontSize: 14.5, lineHeight: 1.9, color: "text.secondary" }}
                >
                  {activeLesson.description}
                </Typography>
              )}

              <LessonNav
                hasPrev={activeIndex > 0}
                onPrev={goPrev}
                onComplete={handleMarkComplete}
                done={completedLessons.has(activeLesson._id)}
                pending={progressMutation.isPending}
              />

              <ChatPanel lesson={activeLesson} />
            </>
          )}

          {activeLesson.type === "article" && (
            <>
              <LessonHeader lesson={activeLesson} />
              {activeLesson.description && (
                <Typography
                  sx={{ fontSize: 14.5, lineHeight: 1.9, color: "text.secondary", mb: 3 }}
                >
                  {activeLesson.description}
                </Typography>
              )}
              <Box
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "18px",
                  p: { xs: 2.5, sm: 4 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 15.5,
                    lineHeight: 2,
                    whiteSpace: "pre-wrap",
                    color: activeLesson.articleContent ? "text.primary" : "text.secondary",
                    textAlign: activeLesson.articleContent ? "start" : "center",
                  }}
                >
                  {activeLesson.articleContent || "لا يوجد محتوى لهذا المقال بعد."}
                </Typography>
              </Box>
              <LessonNav
                hasPrev={activeIndex > 0}
                onPrev={goPrev}
                onComplete={handleMarkComplete}
                done={completedLessons.has(activeLesson._id)}
                pending={progressMutation.isPending}
              />
            </>
          )}

          {activeLesson.type === "quiz" && (
            <QuizView
              key={activeLesson._id}
              lesson={activeLesson}
              savedScore={savedScore}
              saving={progressMutation.isPending}
              onFinish={handleQuizFinish}
            />
          )}
        </Box>

        {/* ---------------- Sidebar ---------------- */}
        <Box
          sx={{
            width: { xs: "100%", lg: 360 },
            flexShrink: 0,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "18px",
            p: 2.5,
            alignSelf: "flex-start",
          }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 0.5 }}>
                {activeCourse?.title ?? "Lessons"}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                {completedCount} of {lessons.length} lessons completed
              </Typography>
            </Box>
            {isOwner && (
              <UploadLessonButton onClick={goToUpload} isMobile={isMobile} />
            )}
          </Stack>

          <LinearProgress
            variant="determinate"
            value={(completedCount / lessons.length) * 100}
            sx={{
              height: 6,
              borderRadius: 6,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              mb: 2.5,
              "& .MuiLinearProgress-bar": {
                bgcolor: "primary.light",
                borderRadius: 6,
              },
            }}
          />

          <Stack spacing={0.5}>
            {lessons.map((lesson) => {
              const isActive = activeLesson._id === lesson._id;
              const done = completedLessons.has(lesson._id);
              return (
                <Button
                  key={lesson._id}
                  onClick={() => setLessonId(lesson._id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    borderRadius: "10px",
                    px: 1.2,
                    py: 1,
                    textTransform: "none",
                    bgcolor: isActive ? "action.selected" : "transparent",
                    border: "1px solid",
                    borderColor: isActive ? "primary.main" : "transparent",
                    "&:hover": {
                      bgcolor: isActive ? "action.selected" : "action.hover",
                    },
                  }}
                >
                  {typeIcon(lesson.type, done)}
                  <Typography
                    sx={{
                      flex: 1,
                      textAlign: "start",
                      fontSize: 13.5,
                      color: isActive ? "text.primary" : "text.secondary",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {lesson.title}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, color: "text.disabled", fontFamily: "monospace" }}
                  >
                    {lesson.type === "quiz"
                      ? "Quiz"
                      : lesson.type === "article"
                        ? "Article"
                        : lesson.isFree
                          ? "مجاني"
                          : ""}
                  </Typography>
                </Button>
              );
            })}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}