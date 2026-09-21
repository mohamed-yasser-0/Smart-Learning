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
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CloudUploadRounded from "@mui/icons-material/CloudUploadRounded";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import AddCircleOutlineRounded from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(1);
  const [type, setType] = useState("video");
  const [isFree, setIsFree] = useState(false);
  const [videoFile, setVideoFile] = useState(null);

  // ✅ ستيت خاص بالكويز بس - مش هيأثر على اللوجيك القديم خالص
  const [questions, setQuestions] = useState([
    { text: "", options: ["", ""], correctIndex: 0 },
  ]);

  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const video = {
    url: "https://youtu.be/ZkHj91CKoVE?si=gj8By5lLuQsBBZcT",
    provider: "youTube",
  };
  const isQuiz = type === "quiz";

  const LessonMutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `https://smart-learning-production-61a2.up.railway.app/api/lessons/${courseId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // ✅ الكويز بيتبعت JSON عادي (زي ما الباك اند عايزه)، الدرس بيتبعت multipart زي ما كان بالظبط
            "Content-Type": isQuiz ? "application/json" : "multipart/form-data",
          },
        },
      );
      return res.data;
    },

    onSuccess: () => {
      toast.success("تم رفع الدرس بنجاح");
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
      const invalid = questions.some(
        (q) => !q.text.trim() || q.options.some((op) => !op.trim()),
      );
      if (invalid) {
        toast.error("أكمل كل أسئلة الكويز واختياراتها الأول");
        return;
      }
    }

    if (isQuiz) {
      const quizPayload = {
        title,
        description,
        order,
        type,
        isFree,
        course: courseId,
        questions: questions.map((q) => ({
          question: q.text,
          options: q.options,
          correctAnswer: q.options[q.correctIndex],
        })),
      };
      LessonMutation.mutate(quizPayload);
      return;
    }
    const LessonPayload = {
      title,
      description,
      order,
      type,
      isFree,
      course: courseId,
      if(videoFile) {
        video: videoFile;
      },
      video: {
        url: "https://youtu.be/ZkHj91CKoVE?si=gj8By5lLuQsBBZcT",
        provider: "youTube",
      },
    };
    LessonMutation.mutate(LessonPayload);
  };

  const handleVideo = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  // ---------------- Quiz helpers ----------------
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { text: "", options: ["", ""], correctIndex: 0 },
    ]);
  };

  const removeQuestion = (qIndex) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const updateQuestionText = (qIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, text: value } : q)),
    );
  };

  const addOption = (qIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  };

  const removeOption = (qIndex, oIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const newOptions = q.options.filter((_, oi) => oi !== oIndex);
        const newCorrect =
          q.correctIndex === oIndex
            ? 0
            : q.correctIndex > oIndex
              ? q.correctIndex - 1
              : q.correctIndex;
        return { ...q, options: newOptions, correctIndex: newCorrect };
      }),
    );
  };

  const updateOptionText = (qIndex, oIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const newOptions = [...q.options];
        newOptions[oIndex] = value;
        return { ...q, options: newOptions };
      }),
    );
  };

  const setCorrectOption = (qIndex, oIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, correctIndex: oIndex } : q)),
    );
  };
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
              {isQuiz ? "رفع كويز جديد" : "رفع درس جديد"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              {isQuiz
                ? "اكتب أسئلة الكويز بعدين اضغط نشر"
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
          <Button
            type="button"
            variant="outlined"
            startIcon={<SaveOutlined fontSize="small" />}
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
            حفظ كمسودة
          </Button>

          <Button
            type="submit"
            disabled={LessonMutation.isPending}
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
              px: 3,
              fontWeight: 600,
            }}
          >
            {LessonMutation.isPending
              ? "جاري النشر..."
              : isQuiz
                ? "نشر الكويز"
                : "نشر الدرس"}
          </Button>
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
                label={isQuiz ? "عنوان الكويز" : "عنوان الدرس"}
                placeholder="مثال: مقدمة في React"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={fieldSx}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                label={isQuiz ? "وصف الكويز" : "وصف الدرس"}
                placeholder="اشرح محتوى الدرس بإيجاز"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={fieldSx}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="ترتيب الدرس"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  sx={fieldSx}
                />

                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>نوع الدرس</InputLabel>
                  <Select
                    value={type}
                    label="نوع الدرس"
                    onChange={(e) => setType(e.target.value)}
                  >
                    <MenuItem value="video">Video</MenuItem>
                    <MenuItem value="article">Article</MenuItem>
                    <MenuItem value="quiz">Quiz</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                  />
                }
                label="درس مجاني"
              />
            </Stack>
          </Box>

          {/* ---------------- Quiz builder (يظهر بس لو النوع كويز) ---------------- */}
          {isQuiz && (
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
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2.5,
                }}
              >
                <Typography
                  sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}
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
                {questions.map((q, qIndex) => (
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
                      {questions.length > 1 && (
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
                                updateOptionText(qIndex, oIndex, e.target.value)
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
          )}
        </Box>

        {/* ---------------- Sidebar ---------------- */}
        <Box sx={{ width: { xs: "100%", lg: 340 }, flexShrink: 0 }}>
          {/* Video Upload - بيظهر بس لو النوع مش كويز */}
          {!isQuiz && (
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
                {videoFile ? (
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
                      {videoFile.name}
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
                عدد الأسئلة: {questions.length}
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
                  label: isQuiz ? "عنوان ووصف الكويز" : "عنوان ووصف الدرس",
                  done: !!title && !!description,
                },
                isQuiz
                  ? {
                      label: "أسئلة الكويز",
                      done: questions.every(
                        (q) =>
                          q.text.trim() && q.options.every((op) => op.trim()),
                      ),
                    }
                  : { label: "فيديو الدرس", done: !!videoFile },
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
              {LessonMutation.isPending
                ? "جاري النشر..."
                : isQuiz
                  ? "نشر الكويز"
                  : "نشر الدرس"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
