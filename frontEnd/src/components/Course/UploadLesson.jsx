import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import AddCircleOutlineRounded from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { getYouTubeId } from "../../utils/youtube";
import {
  DEFAULT_ARTICLE_INSTRUCTIONS,
  buildArticlePrompt,
  buildQuizPrompt,
} from "../../utils/lessonPrompts";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------
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

const cardSx = {
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: "18px",
  p: 3,
};

const emptyQuestion = () => ({ text: "", options: ["", ""], correctIndex: 0 });

const TYPE_TEXT = {
  video: {
    label: "درس",
    publish: "نشر الدرس",
    hint: "اكتب معلومات الدرس بعدين اضغط نشر",
    success: "تم رفع الدرس بنجاح",
  },
  article: {
    label: "مقال",
    publish: "نشر المقال",
    hint: "اكتب محتوى المقال بعدين اضغط نشر",
    success: "تم رفع المقال بنجاح",
  },
  quiz: {
    label: "كويز",
    publish: "نشر الكويز",
    hint: "اكتب أسئلة الكويز بعدين اضغط نشر",
    success: "تم رفع الكويز بنجاح",
  },
};

// الـ AI ساعات بيرجّع JSON جوه ```json fences
const parseAiJson = (raw) =>
  JSON.parse(
    String(raw)
      .replace(/```json|```/g, "")
      .trim(),
  );

