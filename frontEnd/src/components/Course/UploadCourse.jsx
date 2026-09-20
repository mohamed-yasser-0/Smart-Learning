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
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CloudUploadRounded from "@mui/icons-material/CloudUploadRounded";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const categories = ["Data Science", "Frontend", "Backend", "Design"];
const levels = ["Beginner", "Intermediate", "Advanced"];

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

export default function UploadCourse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [instructor, setInstructor] = useState("");
  const [price, setPrice] = useState(0);

  // ✅ نفصل الملف الحقيقي (للرفع) عن رابط المعاينة (للعرض بس)
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [modules, setModules] = useState([
    { id: 1, title: "Module 1", lessonsCount: 3 },
  ]);
  const navigate = useNavigate();

  const CourseMutation = useMutation({
    mutationFn: async (formData) => {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://smart-learning-production-61a2.up.railway.app/api/courses",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("تم رفع الكورس بنجاح");
      navigate("/courses");
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

  const courseHandleSubmit = (e) => {
    e.preventDefault();

    if (!title || !description || !category || !level) {
      toast.error("اكمل الحقول الأساسية الأول");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("instructor", instructor);
    formData.append("category", category);
    formData.append("level", level);
    formData.append("price", price);

    // ✅ بنبعت الملف الحقيقي مش رابط المعاينة
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    CourseMutation.mutate(formData);
  };

  const addModule = () =>
    setModules([
      ...modules,
      { id: Date.now(), title: `Module ${modules.length + 1}`, lessonsCount: 0 },
    ]);

  const removeModule = (id) => setModules(modules.filter((m) => m.id !== id));

  const handleThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file); // ده اللي هيتبعت للسيرفر
      setThumbnailPreview(URL.createObjectURL(file)); // ده للعرض بس
    }
  };

  return (
    <Box
      component="form"
      onSubmit={courseHandleSubmit}
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
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap" }}
      >
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.5}>
          <IconButton
            onClick={() => navigate("/courses")}
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
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: "text.primary" }}>
              رفع كورس جديد
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              اكتب معلومات الكورس بعدين اضغط نشر
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ mt: { xs: 2, md: 0 }, justifyContent: "center", alignItems: "center" }}
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
              "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
            }}
          >
            حفظ كمسودة
          </Button>

          <Button
            type="submit"
            disabled={CourseMutation.isPending}
            variant="contained"
            color="primary"
            startIcon={
              CourseMutation.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <RocketLaunchRounded fontSize="small" />
              )
            }
            sx={{ textTransform: "none", borderRadius: "10px", px: 3, fontWeight: 600 }}
          >
            {CourseMutation.isPending ? "جاري النشر..." : "نشر الكورس"}
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", lg: "row" } }}>
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
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary", mb: 2.5 }}>
              المعلومات الأساسية
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="عنوان الكورس"
                placeholder="مثال: React & TypeScript Mastery"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={fieldSx}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="وصف الكورس"
                placeholder="اشرح باختصار محتوى الكورس والمهارات اللي هيتعلمها الطالب"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={fieldSx}
              />

              <Stack direction="row" spacing={2}>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>التصنيف</InputLabel>
                  <Select value={category} label="التصنيف" onChange={(e) => setCategory(e.target.value)}>
                    {categories.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>المستوى</InputLabel>
                  <Select value={level} label="المستوى" onChange={(e) => setLevel(e.target.value)}>
                    {levels.map((l) => (
                      <MenuItem key={l} value={l}>
                        {l}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="اسم المدرب"
                  placeholder="مثال: Ahmed Ali"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  sx={fieldSx}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="السعر"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  sx={fieldSx}
                />
              </Stack>
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
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary", mb: 1.5 }}>
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
                backgroundImage: thumbnailPreview ? `url(${thumbnailPreview})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <input type="file" accept="image/*" hidden onChange={handleThumbnail} />
              {!thumbnailPreview && (
                <>
                  <CloudUploadRounded sx={{ fontSize: 30, color: "text.disabled" }} />
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    اضغط لرفع صورة
                  </Typography>
                </>
              )}
            </Box>
          </Box>

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
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary", mb: 1.5 }}>
              قبل النشر
            </Typography>
            <Stack spacing={1}>
              {[
                { label: "عنوان ووصف الكورس", done: !!title && !!description },
                { label: "التصنيف والمستوى", done: !!category && !!level },
                { label: "صورة الغلاف", done: !!thumbnailFile },
                { label: "موديول واحد على الأقل", done: modules.length > 0 },
              ].map((item) => (
                <Stack key={item.label} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: item.done ? "success.main" : "text.disabled",
                    }}
                  />
                  <Typography sx={{ fontSize: 13, color: item.done ? "text.primary" : "text.secondary" }}>
                    {item.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Button
              type="submit"
              disabled={CourseMutation.isPending}
              fullWidth
              variant="contained"
              color="primary"
              startIcon={
                CourseMutation.isPending ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <RocketLaunchRounded fontSize="small" />
                )
              }
              sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 600, py: 1.1 }}
            >
              {CourseMutation.isPending ? "جاري النشر..." : "نشر الكورس"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}