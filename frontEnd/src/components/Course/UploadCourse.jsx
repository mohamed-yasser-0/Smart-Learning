import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CloudUploadRounded from "@mui/icons-material/CloudUploadRounded";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

const MAX_IMAGE_MB = 5;

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

// الـ instructor ممكن يرجع string أو object ({ name, image }) حسب الـ backend
const getInstructorName = (instructor) =>
  typeof instructor === "string" ? instructor : (instructor?.name ?? "");

export default function UploadCourse({ activeCourse, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(activeCourse);

  const [form, setForm] = useState({
    title: activeCourse?.title ?? "",
    description: activeCourse?.description ?? "",
    category: activeCourse?.category ?? "",
    level: activeCourse?.level ?? "",
    instructor: getInstructorName(activeCourse?.instructor),
    price: activeCourse?.price ?? 0,
    status: activeCourse?.status ?? "draft",
  });

  // الملف الحقيقي (للرفع) منفصل عن رابط المعاينة (للعرض بس)
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(activeCourse?.thumbnail ?? null);

  useEffect(() => {
    if (!thumbnailFile) return;
    const url = URL.createObjectURL(thumbnailFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url); // تنضيف الذاكرة
  }, [thumbnailFile]);

  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // لو الصفحة مفتوحة جوه CourseLibrary بنقفلها بـ onClose، غير كده بنرجع لـ /courses
  const close = () => (onClose ? onClose() : navigate("/courses"));

  const courseMutation = useMutation({
    mutationFn: async (body) => {
      const res = await api.request({
        method: isEdit ? "patch" : "post",
        url: `/api/courses/${isEdit ? activeCourse._id : ""}`,
        data: body, // FormData: axios بيظبط الـ multipart boundary لوحده
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(isEdit ? "تم حفظ التعديلات" : "تم رفع الكورس بنجاح");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      close();
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

  const handleThumbnail = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // عشان نقدر نختار نفس الملف تاني
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("اختار ملف صورة فقط");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`حجم الصورة لازم يكون أقل من ${MAX_IMAGE_MB}MB`);
      return;
    }
    setThumbnailFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("اكمل الحقول الأساسية الأول");
      return;
    }

    const body = new FormData();
    body.append("title", form.title.trim());
    body.append("description", form.description.trim());
    body.append("instructor", form.instructor.trim());
    body.append("price", form.price);
    body.append("status", form.status);
    // القيم الفاضية مش بتتبعت عشان ما تكسرش validation الـ enum في الـ backend
    if (form.category) body.append("category", form.category);
    if (form.level) body.append("level", form.level);

    // الصورة: ملف جديد لو اتغيرت، وإلا الرابط القديم عند التعديل (مش الاتنين مع بعض)
    if (thumbnailFile) {
      body.append("thumbnail", thumbnailFile);
    } else if (isEdit && activeCourse.thumbnail) {
      body.append("thumbnail", activeCourse.thumbnail);
    }

    courseMutation.mutate(body);
  };

  const checklist = [
    {
      label: "عنوان ووصف الكورس",
      done: !!form.title.trim() && !!form.description.trim(),
    },
    { label: "صورة الغلاف", done: !!previewUrl },
    { label: "اسم المدرب", done: !!form.instructor.trim() },
  ];

  return (
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
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 3 }}>
        <IconButton
          aria-label="رجوع"
          onClick={close}
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
            {isEdit ? "تعديل الكورس" : "رفع كورس جديد"}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {isEdit
              ? "اكتب معلومات الكورس بعدين اضغط حفظ"
              : "اكتب معلومات الكورس بعدين اضغط نشر"}
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
            <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 2.5 }}>
              المعلومات الأساسية
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="عنوان الكورس"
                placeholder="مثال: React & TypeScript Mastery"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                sx={fieldSx}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="وصف الكورس"
                placeholder="اشرح باختصار محتوى الكورس والمهارات اللي هيتعلمها الطالب"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                sx={fieldSx}
              />

              <TextField
                fullWidth
                label="اسم المدرب"
                placeholder="مثال: Ahmed Ali"
                value={form.instructor}
                onChange={(e) => setField("instructor", e.target.value)}
                sx={fieldSx}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={form.status === "published"}
                    onChange={(e) =>
                      setField("status", e.target.checked ? "published" : "draft")
                    }
                  />
                }
                label={form.status === "published" ? "منشور" : "غير منشور"}
              />
            </Stack>
          </Box>
        </Box>

        {/* ---------------- Sidebar ---------------- */}
        <Box sx={{ width: { xs: "100%", lg: 340 }, flexShrink: 0 }}>
          {/* Thumbnail */}
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
            <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1.5 }}>
              صورة الغلاف
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
                backgroundImage: previewUrl ? `url(${previewUrl})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleThumbnail}
              />
              {!previewUrl && (
                <>
                  <CloudUploadRounded
                    sx={{ fontSize: 30, color: "text.disabled" }}
                  />
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    اضغط لرفع صورة
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* Checklist + submit */}
          <Box
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "18px",
              p: 2.5,
            }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1.5 }}>
              {isEdit ? "احفظ التعديلات" : "تأكد من إكمال الخطوات"}
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
              disabled={courseMutation.isPending}
              fullWidth
              variant="contained"
              startIcon={
                courseMutation.isPending ? (
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
              {courseMutation.isPending
                ? isEdit
                  ? "جاري الحفظ..."
                  : "جاري النشر..."
                : isEdit
                  ? "حفظ التعديلات"
                  : "نشر الكورس"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}