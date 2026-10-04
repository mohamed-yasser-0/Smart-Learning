import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  InputBase,
  IconButton,
  Chip,
  Card,
  CardMedia,
  CardContent,
  LinearProgress,
  Button,
  Stack,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { CloudUploadRounded } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import UploadCourse from "./UploadCourse";
import { useNavigate } from "react-router-dom";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ConfirmDialog from "../DeleteCourseDialog";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
// ---------------------------------------------------------------------------
// Theme — dark navy background matching the reference design
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Category badge colors
// ---------------------------------------------------------------------------
const CATEGORY_COLORS = {
  "Data Science": { bg: "rgba(124,107,240,0.22)", color: "#B7ACFF" },
  Frontend: { bg: "rgba(45,212,191,0.18)", color: "#5EEAD4" },
  Backend: { bg: "rgba(52,211,153,0.18)", color: "#6EE7B7" },
  Design: { bg: "rgba(196,181,253,0.20)", color: "#D8CCFF" },
};

const LEVEL_STYLE = { bg: "rgba(255,255,255,0.08)", color: "#B7BDD6" };

// ---------------------------------------------------------------------------
// Mock course data (mirrors the screenshot)
// ---------------------------------------------------------------------------

const FILTERS = ["All", "Data Science", "Frontend", "Backend", "Design"];

// ---------------------------------------------------------------------------
// Course card
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function CourseLibrary() {
  const [showUploadCourse, setShowUploadCourse] = useState(false);
  const [tab, setTab] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCourse, setActiveCourse] = useState(null);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const token = localStorage.getItem("token");
  const user = jwtDecode(token);
  console.log("user", user);
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(
        `https://smart-learning-git-main-mohamed-yasser-0s-projects.vercel.app/api/courses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return res.data;
    },

    onSuccess: () => {
      toast.success("تم حذف الكورس بنجاح");
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
    },
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["courses", tab],

    queryFn: async () => {
      const endpoint = tab === 0 ? "mycourses" : "";

      const res = await axios.get(
        `https://smart-learning-git-main-mohamed-yasser-0s-projects.vercel.app/api/courses/${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return res.data;
    },
  });
  const courses = data?.data?.course;

  if (isLoading) {
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
  if (isError) return <p>حصل خطأ: {error.message}</p>;
  const queryClient = useQueryClient();

  const filtered = courses.filter((c) => {
    const matchesFilter = activeFilter;
    // ||
    // c.category === activeFilter ||
    // c.title === activeFilter;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const catStyle = CATEGORY_COLORS[activeCourse?.category] || LEVEL_STYLE;
  const date = activeCourse?.createdAt
    ? new Date(activeCourse.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 5 }}>
      {showUploadCourse ? (
        <>
          <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2 }}>
            <IconButton
              onClick={() => setShowUploadCourse(false)}
              size="small"
              sx={{
                position: "absolute",
                top: {
                  xs: 140,
                  sm: 140,
                  md: 80,
                },
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
            6 courses across Data Science, Frontend, Backend & Design
          </Typography>
          {/* Tabs */}
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
                {["My Courses", "All Courses"].map((label, i) => (
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

          {/* Search + filters */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 4, flexWrap: "wrap", rowGap: 1.5, alignItems: "center" }}
          >
            <Box
              sx={{
                flexGrow: 1,
                minWidth: 240,
                display: "flex",
                alignItems: "center",
                bgcolor: "background.paper",
                border: "1px solid #7777776c",
                borderRadius: 2,
                px: 2,
                py: 1,
              }}
            >
              <SearchIcon
                sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
              />
              <InputBase
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ color: "text.primary", flexGrow: 1, fontSize: 15 }}
              />
            </Box>

            <IconButton
              sx={{
                bgcolor: "background.paper",
                border: "1px solid #7777778f",
                borderRadius: 2,
                color: "text.primary",
              }}
            >
              <TuneIcon fontSize="small" />
            </IconButton>
          </Stack>
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
              <Card
                key={course._id}
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

                  {course.hasPlay && (
                    <IconButton
                      aria-label="Play preview"
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        width: 42,
                        height: 42,
                        bgcolor: course.playColor || "primary.main",
                        color: "#0A0E27",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
                        "&:hover": {
                          bgcolor: course.playColor || "primary.main",
                          opacity: 0.9,
                        },
                      }}
                    >
                      <PlayArrowRoundedIcon />
                    </IconButton>
                  )}

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ position: "absolute", top: 12, right: 12 }}
                  >
                    <IconButton
                      aria-label="Edit course"
                      onClick={() => {
                        setShowUploadCourse(true);
                        setActiveCourse(course);
                      }}
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
                      onClick={() => {
                        setSelectedCourse(course);
                        setDialogType("delete");
                        setDialogOpen(true);
                      }}
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
                  {/* صاحب الكورس + التاريخ */}
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
                        alt={course.instructor?.name}
                        sx={{ width: 28, height: 28, fontSize: 13 }}
                      >
                        {course.instructor?.name?.charAt(0)}
                      </Avatar>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {course.instructor?.name || "Instructor"}
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
                          {new Date(course.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
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
                          sx={{ color: course.progressColor }}
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
                            bgcolor: course.progressColor,
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
                      onClick={() => navigate(`/courses/${course._id}`)}
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
            ))}
          </Box>
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