// ---------------------------------------------------------------------------
// Question editor
// ---------------------------------------------------------------------------
function QuestionEditor({
  question,
  index,
  canRemove,
  onRemove,
  onText,
  onOptionText,
  onAddOption,
  onRemoveOption,
  onCorrect,
}) {
  return (
    <Box
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
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Typography
          sx={{ fontSize: 13, fontWeight: 700, color: "text.secondary" }}
        >
          سؤال {index + 1}
        </Typography>
        {canRemove && (
          <IconButton
            size="small"
            aria-label="حذف السؤال"
            onClick={onRemove}
            sx={{ color: "error.main" }}
          >
            <DeleteOutlineRounded fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <TextField
        fullWidth
        label="نص السؤال"
        value={question.text}
        onChange={(e) => onText(e.target.value)}
        sx={{ ...fieldSx, mb: 2 }}
      />

      <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1 }}>
        الاختيارات (اختار الإجابة الصح)
      </Typography>

      <RadioGroup
        value={question.correctIndex}
        onChange={(e) => onCorrect(Number(e.target.value))}
      >
        <Stack spacing={1.2}>
          {question.options.map((op, oIndex) => (
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
                onChange={(e) => onOptionText(oIndex, e.target.value)}
                sx={fieldSx}
              />
              {question.options.length > 2 && (
                <IconButton
                  size="small"
                  aria-label="حذف الاختيار"
                  onClick={() => onRemoveOption(oIndex)}
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
        onClick={onAddOption}
        startIcon={<AddCircleOutlineRounded fontSize="small" />}
        sx={{ textTransform: "none", mt: 1.5, fontWeight: 600 }}
      >
        إضافة اختيار
      </Button>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function UploadLesson() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    order: 1,
    type: "video",
    vUrl: "",
    isFree: false,
    articleContent: "",
    questions: [emptyQuestion()],
  });

  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);
  const [quizSettings, setQuizSettings] = useState({
    questionsCount: 5,
    articleInstructions: DEFAULT_ARTICLE_INSTRUCTIONS,
  });

  const isQuiz = formData.type === "quiz";
  const isArticle = formData.type === "article";
  const isVideo = !isQuiz && !isArticle;
  const text = TYPE_TEXT[formData.type];

  const setField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // ---- الدروس الموجودة (مصدر المحتوى للتوليد التلقائي) ----
  const { data } = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => (await api.get(`/api/lessons/${courseId}`)).data,
    enabled: !!courseId,
  });
  const lessonsData = useMemo(() => data?.data?.lesson ?? [], [data]);

  const selectedLessons = lessonsData.filter((l) =>
    selectedLessonIds.includes(l._id),
  );
  const lessonContent = selectedLessons
    .map((l) => l.video?.text)
    .filter(Boolean)
    .join("\n\n");

  const toggleLesson = (lessonId) =>
    setSelectedLessonIds((prev) =>
      prev.includes(lessonId)
        ? prev.filter((l) => l !== lessonId)
        : [...prev, lessonId],
    );

  // ---- AI generation ----
  const generateMutation = useMutation({
    mutationFn: async (summary) =>
      (await api.post("/api/ai/Summarize", { summary })).data,
    onSuccess: (res) => {
      try {
        const g = parseAiJson(res?.respo);

        if (g.type === "quiz" && Array.isArray(g.questions)) {
          setFormData((prev) => ({
            ...prev,
            type: "quiz",
            title: g.title ?? prev.title,
            questions: g.questions.map((q) => ({
              text: q.question,
              options: q.options,
              correctIndex: Math.max(0, q.options.indexOf(q.correctAnswer)),
            })),
          }));
        } else if (g.type === "article" && g.articleContent) {
          setFormData((prev) => ({
            ...prev,
            type: "article",
            title: g.title ?? prev.title,
            articleContent: g.articleContent,
          }));
        } else {
          throw new Error("unexpected shape");
        }
        toast.success("تم التوليد، راجع المحتوى قبل النشر");
      } catch {
        toast.error("تعذر قراءة رد الذكاء الاصطناعي، حاول مرة أخرى");
      }
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "فشل التوليد التلقائي"),
  });

  const handleGenerate = () => {
    const prompt = isQuiz
      ? buildQuizPrompt(quizSettings.questionsCount, lessonContent)
      : buildArticlePrompt(quizSettings.articleInstructions, lessonContent);
    generateMutation.mutate(prompt);
    setOpenGenerateDialog(false);
  };

  // ---- Submit ----
  const lessonMutation = useMutation({
    mutationFn: async (payload) =>
      (await api.post(`/api/lessons/${courseId}`, payload)).data,
    onSuccess: () => {
      toast.success(text.success);
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      navigate(-1);
    },
    onError: (err) => {
      if (err.response?.data?.message === "jwt expired") {
        localStorage.removeItem("token");
        toast.error("انتهت صلاحية الجلسة، سجل الدخول مرة أخرى");
        navigate("/");
        return;
      }
      toast.error(err.response?.data?.message || "حصل خطأ");
    },
  });

  const validate = () => {
    if (!formData.title.trim()) return `اكتب عنوان ال${text.label}`;
    if (!Number.isInteger(formData.order) || formData.order < 1)
      return "الترتيب لازم يكون رقم صحيح من 1 وأكتر";

    if (isQuiz) {
      const invalid = formData.questions.some(
        (q) =>
          !q.text.trim() ||
          q.options.length < 2 ||
          q.options.some((op) => !op.trim()),
      );
      if (invalid) return "أكمل كل أسئلة الكويز واختياراتها الأول";
    } else if (isArticle) {
      if (!formData.articleContent.trim()) return "اكتب محتوى المقال";
    } else if (!getYouTubeId(formData.vUrl)) {
      return "ادخل لينك يوتيوب صالح";
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errorMessage = validate();
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    const base = {
      title: formData.title.trim(),
      order: formData.order,
      type: formData.type,
      isFree: formData.isFree,
      course: courseId,
    };

    if (isQuiz) {
      lessonMutation.mutate({
        ...base,
        questions: formData.questions.map((q) => ({
          question: q.text.trim(),
          options: q.options.map((op) => op.trim()),
          correctAnswer: q.options[q.correctIndex].trim(),
        })),
      });
    } else if (isArticle) {
      lessonMutation.mutate({
        ...base,
        articleContent: formData.articleContent, // غيّر الاسم لو الباك اند مستني اسم تاني
      });
    } else {
      lessonMutation.mutate({
        ...base,
        video: { url: formData.vUrl.trim(), provider: "youTube" },
      });
    }
  };

  // ---- Quiz helpers ----
  const updateQuestion = (qIndex, updater) =>
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === qIndex ? updater(q) : q)),
    }));

  const addQuestion = () =>
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion()],
    }));

  const removeQuestion = (qIndex) =>
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex),
    }));

  const removeOption = (qIndex, oIndex) =>
    updateQuestion(qIndex, (q) => ({
      ...q,
      options: q.options.filter((_, oi) => oi !== oIndex),
      correctIndex:
        q.correctIndex === oIndex
          ? 0
          : q.correctIndex > oIndex
            ? q.correctIndex - 1
            : q.correctIndex,
    }));

  // ---- Derived UI ----
  const articleWordCount = formData.articleContent.trim()
    ? formData.articleContent.trim().split(/\s+/).length
    : 0;

  const youTubeInvalid = Boolean(formData.vUrl) && !getYouTubeId(formData.vUrl);

  const typeChecklistItem = isQuiz
    ? {
        label: "أسئلة الكويز",
        done: formData.questions.every(
          (q) => q.text.trim() && q.options.every((op) => op.trim()),
        ),
      }
    : isArticle
      ? { label: "محتوى المقال", done: !!formData.articleContent.trim() }
      : { label: "لينك اليوتيوب", done: !!getYouTubeId(formData.vUrl) };

  const checklist = [
    { label: `عنوان ال${text.label}`, done: !!formData.title.trim() },
    typeChecklistItem,
  ];

  const generateButton = (
    <Button
      type="button"
      fullWidth
      disabled={generateMutation.isPending}
      startIcon={
        generateMutation.isPending ? (
          <CircularProgress size={18} color="inherit" />
        ) : (
          <AutoAwesomeIcon />
        )
      }
      onClick={() => setOpenGenerateDialog(true)}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: "10px" }}
    >
      {generateMutation.isPending
        ? `جاري توليد ال${text.label}...`
        : `توليد ${text.label} تلقائي`}
    </Button>
  );

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          p: { xs: 2, md: 4 },
        }}
      >
        {/* Top bar */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", mb: 3 }}
        >
          <IconButton
            aria-label="رجوع"
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
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
              {`رفع ${text.label} جديد`}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              {text.hint}
            </Typography>
          </Box>
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
            <Box sx={{ ...cardSx, mb: 3 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 2.5 }}>
                المعلومات الأساسية
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label={`عنوان ال${text.label}`}
                  placeholder="مثال: مقدمة في React"
                  value={formData.title}
                  onChange={(e) => setField("title", e.target.value)}
                  sx={fieldSx}
                />

                <Stack direction="row" spacing={2}>
                  <FormControl fullWidth sx={fieldSx}>
                    <InputLabel>نوع الدرس</InputLabel>
                    <Select
                      value={formData.type}
                      label="نوع الدرس"
                      onChange={(e) => setField("type", e.target.value)}
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
                    onChange={(e) => setField("order", Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 1 } }}
                    sx={fieldSx}
                  />
                </Stack>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isFree}
                      onChange={(e) => setField("isFree", e.target.checked)}
                    />
                  }
                  label="درس مجاني (متاح للجميع)"
                />
              </Stack>
            </Box>

            {/* Article editor */}
            {isArticle && (
              <>
                {generateButton}
                <Box sx={{ ...cardSx, my: 3 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 2.5 }}>
                    محتوى المقال
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={12}
                    label="نص المقال"
                    placeholder="اكتب محتوى المقال هنا..."
                    value={formData.articleContent}
                    onChange={(e) => setField("articleContent", e.target.value)}
                    sx={fieldSx}
                  />
                </Box>
              </>
            )}

            {/* Quiz builder */}
            {isQuiz && (
              <>
                {generateButton}
                <Box sx={{ ...cardSx, my: 3 }}>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
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
                      <QuestionEditor
                        key={qIndex}
                        question={q}
                        index={qIndex}
                        canRemove={formData.questions.length > 1}
                        onRemove={() => removeQuestion(qIndex)}
                        onText={(value) =>
                          updateQuestion(qIndex, (x) => ({ ...x, text: value }))
                        }
                        onOptionText={(oIndex, value) =>
                          updateQuestion(qIndex, (x) => ({
                            ...x,
                            options: x.options.map((op, i) =>
                              i === oIndex ? value : op,
                            ),
                          }))
                        }
                        onAddOption={() =>
                          updateQuestion(qIndex, (x) => ({
                            ...x,
                            options: [...x.options, ""],
                          }))
                        }
                        onRemoveOption={(oIndex) =>
                          removeOption(qIndex, oIndex)
                        }
                        onCorrect={(oIndex) =>
                          updateQuestion(qIndex, (x) => ({
                            ...x,
                            correctIndex: oIndex,
                          }))
                        }
                      />
                    ))}
                  </Stack>
                </Box>
              </>
            )}
          </Box>

          {/* ---------------- Sidebar ---------------- */}
          <Box sx={{ width: { xs: "100%", lg: 340 }, flexShrink: 0 }}>
            {isVideo && (
              <Box sx={{ ...cardSx, p: 2.5, mb: 3 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1.5 }}>
                  فيديو الدرس
                </Typography>
                <TextField
                  fullWidth
                  label="لينك يوتيوب"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.vUrl}
                  onChange={(e) => setField("vUrl", e.target.value)}
                  error={youTubeInvalid}
                  helperText={youTubeInvalid ? "لينك يوتيوب غير صالح" : " "}
                  sx={fieldSx}
                />
              </Box>
            )}

            {isQuiz && (
              <Box sx={{ ...cardSx, p: 2.5, mb: 3 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1.5 }}>
                  ملخص الكويز
                </Typography>
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  عدد الأسئلة: {formData.questions.length}
                </Typography>
              </Box>
            )}

            {isArticle && (
              <Box sx={{ ...cardSx, p: 2.5, mb: 3 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1.5 }}>
                  ملخص المقال
                </Typography>
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  عدد الكلمات: {articleWordCount}
                </Typography>
              </Box>
            )}

            {/* Publish checklist */}
            <Box sx={{ ...cardSx, p: 2.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1.5 }}>
                قبل النشر
              </Typography>
              <Stack spacing={1}>
                {checklist.map((item) => (
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
                disabled={lessonMutation.isPending}
                fullWidth
                variant="contained"
                startIcon={
                  lessonMutation.isPending ? (
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
                {lessonMutation.isPending ? "جاري النشر..." : text.publish}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ---------------- Generate dialog ---------------- */}
      <Dialog
        open={openGenerateDialog}
        onClose={() => setOpenGenerateDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>توليد محتوى تلقائي</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {isQuiz && (
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
                slotProps={{ htmlInput: { min: 1, max: 20 } }}
              />
            )}

            {isArticle && (
              <TextField
                label="تعليمات المقال"
                fullWidth
                multiline
                minRows={3}
                maxRows={10}
                value={quizSettings.articleInstructions}
                onChange={(e) =>
                  setQuizSettings((prev) => ({
                    ...prev,
                    articleInstructions: e.target.value,
                  }))
                }
              />
            )}

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                اختر الدروس التي تريد أن يعتمد عليها المحتوى
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {lessonsData
                  .filter((lesson) => lesson.video?.text)
                  .map((lesson) => {
                    const selected = selectedLessonIds.includes(lesson._id);
                    return (
                      <Chip
                        key={lesson._id}
                        label={lesson.title}
                        clickable
                        color={selected ? "primary" : "default"}
                        variant={selected ? "filled" : "outlined"}
                        onClick={() => toggleLesson(lesson._id)}
                      />
                    );
                  })}
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                تم اختيار {selectedLessons.length} درس
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenGenerateDialog(false)}>إلغاء</Button>
          <Button
            variant="contained"
            disabled={generateMutation.isPending || !lessonContent}
            startIcon={<AutoAwesomeIcon />}
            onClick={handleGenerate}
          >
            {isQuiz ? "توليد الكويز" : "توليد المقال"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
