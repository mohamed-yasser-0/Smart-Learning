import React, { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  IconButton,
  InputBase,
  LinearProgress,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CloudUploadRounded from "@mui/icons-material/CloudUploadRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import UploadCourse from "./UploadCourse";
import ConfirmDialog from "../DeleteCourseDialog";

// ---------------------------------------------------------------------------
// API — keep the base URL in .env:  VITE_API_URL=https://your-api.example.com
// ---------------------------------------------------------------------------
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TABS = ["My Courses", "All Courses"];

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    return token ? jwtDecode(token) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function CoursesSkeleton() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
        gap: 3,
      }}
    >
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Box key={item}>
          <Skeleton variant="rounded" height={200} animation="wave" />
          <Skeleton variant="text" width="80%" height={35} animation="wave" />
          <Skeleton variant="text" width="50%" height={25} animation="wave" />
        </Box>
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Course card
// ---------------------------------------------------------------------------
function CourseCard({ course, isOwner, onEdit, onDelete, onOpen }) {
  const instructorName = course.instructor?.name || "Instructor";

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        transition: "border-color .2s, transform .2s",
        "&:hover": {
          borderColor: "rgba(255,255,255,0.22)",
          transform: "translateY(-3px)",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={course.thumbnail}
          alt={course.title}
          loading="lazy"
          sx={{ height: 180, objectFit: "cover" }}
        />
        {/* gradient overlay for button legibility */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        {isOwner && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ position: "absolute", top: 12, right: 12 }}
          >
            <IconButton
              aria-label="Edit course"
              onClick={() => onEdit(course)}
              size="small"
              sx={{
                bgcolor: "rgba(10,14,39,0.6)",
                color: "#fff",
                width: 34,
                height: 34,
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.12)",
                "&:hover": { bgcolor: "rgba(10,14,39,0.85)" },
              }}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Delete course"
              onClick={() => onDelete(course)}
              size="small"
              sx={{
                bgcolor: "rgba(10,14,39,0.6)",
                color: "#ff6b6b",
                width: 34,
                height: 34,
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.12)",
                "&:hover": { bgcolor: "rgba(10,14,39,0.85)" },
              }}
            >
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          p: 2.5,
          "&:last-child": { pb: 2.5 },
        }}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
            color="#fff"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
              mb: 0.75,
            }}
          >
            {course.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.6,
            }}
          >
            {course.description}
          </Typography>
        </Box>

        {/* Instructor + date */}
        <Stack
          direction="row"
          sx={{
            mt: "auto",
            pt: 1.5,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            minWidth={0}
            sx={{ alignItems: "center" }}
          >
            <Avatar
              src={course.instructor?.image}
              alt={instructorName}
              sx={{ width: 28, height: 28, fontSize: 13 }}
            >
              {instructorName.charAt(0)}
            </Avatar>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              {instructorName}
            </Typography>
          </Stack>

          {course.createdAt && (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                color: "text.secondary",
                flexShrink: 0,
                alignItems: "center",
                ml: "auto",
              }}
            >
              <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption">
                {formatDate(course.createdAt)}
              </Typography>
            </Stack>
          )}
        </Stack>

        {typeof course.progress === "number" ? (
          <Box>
            <Stack
              direction="row"
              sx={{ mb: 0.75, justifyContent: "space-between" }}
            >
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                Progress
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color: course.progressColor || "primary.main" }}
              >
                {course.progress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={course.progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.08)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: course.progressColor || "primary.main",
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        ) : (
          <Button
            fullWidth
            variant="contained"
            disableElevation
            onClick={() => onOpen(course._id)}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              py: 1.1,
              borderRadius: 2,
            }}
          >
            Enroll now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function CourseLibrary() {
  // ---- All hooks live at the top, before any early return ----
  const [showUploadCourse, setShowUploadCourse] = useState(false);
  const [tab, setTab] = useState(0);
  const [activeCourse, setActiveCourse] = useState(null);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const user = useMemo(getUserFromToken, []);
  const userId = user?.id ?? user?._id;

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/api/courses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("تم حذف الكورس بنجاح");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "فشل حذف الكورس");
    },
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["courses", tab],
    queryFn: async () => {
      const endpoint = tab === 0 ? "mycourses" : "";
      const res = await api.get(`/api/courses/${endpoint}`);
      return res.data;
    },
  });

  const courses = data?.data?.course ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return courses.filter((c) => c.title?.toLowerCase().includes(term));
  }, [courses, search]);

  const handleEdit = (course) => {
    setActiveCourse(course);
    setShowUploadCourse(true);
  };

  const handleDelete = (course) => {
    setSelectedCourse(course);
    setDialogOpen(true);
  };

  const isOwner = (course) => {
    const ownerId = course.userId?._id ?? course.userId;
    return Boolean(userId) && ownerId === userId;
  };

  // ---- Render ----
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 5 }}>
      {showUploadCourse ? (
        <>
          <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2 }}>
            <IconButton
              aria-label="Close"
              onClick={() => {
                setShowUploadCourse(false);
                setActiveCourse(null);
              }}
              size="small"
              sx={{
                position: "absolute",
                top: { xs: 140, sm: 140, md: 80 },
                mx: 2,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "10px",
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <UploadCourse activeCourse={activeCourse} />
        </>
      ) : (
        <Container maxWidth="lg">
          {/* Header */}
          <Typography variant="h4" fontWeight={800}>
            Course Library
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mt: 0.5, mb: 3 }}
          >
            {isLoading ? "Loading courses..." : `${filtered.length} courses`}
          </Typography>

          {/* Tabs + upload button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                border: "1px solid #7777775e",
                borderRadius: 999,
                p: 0.5,
              }}
            >
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  minHeight: 0,
                  "& .MuiTabs-indicator": { display: "none" },
                }}
              >
                {TABS.map((label, i) => (
                  <Tab
                    key={label}
                    label={label}
                    disableRipple
                    sx={{
                      minHeight: 0,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 999,
                      px: 2.5,
                      py: 1,
                      mr: 1,
                      color: tab === i ? "#fff" : "#8B93B8",
                      bgcolor: tab === i ? "#7C6BF0" : "transparent",
                      "&.Mui-selected": { color: "#fff" },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            <Button
              variant="contained"
              aria-label="رفع كورس جديد"
              onClick={() => navigate("/UploadCourse")}
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
              {!isMobile && "رفع كورس جديد"}
            </Button>
          </Box>

          {/* Search */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "background.paper",
              border: "1px solid #7777776c",
              borderRadius: 2,
              px: 2,
              py: 1,
              mb: 4,
            }}
          >
            <SearchIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
            <InputBase
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              inputProps={{ "aria-label": "Search courses" }}
              sx={{ color: "text.primary", flexGrow: 1, fontSize: 15 }}
            />
          </Box>

          {/* Content */}
          {isLoading ? (
            <CoursesSkeleton />
          ) : isError ? (
            <Alert severity="error">
              حصل خطأ: {error.response?.data?.message || error.message}
            </Alert>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
              <Typography variant="h6">
                {search ? "مفيش كورسات مطابقة للبحث" : "مفيش كورسات لسه"}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 3,
              }}
            >
              {filtered.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  isOwner={isOwner(course)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onOpen={(id) => navigate(`/courses/${id}`)}
                />
              ))}
            </Box>
          )}
        </Container>
      )}

      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="حذف الكورس"
        message={`هل أنت متأكد أنك تريد حذف الكورس "${selectedCourse?.title}"؟`}
        confirmText="حذف"
        confirmColor="error"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(selectedCourse._id);
          setDialogOpen(false);
        }}
      />
    </Box>
  );
}