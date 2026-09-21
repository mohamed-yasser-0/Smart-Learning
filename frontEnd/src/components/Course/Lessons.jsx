import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  CircularProgress,
  TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PlayCircleIcon from "@mui/icons-material/PlayCircleRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import ArticleRounded from "@mui/icons-material/ArticleRounded";
import QuizRounded from "@mui/icons-material/QuizRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import GroupRounded from "@mui/icons-material/GroupRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import BookmarkBorderRounded from "@mui/icons-material/BookmarkBorderRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import { CloudUploadRounded, Tune } from "@mui/icons-material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SmartToyRounded from "@mui/icons-material/SmartToyRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import { useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Container,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
// ---- بيانات الكورس نفسه (لسه مصدرها مش من الـ lessons endpoint) ----
const course = {
  title: "React & TypeScript Mastery",
  category: "Frontend",
  level: "Advanced",
  instructor: "Marcus Rivera",
  rating: 4.8,
  students: 7340,
  duration: "22h 15m",
  progress: 42,
};
const quiz = {
  title: "Machine Learning Basics",
  totalQuestions: 5,
  currentQuestion: 1,
  timeLeft: "10:00",
  question: "Which algorithm is best suited for classification tasks?",
  options: [
    { letter: "A", text: "Linear Regression" },
    { letter: "B", text: "Logistic Regression" },
    { letter: "C", text: "K-Means" },
    { letter: "D", text: "PCA" },
  ],
};
const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "bot",
    text: "أهلاً! أنا مساعدك الذكي اسألني عن أي شيء، وسأحاول مساعدتك.",
  },
];
export default function CourseLessons() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [lessonId, setLessonId] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "أهلاً! أسألني عن محتوى الدرس أو اطلب ملخص." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const scrollRef = useRef(null);

  const [quiz, setQuiz] = useState({
    currentQuestion: 0,
    timeLeft: 60,
  });
  const chatScrollRef = useRef(null);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { id } = useParams();

  const typeIcon = (type, done, locked) => {
    if (locked)
      return <LockRounded sx={{ fontSize: 18, color: "text.disabled" }} />;
    if (done)
      return <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />;
    if (type === "quiz")
      return <QuizRounded sx={{ fontSize: 18, color: "primary.light" }} />;
    if (type === "article")
      return <ArticleRounded sx={{ fontSize: 18, color: "primary.light" }} />;
    return <PlayCircleIcon sx={{ fontSize: 18, color: "primary.light" }} />;
  };

  // ---- جلب دروس الكورس ----
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["lessons", id],
    queryFn: async () => {
      const res = await axios.get(
        `https://smart-learning-production-61a2.up.railway.app/api/lessons/${id}`,
      );
      return res.data;
    },
    enabled: !!id,
  });

  const {
    data: progressData,
    isLoading: progressLoading,
    isError: progressError,
    error: progressErrorData,
    refetch: refetchProgress,
  } = useQuery({
    queryKey: ["progress", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://smart-learning-production-61a2.up.railway.app/api/progress/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!data?.data?.lesson || !progressData?.data?.progres) return;

    const completed = new Set();

    data.data.lesson.forEach((lesson) => {
      const found = progressData.data.progres.some(
        (progress) => progress.lessonId === lesson._id,
      );

      if (found) {
        completed.add(lesson._id);
      }
    });

    setCompletedLessons(completed);
  }, [data, progressData]);
  function current() {
    const currentIndex = lessons.findIndex((l) => l._id === activeLesson._id);
    const next = lessons[currentIndex + 1];
    if (next) setLessonId(next._id);
  }
  const progressMutation = useMutation({
    mutationFn: async (progressData) => {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `https://smart-learning-production-61a2.up.railway.app/api/progress/${id}`,
        progressData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.data;
    },

    onSuccess: async () => {
      toast.success("تم رفع الإنجاز");

      await refetchProgress();
    },

    onError: (error) => {
      console.log(error);
    },
  });
  const progressHandleSubmit = (quizResult) => {
    return progressMutation.mutateAsync({
      lessonId: activeLesson._id,
      quizScore: quizResult,
    });
  };
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);
  // شكل الداتا الفعلي: [{ _id, title, description, type, order, isFree, video: { url, provider }, course, ... }]
  const lessons = data?.data?.lesson;

  const chatMutation = useMutation({
    mutationFn: async (summary) => {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://smart-learning-production-61a2.up.railway.app/api/ai/Summarize",
        {
          summary,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.data;
    },

    // --------------------------------------------------
    // لما الـ API يرجع بنجاح
    // --------------------------------------------------

    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "bot",
          text: data?.respo,
        },
      ]);
      setInput("");
    },

    // --------------------------------------------------
    // لما يحصل Error
    // --------------------------------------------------

    onError: (error) => {
      toast.error(error.response?.data?.message || "حصل خطأ أثناء التلخيص");
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);
  if (!lessons?.length)
    return (
      <Button
        variant="contained"
        onClick={() => navigate(`${location.pathname}/UploadLesson`)}
        startIcon={<CloudUploadRounded sx={{ m: 0 }} />}
        sx={{
          borderRadius: isMobile ? "50%" : "12px",
          minWidth: isMobile ? 48 : "auto",
          width: isMobile ? 48 : "auto",
          height: isMobile ? 48 : "auto",
          p: isMobile ? 0 : "8px 24px",
          textTransform: "none",
          fontWeight: "bold",
          "& .MuiButton-startIcon": {
            margin: isMobile ? 0 : undefined,
          },
        }}
      >
        {!isMobile && "رفع"}
      </Button>
    );

  const activeLesson = lessons.find((l) => l._id === lessonId) || "";
  // completedLessons.size > lessons.length - 1
  //   ? lessons.length - 1
  //   : completedLessons.size

  const handleSubmit = () => {
    const trimmed = chatInput.trim();

    if (!trimmed) return;

    // إضافة رسالة المستخدم إلى الشات
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        text: trimmed,
      },
    ]);

    // إرسال الرسالة للـ API
    chatMutation.mutate(`${activeLesson?.video?.text}+${trimmed}`);
  };
  console.log(activeLesson)
  const completedCount = lessons.filter((l) =>
    completedLessons.has(l._id),
  ).length;
  // useEffect(() => {
  //   setSelected(null);
  //   setAnswers([]);
  //   setQuizFinished(false);
  //   setQuizResult(null);
  //   setQuiz({ currentQuestion: 0, timeLeft: 60 });
  // }, [activeLesson]);
  const handleMarkComplete = () => {
    setCompletedLessons((prev) => new Set(prev).add(activeLesson._id));
  };
  const renderPlayer = () => {
    console.log(activeLesson?.video?.provider);
    if (activeLesson.type !== "video" || !activeLesson.video?.url) {
      return (
        <IconButton
          sx={{
            width: 76,
            height: 76,
            bgcolor: alpha(theme.palette.primary.main, 0.9),
            "&:hover": { bgcolor: "primary.main" },
          }}
        >
          <PlayCircleIcon
            sx={{ fontSize: 44, color: "primary.contrastText" }}
          />
        </IconButton>
      );
    }

    if (activeLesson.video.provider === "youTube") {
      const url = activeLesson.video.url;

      let videoId;

      if (url.includes("youtu.be")) {
        videoId = new URL(url).pathname.slice(1);
      } else {
        videoId = new URL(url).searchParams.get("v");
      }

      return (
        <iframe
          key={activeLesson._id}
          src={`https://www.youtube.com/embed/${videoId}`}
          title={activeLesson.title}
          style={{
            width: "100%",
            height: "100%",
            border: 0,
          }}
          allowFullScreen
        />
      );
    }

    // cloudinary أو أي provider تاني بيرجع mp4 مباشر
    return (
      <video
        key={activeLesson._id}
        src={activeLesson.video.url}
        controls
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  };

  const handleChatSend = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const next = [...chatMessages, { role: "user", text }];
    setChatMessages(next);
    setChatInput("");
    setChatLoading(true);

    try {
      // هنا حط الكول بتاعك اللي بيبعت المحتوى (activeLesson) + السؤال للـ AI ويرجع الرد
      const reply = "..."; // استبدلها بالرد الحقيقي
      setChatMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: "حصل خطأ، حاول تاني." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        fontFamily: "'Inter', system-ui, sans-serif",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Top bar */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: "center" }}>
        <IconButton
          size="small"
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
          Course Library{" "}
          <Box component="span" sx={{ color: "text.disabled", mx: 0.5 }}>
            /
          </Box>{" "}
          <Box component="span" sx={{ color: "text.primary" }}>
            {course.title}
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
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {activeLesson.type === "video" && (
            <>
              {/* Video player */}
              <Box
                sx={{
                  position: "relative",
                  borderRadius: "18px",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  aspectRatio: "16/9",
                  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 60%, ${theme.palette.background.default} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    display: "flex",
                    gap: 1,
                    zIndex: 2,
                  }}
                >
                  <Chip
                    label={course.category}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.15),
                      color: "secondary.main",
                      fontWeight: 600,
                      fontSize: 12,
                      border: "1px solid",
                      borderColor: alpha(theme.palette.secondary.main, 0.35),
                    }}
                  />
                  <Chip
                    label={activeLesson.isFree ? "مجاني" : "مدفوع"}
                    size="small"
                    sx={{
                      bgcolor: "action.hover",
                      color: "text.secondary",
                      fontSize: 12,
                      fontFamily: "monospace",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                </Box>

                {renderPlayer()}
              </Box>

              {/* Title row */}
              <Stack
                direction="row"
                sx={{
                  mb: 3,
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "primary.light",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      mb: 0.5,
                    }}
                  >
                    LESSON {activeLesson.order}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    {activeLesson.title}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "10px",
                      color: "text.secondary",
                    }}
                  >
                    <BookmarkBorderRounded fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "10px",
                      color: "text.secondary",
                    }}
                  >
                    <DownloadRounded fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Stack
                direction="row"
                spacing={2.5}
                sx={{ mb: 3, alignItems: "center" }}
              >
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: "center" }}
                >
                  <Avatar
                    sx={{
                      width: 22,
                      height: 22,
                      fontSize: 12,
                      bgcolor: "primary.main",
                    }}
                  >
                    {course.instructor[0]}
                  </Avatar>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {course.instructor}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: "center" }}
                >
                  <AccessTimeRounded
                    sx={{ fontSize: 15, color: "text.secondary" }}
                  />
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {course.duration}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: "center" }}
                >
                  <GroupRounded
                    sx={{ fontSize: 15, color: "text.secondary" }}
                  />
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {course.students.toLocaleString()}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: "center" }}
                >
                  <StarRounded sx={{ fontSize: 16, color: "warning.main" }} />
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "warning.main",
                      fontWeight: 600,
                    }}
                  >
                    {course.rating}
                  </Typography>
                </Stack>
              </Stack>

              {/* Tabs */}
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  mb: 2.5,
                  minHeight: 40,
                  "& .MuiTab-root": {
                    color: "text.secondary",
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: "none",
                    minHeight: 40,
                  },
                  "& .Mui-selected": { color: "text.primary !important" },
                  "& .MuiTabs-indicator": {
                    bgcolor: "primary.light",
                    height: 2.5,
                    borderRadius: 2,
                  },
                }}
              >
                <Tab label="Overview" />
                <Tab label="Notes" />
                <Tab label="Resources" />
                <Tab label="Discussion" />
              </Tabs>

              {tab === 0 && (
                <Box>
                  <Typography
                    sx={{
                      fontSize: 14.5,
                      lineHeight: 1.9,
                      color: "text.secondary",
                      mb: 2,
                    }}
                  >
                    {activeLesson.description}
                  </Typography>
                </Box>
              )}
              {tab !== 0 && (
                <Box
                  sx={{
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: "14px",
                    p: 4,
                    textAlign: "center",
                    color: "text.secondary",
                    fontSize: 14,
                  }}
                >
                  Nothing here yet.
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Button
                  variant="outlined"
                  disabled={
                    lessons.findIndex((l) => l._id === activeLesson._id) === 0
                  }
                  onClick={() => {
                    const idx = lessons.findIndex(
                      (l) => l._id === activeLesson._id,
                    );
                    if (idx > 0) setLessonId(lessons[idx - 1]._id);
                  }}
                  sx={{
                    borderColor: "divider",
                    color: "text.secondary",
                    textTransform: "none",
                    borderRadius: "10px",
                    px: 2.5,
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  ← Previous lesson
                </Button>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    progressHandleSubmit(undefined);
                  }}
                >
                  <Button
                    onClick={() => {
                      handleMarkComplete();
                      // current()
                    }}
                    type="submit"
                    disabled={progressMutation.isPending}
                    variant="contained"
                    color="primary"
                    sx={{
                      textTransform: "none",
                      borderRadius: "10px",
                      px: 3,
                      fontWeight: 600,
                    }}
                  >
                    {progressMutation.isPending ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : completedLessons.has(activeLesson._id) ? (
                      "was completed"
                    ) : (
                      "Mark complete"
                    )}
                  </Button>
                </form>
              </Stack>

              {/* ================= AI Chat: lesson summary ================= */}
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
                {/* Header */}
                <Stack
                  direction="row"
                  spacing={1.2}
                  sx={{
                    alignItems: "center",
                    px: 2.5,
                    py: 1.8,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }}
                >
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
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "text.primary",
                      }}
                    >
                      مساعد الدرس
                    </Typography>
                    <Typography
                      sx={{ fontSize: 11.5, color: "text.secondary" }}
                    >
                      يلخصلك الفيديو ويجاوب على أسئلتك
                    </Typography>
                  </Box>
                </Stack>

                {/* Messages */}
                <Box
                  ref={chatScrollRef}
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
                  {messages.map((m, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      sx={{
                        justifyContent:
                          m.role === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: "78%",
                          px: 1.8,
                          py: 1.1,
                          borderRadius: "14px",
                          borderBottomRightRadius: m.role === "user" ? 4 : 14,
                          borderBottomLeftRadius:
                            m.role === "assistant" ? 4 : 14,
                          bgcolor:
                            m.role === "user"
                              ? "primary.main"
                              : alpha(theme.palette.text.primary, 0.04),
                          color:
                            m.role === "user"
                              ? "primary.contrastText"
                              : "text.primary",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13.5,
                            lineHeight: 1.7,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {m.text}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}

                  {chatLoading && (
                    <Stack
                      direction="row"
                      sx={{ justifyContent: "flex-start" }}
                    >
                      <Box
                        sx={{
                          px: 1.8,
                          py: 1.1,
                          borderRadius: "14px",
                          borderBottomLeftRadius: 4,
                          bgcolor: alpha(theme.palette.text.primary, 0.04),
                        }}
                      >
                        <CircularProgress size={16} thickness={5} />
                      </Box>
                    </Stack>
                  )}
                </Box>

                {/* Input */}
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
                    placeholder="اكتب سؤالك... أو اطلب ملخص للفيديو"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        fontSize: 13.5,
                      },
                    }}
                  />
                  <IconButton
                    onClick={handleSubmit}
                    disabled={chatLoading || !chatInput.trim()}
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
              {/* =============== end AI Chat =============== */}
            </>
          )}
          {activeLesson.type === "quiz" && (
            <Box
              sx={{
                bgcolor: "background.default",
                minHeight: "100vh",
                py: { xs: 3, sm: 5 },
              }}
            >
              <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
                {quizFinished ? (
                  <Box>
                    {/* Result Card */}
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
                      <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{
                          fontSize: { xs: 24, sm: 30 },
                          mb: 2,
                        }}
                      >
                        🎉 Quiz Finished
                      </Typography>

                      <Typography
                        sx={{
                          color: "text.secondary",
                          mb: 2,
                        }}
                      >
                        Your Result
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: { xs: 48, sm: 64 },
                          fontWeight: 800,
                          color: "#7C6BF0",
                          lineHeight: 1,
                          mb: 2,
                        }}
                      >
                        {quizResult?.score} / {quizResult?.total}
                      </Typography>

                      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                        {quizResult?.percentage}%
                      </Typography>

                      <Typography
                        sx={{
                          color: "text.secondary",
                        }}
                      >
                        You answered {quizResult?.score} out of{" "}
                        {quizResult?.total} questions correctly.
                      </Typography>
                    </Box>
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
                        {activeLesson.questions.map((question, index) => {
                          const userAnswer = answers[index];
                          const isCorrect =
                            userAnswer === question.correctAnswer;
                          return (
                            <Box>
                              {userAnswer !== undefined ? (
                                <Box
                                  key={index}
                                  sx={{
                                    p: 2.5,
                                    borderRadius: 2.5,
                                    border: "1px solid",
                                    borderColor: isCorrect
                                      ? "success.main"
                                      : "error.main",
                                    bgcolor: isCorrect
                                      ? "rgba(46,125,50,0.06)"
                                      : "rgba(211,47,47,0.06)",
                                  }}
                                >
                                  <>
                                    {/* Question */}
                                    <Typography
                                      fontWeight={700}
                                      sx={{ mb: 1.5 }}
                                    >
                                      {index + 1}. {question.question}
                                    </Typography>

                                    {/* User Answer */}
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        mb: 0.7,
                                        color: isCorrect
                                          ? "success.main"
                                          : "error.main",
                                      }}
                                    >
                                      Your answer: {userAnswer || "No answer"}
                                    </Typography>

                                    {/* Correct Answer */}
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "success.main",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Correct answer: {question.correctAnswer}
                                    </Typography>
                                  </>
                                </Box>
                              ) : (
                                <></>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Box>
                ) : (
                  <>
                    {/* =========================
              HEADER
          ========================= */}
                    <Stack
                      direction="row"
                      sx={{
                        mb: 2,
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                      gap={2}
                    >
                      <Box>
                        <Typography
                          variant="h5"
                          fontWeight={800}
                          sx={{
                            fontSize: { xs: 20, sm: 24 },
                          }}
                        >
                          {activeLesson.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          sx={{
                            color: "text.secondary",
                            mt: 0.5,
                          }}
                        >
                          Question {quiz.currentQuestion + 1} of{" "}
                          {activeLesson.questions.length}
                        </Typography>
                      </Box>

                      {/* Timer */}
                      <Chip
                        icon={
                          <AccessTimeRoundedIcon
                            sx={{
                              color: "#9B8CFF !important",
                              fontSize: 16,
                            }}
                          />
                        }
                        label={quiz.timeLeft}
                        sx={{
                          border: "1px solid rgba(124,107,240,0.4)",
                          fontFamily: "monospace",
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      />
                    </Stack>

                    {/* =========================
              PROGRESS
          ========================= */}
                    <LinearProgress
                      variant="determinate"
                      value={
                        ((quiz.currentQuestion + 1) /
                          activeLesson.questions.length) *
                        100
                      }
                      sx={{
                        height: 6,
                        borderRadius: 5,
                        mb: 3,

                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                        },
                      }}
                    />
                    <Box
                      sx={{
                        bgcolor: "background.paper",
                        border: "1px solid #777777b6",
                        borderRadius: 3,
                        p: { xs: 2.5, sm: 4 },
                      }}
                    >
                      {(() => {
                        const currentQuestion =
                          activeLesson.questions[quiz.currentQuestion];

                        if (!currentQuestion) return null;

                        return (
                          <>
                            {/* Question */}
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              sx={{
                                mb: 3,
                                fontSize: {
                                  xs: 16,
                                  sm: 18,
                                },
                              }}
                            >
                              {currentQuestion.question}
                            </Typography>

                            <Stack spacing={2}>
                              {currentQuestion.options.map((option, index) => {
                                const letter = String.fromCharCode(65 + index);

                                const isSelected = selected === option;

                                return (
                                  <Box
                                    key={index}
                                    onClick={() => setSelected(option)}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                      px: 2.5,
                                      py: 2,
                                      borderRadius: 2.5,
                                      cursor: "pointer",

                                      bgcolor: isSelected
                                        ? "rgba(124,107,240,0.18)"
                                        : "#7777771c",

                                      border: isSelected
                                        ? "1px solid #7C6BF0"
                                        : "1px solid rgba(255,255,255,0.08)",

                                      transition: "all 0.15s ease",

                                      "&:hover": {
                                        bgcolor: isSelected
                                          ? "rgba(124,107,240,0.22)"
                                          : "#7777775b",
                                      },
                                    }}
                                  >
                                    {/* Letter */}
                                    <Box
                                      sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,

                                        bgcolor: isSelected
                                          ? "#7C6BF0"
                                          : "rgba(124,107,240,0.12)",

                                        border: isSelected
                                          ? "none"
                                          : "1px solid rgba(124,107,240,0.3)",
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        fontWeight={700}
                                        sx={{
                                          color: isSelected
                                            ? "#fff"
                                            : "#9B8CFF",
                                        }}
                                      >
                                        {letter}
                                      </Typography>
                                    </Box>

                                    {/* Option text */}
                                    <Typography
                                      variant="body1"
                                      fontWeight={500}
                                    >
                                      {option}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Stack>

                            {/* =========================
                      NEXT / SUBMIT
                  ========================= */}
                            <Stack
                              direction="row"
                              sx={{
                                mt: 3.5,
                                justifyContent: "flex-start",
                              }}
                            >
                              <Button
                                type="submit"
                                disabled={
                                  selected === null ||
                                  progressMutation.isPending
                                }
                                onClick={async () => {
                                  // Current question
                                  const currentQuestion =
                                    activeLesson.questions[
                                      quiz.currentQuestion
                                    ];
                                  // =========================
                                  // Save current answer
                                  // =========================

                                  const newAnswers = [...answers];

                                  newAnswers[quiz.currentQuestion] = selected;

                                  setAnswers(newAnswers);

                                  // =========================
                                  // Check last question
                                  // =========================

                                  const isLastQuestion =
                                    quiz.currentQuestion ===
                                    activeLesson.questions.length - 1;

                                  if (isLastQuestion) {
                                    // =========================
                                    // Calculate score
                                    // =========================

                                    let score = 0;

                                    activeLesson.questions.forEach(
                                      (question, index) => {
                                        if (
                                          newAnswers[index] ===
                                          question.correctAnswer
                                        ) {
                                          score++;
                                        }
                                      },
                                    );

                                    const total = activeLesson.questions.length;

                                    const percentage = Math.round(
                                      (score / total) * 100,
                                    );
                                    // =========================
                                    // Save quiz result
                                    // =========================

                                    setQuizResult({
                                      score,
                                      total,
                                      percentage,
                                    });

                                    // =========================
                                    // Save progress + quiz score
                                    // =========================
                                    console.log([score, total, percentage]);
                                    await progressHandleSubmit([
                                      score,
                                      total,
                                      percentage,
                                    ]);

                                    // =========================
                                    // Mark lesson complete
                                    // =========================

                                    handleMarkComplete();

                                    // =========================
                                    // Show result
                                    // =========================

                                    setQuizFinished(true);

                                    return;
                                  }

                                  // =========================
                                  // Go to next question
                                  // =========================

                                  setSelected(null);

                                  setQuiz((prev) => ({
                                    ...prev,
                                    currentQuestion: prev.currentQuestion + 1,
                                  }));
                                }}
                                sx={{
                                  bgcolor: "#7C6BF0",
                                  color: "#fff",
                                  fontWeight: 700,
                                  textTransform: "none",
                                  px: 3.5,
                                  py: 1.2,
                                  borderRadius: 2,

                                  width: {
                                    xs: "100%",
                                    sm: "auto",
                                  },

                                  "&:hover": {
                                    bgcolor: "#6C5CE0",
                                  },

                                  "&.Mui-disabled": {
                                    bgcolor: "rgba(124,107,240,0.35)",
                                    color: "rgba(255,255,255,0.6)",
                                  },
                                }}
                              >
                                {progressMutation.isPending ? (
                                  <CircularProgress size={24} color="inherit" />
                                ) : quiz.currentQuestion ===
                                  activeLesson.questions.length - 1 ? (
                                  "Submit Quiz"
                                ) : (
                                  "Next Question"
                                )}
                              </Button>
                            </Stack>
                          </>
                        );
                      })()}
                    </Box>
                  </>
                )}
              </Container>
            </Box>
          )}
        </Box>
        {/* ---------------- Sidebar: lesson list ---------------- */}
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 0.5,
                }}
              >
                {course.title}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                {completedCount} of {lessons.length} lessons completed
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => navigate(`${location.pathname}/UploadLesson`)}
              startIcon={<CloudUploadRounded sx={{ m: 0 }} />}
              sx={{
                borderRadius: isMobile ? "50%" : "12px",
                minWidth: isMobile ? 48 : "auto",
                width: isMobile ? 48 : "auto",
                height: isMobile ? 48 : "auto",
                p: isMobile ? 0 : "8px 24px",
                textTransform: "none",
                fontWeight: "bold",
                "& .MuiButton-startIcon": {
                  margin: isMobile ? 0 : undefined,
                },
              }}
            >
              {!isMobile && "رفع"}
            </Button>
          </Box>

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
            {lessons
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((lesson) => {
                const isActive = activeLesson._id === lesson._id;
                const done = completedLessons.has(lesson._id);
                return (
                  <Button
                    // disabled={lessons[completedLessons.size]._id}
                    key={lesson._id}
                    onClick={() => {
                      // console.log(progressData?.data?.progres);
                      let click = progressData?.data?.progres.filter(
                        (e) => e.lessonId === lesson._id,
                      );
                      setLessonId(lesson._id);
                      setSelected(null);
                      setAnswers([]);
                      setQuiz({ currentQuestion: 0, timeLeft: 60 });

                      if (completedLessons.has(lesson._id)) {
                        let score = click[0].quizScore[0];
                        const total = click[0].quizScore[1];

                        const percentage = click[0].quizScore[2];
                        // =========================
                        // Save quiz result
                        // =========================
                        setQuizFinished(true);
                        const result = {
                          score,
                          total,
                          percentage,
                        };

                        setQuizResult(result);
                      } else {
                        setQuizFinished(false);
                      }
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      borderRadius: "10px",
                      px: 1.2,
                      py: 1,
                      cursor: "pointer",
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
                        fontSize: 13.5,
                        color: isActive ? "text.primary" : "text.secondary",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {lesson.title}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "text.disabled",
                        fontFamily: "monospace",
                      }}
                    >
                      {lesson.type === "quiz"
                        ? "Quiz"
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
