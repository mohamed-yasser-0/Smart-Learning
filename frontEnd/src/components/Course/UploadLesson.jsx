import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CloudUploadRounded from "@mui/icons-material/CloudUploadRounded";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import AddCircleOutlineRounded from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    bgcolor: "background.default",
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "primary.main" },
    "&.Mui-focused fieldset": { borderColor: "primary.main" },
  },
  "& .MuiInputLabel-root": { color: "text.secondary" },
  "& .MuiOutlinedInput-input": { color: "text.primary" },
};

export default function UploadLesson() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 1,
    type: "video",
    vUrl: "",
    isFree: false,
    videoFile: null,
    articleContent: "", // ✅ جديد: محتوى المقال
    questions: [
      {
        text: "",
        options: ["", ""],
        correctIndex: 0,
      },
    ],
  });
  const { id: courseId } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      const res = await axios.get(
        `https://smart-learning-git-main-mohamed-yasser-0s-projects.vercel.app/api/lessons/${courseId}`,
      );
      return res.data;
    },
    enabled: !!courseId,
  });
  const lessonsData = data?.data?.lesson || [];

  const navigate = useNavigate();
  const isQuiz = formData.type === "quiz";
  const isArticle = formData.type === "article"; // ✅ جديد

  const [selectedLessonIds, setSelectedLessonIds] = useState([]);

  const toggleLesson = (id) => {
    setSelectedLessonIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  // الدروس التي اختارها المستخدم
  const selectedLessons = lessonsData.filter((lesson) =>
    selectedLessonIds.includes(lesson._id),
  );

  // محتوى الدروس المختارة فقط
  const lessonTexts = selectedLessons
    .map((lesson) => lesson.video?.text)
    .filter(Boolean);

  // كل محتوى الدروس في نص واحد
  const lessonContent = lessonTexts.join("\n\n");

  const [openQuizDialog, setOpenQuizDialog] = useState(false);

  const [quizSettings, setQuizSettings] = useState({
    questionsCount: 5,
  });

  const chatMutation = useMutation({
    mutationFn: async (summary) => {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://smart-learning-git-main-mohamed-yasser-0s-projects.vercel.app/api/ai/Summarize",
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
      const generated = JSON.parse(data.respo);

      if (generated.type === "quiz") {
        setFormData({
          title: generated.title,
          description: generated.description,
          order: generated.order,
          type: generated.type,
          vUrl: "",
          isFree: generated.isFree,
          videoFile: null,

          questions: generated.questions.map((q) => ({
            text: q.question,
            options: q.options,
            correctIndex: q.options.indexOf(q.correctAnswer),
          })),
        });
      }

      if (generated.type === "article") {
        setFormData({
          title: generated.title,
          description: generated.description,
          order: generated.order,
          type: generated.type,
          vUrl: "",
          isFree: generated.isFree,
          videoFile: null,

          articleContent: generated.articleContent,

          questions: [],
        });
      }
    },
  });

  const LessonMutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `https://smart-learning-git-main-mohamed-yasser-0s-projects.vercel.app/api/lessons/${courseId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // ✅ الكويز والمقال بيتبعتوا JSON عادي، الدرس بيتبعت multipart زي ما كان بالظبط
            "Content-Type":
              isQuiz || isArticle ? "application/json" : "multipart/form-data",
          },
        },
      );
      return res.data;
    },

    onSuccess: () => {
      toast.success(
        isQuiz
          ? "تم رفع الكويز بنجاح"
          : isArticle
            ? "تم رفع المقال بنجاح"
            : "تم رفع الدرس بنجاح",
      );
      navigate(-1);
    },

    onError: (error) => {
      if (error.response?.data?.message === "jwt expired") {
        localStorage.removeItem("token");
        toast.error("انتهت صلاحية الجلسة، سجل الدخول مرة أخرى");
        navigate("/");
        return;
      }
      toast.error(error.response?.data?.message || "حصل خطأ");
    },
  });

  const lessonHandleSubmit = (e) => {
    e.preventDefault();

    // ✅ تحقق إضافي للكويز بس (مش بيغير تحقق الدرس العادي)
    if (isQuiz) {
      const invalid = formData.questions.some(
        (q) => !q.text.trim() || q.options.some((op) => !op.trim()),
      );
      // if (invalid) {
      //   toast.error("أكمل كل أسئلة الكويز واختياراتها الأول");
      //   return;
      // }
    }

    if (isQuiz) {
      const quizPayload = {
        title: formData.title,
        description: formData.description,
        order: formData.order,
        type: formData.type,
        isFree: formData.isFree,
        course: courseId,
        questions: formData.questions.map((q) => ({
          question: q.text,
          options: q.options,
          correctAnswer: q.options[q.correctIndex],
        })),
      };
      LessonMutation.mutate(quizPayload);
      return;
    }

    // ✅ جديد: المقال
    if (isArticle) {
      const articlePayload = {
        title: formData.title,
        description: formData.description,
        order: formData.order,
        type: formData.type,
        isFree: formData.isFree,
        course: courseId,
        articleContent: formData.articleContent, // غيّر الاسم لو الباك اند مستني اسم تاني
      };
      LessonMutation.mutate(articlePayload);
      return;
    }

    const LessonPayload = {
      title: formData.title,
      description: formData.description,
      order: formData.order,
      type: formData.type,
      isFree: formData.isFree,
      course: courseId,
      ...(formData.videoFile && { video: formData.videoFile }),
      ...(formData.vUrl && {
        video: {
          url: formData.vUrl,
          provider: "youTube",
        },
      }),
    };
    LessonMutation.mutate(LessonPayload);
  };

  const handleVideo = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, videoFile: file }));
    }
  };

  // ---------------- Quiz helpers ----------------
  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: "",
          options: ["", ""],
          correctIndex: 0,
        },
      ],
    }));
  };

  const removeQuestion = (qIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex),
    }));
  };

  const updateQuestionText = (qIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex ? { ...q, text: value } : q,
      ),
    }));
  };

  const addOption = (qIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, ""] } : q,
      ),
    }));
  };

  const removeOption = (qIndex, oIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qIndex) return q;

        const newOptions = q.options.filter((_, oi) => oi !== oIndex);

        const newCorrect =
          q.correctIndex === oIndex
            ? 0
            : q.correctIndex > oIndex
              ? q.correctIndex - 1
              : q.correctIndex;

        return {
          ...q,
          options: newOptions,
          correctIndex: newCorrect,
        };
      }),
    }));
  };

  const updateOptionText = (qIndex, oIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qIndex) return q;

        const newOptions = [...q.options];
        newOptions[oIndex] = value;

        return {
          ...q,
          options: newOptions,
        };
      }),
    }));
  };

  const setCorrectOption = (qIndex, oIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex ? { ...q, correctIndex: oIndex } : q,
      ),
    }));
  };

  // ✅ جديد: نصوص حسب النوع
  const typeLabel = isQuiz ? "كويز" : isArticle ? "مقال" : "درس";
  const publishLabel = isQuiz
    ? "نشر الكويز"
    : isArticle
      ? "نشر المقال"
      : "نشر الدرس";

  const articleWordCount = formData.articleContent?.trim()
    ? formData.articleContent.trim().split(/\s+/).length
    : 0;

  return (
    <Box
      component="form"
      onSubmit={lessonHandleSubmit}
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        fontFamily: "'Inter', system-ui, sans-serif",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Top bar */}
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.5}>
          <IconButton
            onClick={() => navigate(-1)}
            size="small"
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
          <Box>
            <Typography
              sx={{ fontSize: 20, fontWeight: 700, color: "text.primary" }}
            >
              {`رفع ${typeLabel} جديد`}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              {isQuiz
                ? "اكتب أسئلة الكويز بعدين اضغط نشر"
                : isArticle
                  ? "اكتب محتوى المقال بعدين اضغط نشر"
                  : "اكتب معلومات الدرس بعدين اضغط نشر"}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            mt: { xs: 2, md: 0 },
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            size="small"
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "10px",
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <CloseIcon fontSize="small" />{" "}
          </IconButton>
        </Stack>
      </Stack>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", lg: "row" },
        }}
      >
        {/* ---------------- Main form ---------------- */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "18px",
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: "text.primary",
                mb: 2.5,
              }}
            >
              المعلومات الأساسية
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label={`عنوان ال${typeLabel}`}
                placeholder="مثال: مقدمة في React"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                sx={fieldSx}
              />

              <Stack direction="row" spacing={2}>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>نوع الدرس</InputLabel>
                  <Select
                    value={formData.type}
                    label="نوع الدرس"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, type: e.target.value }))
                    }
                  >
                    <MenuItem value="video">Video</MenuItem>
                    <MenuItem value="article">Article</MenuItem>
                    <MenuItem value="quiz">Quiz</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  type="number"
                  label="ترتيب الدرس"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      order: Number(e.target.value),
                    }))
                  }
                  sx={fieldSx}
                />
              </Stack>
            </Stack>
          </Box>

          {/* ---------------- Article editor (يظهر بس لو النوع مقال) ---------------- */}
          {isArticle && (
            <>
              <Button
                fullWidth
                disabled={chatMutation.isPending}
                startIcon={
                  chatMutation.isPending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AutoAwesomeIcon />
                  )
                }
                onClick={() => {
                  setOpenQuizDialog(true);
                }}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "10px",
                }}
              >
                {chatMutation.isPending
                  ? " جاري توليد المقال..."
                  : "توليد مقال تلقائي"}
              </Button>
              <Box
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "18px",
                  p: 3,
                  my: 3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "text.primary",
                    mb: 2.5,
                  }}
                >
                  محتوى المقال
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  minRows={12}
                  label="نص المقال"
                  placeholder="اكتب محتوى المقال هنا..."
                  value={formData.articleContent}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      articleContent: e.target.value,
                    }))
                  }
                  sx={fieldSx}
                />
              </Box>
            </>
          )}

          {/* ---------------- Quiz builder (يظهر بس لو النوع كويز) ---------------- */}
          {isQuiz && (
            <>
              <Button
                fullWidth
                disabled={chatMutation.isPending}
                startIcon={
                  chatMutation.isPending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AutoAwesomeIcon />
                  )
                }
                onClick={() => {
                  setOpenQuizDialog(true);
                }}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "10px",
                }}
              >
                {chatMutation.isPending
                  ? "جاري توليد الكويز..."
                  : "توليد كويز تلقائي"}
              </Button>
              <Box
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "18px",
                  p: 3,
                  my: 3,
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    أسئلة الكويز
                  </Typography>
                  <Button
                    type="button"
                    size="small"
                    onClick={addQuestion}
                    startIcon={<AddCircleOutlineRounded fontSize="small" />}
                    sx={{
                      textTransform: "none",
                      borderRadius: "10px",
                      fontWeight: 600,
                    }}
                  >
                    إضافة سؤال
                  </Button>
                </Stack>

                <Stack spacing={3}>
                  {formData.questions.map((q, qIndex) => (
                    <Box
                      key={qIndex}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "14px",
                        p: 2.5,
                        bgcolor: "background.default",
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "text.secondary",
                          }}
                        >
                          سؤال {qIndex + 1}
                        </Typography>
                        {formData.questions.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={() => removeQuestion(qIndex)}
                            sx={{ color: "error.main" }}
                          >
                            <DeleteOutlineRounded fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>

                      <TextField
                        fullWidth
                        label="نص السؤال"
                        value={q.text}
                        onChange={(e) =>
                          updateQuestionText(qIndex, e.target.value)
                        }
                        sx={{ ...fieldSx, mb: 2 }}
                      />

                      <Typography
                        sx={{ fontSize: 12.5, color: "text.secondary", mb: 1 }}
                      >
                        الاختيارات (اختار الإجابة الصح)
                      </Typography>

                      <RadioGroup
                        value={q.correctIndex}
                        onChange={(e) =>
                          setCorrectOption(qIndex, Number(e.target.value))
                        }
                      >
                        <Stack spacing={1.2}>
                          {q.options.map((op, oIndex) => (
                            <Stack
                              key={oIndex}
                              direction="row"
                              spacing={1}
                              sx={{ alignItems: "center" }}
                            >
                              <Radio value={oIndex} size="small" />
                              <TextField
                                fullWidth
                                size="small"
                                placeholder={`اختيار ${oIndex + 1}`}
                                value={op}
                                onChange={(e) =>
                                  updateOptionText(
                                    qIndex,
                                    oIndex,
                                    e.target.value,
                                  )
                                }
                                sx={fieldSx}
                              />
                              {q.options.length > 2 && (
                                <IconButton
                                  size="small"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  sx={{ color: "error.main" }}
                                >
                                  <DeleteOutlineRounded fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                          ))}
                        </Stack>
                      </RadioGroup>

                      <Button
                        type="button"
                        size="small"
                        onClick={() => addOption(qIndex)}
                        startIcon={<AddCircleOutlineRounded fontSize="small" />}
                        sx={{ textTransform: "none", mt: 1.5, fontWeight: 600 }}
                      >
                        إضافة اختيار
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Box>

        {/* ---------------- Sidebar ---------------- */}
        <Box sx={{ width: { xs: "100%", lg: 340 }, flexShrink: 0 }}>
          {/* Video Upload - بيظهر بس لو النوع فيديو */}
          {!isQuiz && !isArticle && (
            <Box
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "18px",
                p: 2.5,
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 1.5,
                }}
              >
                فيديو الدرس
              </Typography>

              <Box
                component="label"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  height: 160,
                  borderRadius: "14px",
                  border: "1px dashed",
                  borderColor: "divider",
                  bgcolor: "background.default",
                  cursor: "pointer",
                  overflow: "hidden",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={handleVideo}
                />
                {formData.videoFile ? (
                  <>
                    <CloudUploadRounded
                      sx={{ fontSize: 30, color: "success.main" }}
                    />
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        color: "text.secondary",
                        textAlign: "center",
                        px: 1,
                      }}
                    >
                      {formData.videoFile.name}
                    </Typography>
                  </>
                ) : (
                  <>
                    <CloudUploadRounded
                      sx={{ fontSize: 30, color: "text.disabled" }}
                    />
                    <Typography
                      sx={{ fontSize: 12.5, color: "text.secondary" }}
                    >
                      اضغط لرفع فيديو
                    </Typography>
                  </>
                )}
              </Box>
              <Box sx={{ mt: 3 }} />
              <TextField
                fullWidth
                type="string"
                label="رفع لينك يوتيوب"
                value={formData.vUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    vUrl: String(e.target.value),
                  }))
                }
                sx={fieldSx}
              />
            </Box>
          )}

          {/* Quiz summary - بيظهر بس لو النوع كويز */}
          {isQuiz && (
            <Box
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "18px",
                p: 2.5,
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 1.5,
                }}
              >
                ملخص الكويز
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                عدد الأسئلة: {formData.questions.length}
              </Typography>
            </Box>
          )}

          {/* Article summary - بيظهر بس لو النوع مقال */}
          {isArticle && (
            <Box
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "18px",
                p: 2.5,
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 1.5,
                }}
              >
                ملخص المقال
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                عدد الكلمات: {articleWordCount}
              </Typography>
            </Box>
          )}

          {/* Publish checklist */}
          <Box
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "18px",
              p: 2.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: "text.primary",
                mb: 1.5,
              }}
            >
              قبل النشر
            </Typography>
            <Stack spacing={1}>
              {[
                {
                  label: `عنوان ووصف ال${typeLabel}`,
                  done: !!formData.title && !!formData.description,
                },
                isQuiz
                  ? {
                      label: "أسئلة الكويز",
                      done: formData.questions.every(
                        (q) =>
                          q.text.trim() && q.options.every((op) => op.trim()),
                      ),
                    }
                  : isArticle
                    ? {
                        label: "محتوى المقال",
                        done: !!formData.articleContent?.trim(),
                      }
                    : { label: "فيديو الدرس", done: !!formData.videoFile },
              ].map((item) => (
                <Stack
                  key={item.label}
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: item.done ? "success.main" : "text.disabled",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: item.done ? "text.primary" : "text.secondary",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Button
              type="submit"
              disabled={LessonMutation.isPending}
              fullWidth
              variant="contained"
              color="primary"
              startIcon={
                LessonMutation.isPending ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <RocketLaunchRounded fontSize="small" />
                )
              }
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                fontWeight: 600,
                py: 1.1,
              }}
            >
              {LessonMutation.isPending ? "جاري النشر..." : publishLabel}
            </Button>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openQuizDialog}
        onClose={() => setOpenQuizDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>توليد محتوى تلقائي</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* عدد الأسئلة - يظهر للكويز فقط */}
            {formData.type === "quiz" && (
              <TextField
                label="عدد الأسئلة"
                type="number"
                fullWidth
                value={quizSettings.questionsCount}
                onChange={(e) =>
                  setQuizSettings((prev) => ({
                    ...prev,
                    questionsCount: Number(e.target.value),
                  }))
                }
                slotProps={{
                  htmlInput: {
                    min: 1,
                    max: 20,
                  },
                }}
              />
            )}

            {/* اختيار الدروس */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                اختر الدروس التي تريد أن يعتمد عليها المحتوى
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {lessonsData
                  .filter((lesson) => lesson.video?.text)
                  .map((lesson) => (
                    <Chip
                      key={lesson._id}
                      label={lesson.title}
                      clickable
                      color={
                        selectedLessonIds.includes(lesson._id)
                          ? "primary"
                          : "default"
                      }
                      variant={
                        selectedLessonIds.includes(lesson._id)
                          ? "filled"
                          : "outlined"
                      }
                      onClick={() => toggleLesson(lesson._id)}
                    />
                  ))}
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 1,
                }}
              >
                تم اختيار {selectedLessons.length} درس
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenQuizDialog(false)}>إلغاء</Button>

          <Button
            variant="contained"
            disabled={chatMutation.isPending || selectedLessons.length === 0}
            startIcon={
              chatMutation.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            onClick={() => {
              const prompt =
                formData.type === "quiz"
                  ? `
Generate a multiple-choice quiz based ONLY on the lesson content below.

Requirements:
- Generate ${quizSettings.questionsCount} questions.
- Each question must have exactly 4 options.
- Only one option is correct.
- correctAnswer must exactly match one of the options.
- Questions must be based ONLY on the lesson content.
- Do not use information from outside the lesson content.
- Use Arabic when the lesson is Arabic.
- No explanations.
- No markdown.
- Return ONLY valid JSON.

Return exactly this structure:

{
  "title": "اختبار الدرس",
  "order": 1,
  "type": "quiz",
  "questions": [
    {
      "question": "السؤال",
      "options": [
        "الخيار الأول",
        "الخيار الثاني",
        "الخيار الثالث",
        "الخيار الرابع"
      ],
      "correctAnswer": "الخيار الأول"
    }
  ]
}

Lesson Content:
${lessonContent}
`
                  : `
Generate an educational article based ONLY on the lesson content below.

Requirements:
- The article must be based ONLY on the lesson content.
- Do not add information from outside the lesson content.
- Use Arabic when the lesson is Arabic.
- Make the article clear and well organized.
- Include a suitable title.
- Include a useful description.
- No markdown.
- Return ONLY valid JSON.

Return exactly this structure:

{
  "title": "عنوان المقال",
  "order": 1,
  "type": "article",
  "articleContent": "محتوى المقال"
}

Lesson Content:
${lessonContent}
`;
              chatMutation.mutate(prompt);

              setOpenQuizDialog(false);
            }}
          >
            {chatMutation.isPending
              ? "جاري التوليد..."
              : formData.type === "quiz"
                ? "توليد الكويز"
                : "توليد المقال"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
