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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { CloudUploadRounded } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import UploadCourse from "./UploadCourse";
import { useNavigate } from "react-router-dom";

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
function CourseCard({ course }) {
  const catStyle = CATEGORY_COLORS[course.category] || LEVEL_STYLE;
  const date = course?.createdAt
    ? new Date(course.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  const navigate = useNavigate();

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={course.thumbnail}
          alt={course.title}
          sx={{ height: 170, objectFit: "cover" }}
        />
        {/* gradient overlay for badge legibility */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 40%)",
          }}
        />
        <Stack
          direction="row"
          spacing={1}
          sx={{ position: "absolute", top: 12, left: 12 }}
        >
          <Chip
            label={course.category}
            size="small"
            sx={{
              bgcolor: catStyle.bg,
              color: "text.secondary",
              fontWeight: 600,
              fontSize: 12,
              backdropFilter: "blur(4px)",
            }}
          />
          {/* <Chip
            label={course.level}
            size="small"
            sx={{
              bgcolor: LEVEL_STYLE.bg,
              color: LEVEL_STYLE.color,
              fontSize: 12,
              fontFamily: "monospace",
              backdropFilter: "blur(4px)",
            }}
          /> */}
        </Stack>
        {course.hasPlay && (
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              bottom: 12,
              right: 12,
              bgcolor: "red",
              color: "#0A0E27",
              width: 34,
              height: 34,
              "&:hover": { bgcolor: course.playColor, opacity: 0.9 },
            }}
          >
            <PlayArrowRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", pb: 2 }}
      >
        <Typography variant="h6" fontWeight={700} color="#fff" gutterBottom>
          {course.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 1.5, flexGrow: 1, color: "text.secondary" }}
        >
          {course.description}
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ mb: 1.5, color: "text.secondary" }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeRoundedIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption">{date}</Typography>
          </Stack>
          {/* <Stack direction="row" spacing={0.5} alignItems="center">
            <PeopleAltRoundedIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption">{course.students}</Typography>
          </Stack> */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <StarRoundedIcon sx={{ fontSize: 16, color: "#FBBF24" }} />
            <Typography
              variant="caption"
              sx={{ color: "text.secondary" }}
              fontWeight={600}
            >
              {course.price}
            </Typography>
          </Stack>
        </Stack>

        {typeof course.progress === "number" ? (
          <Box>
            <LinearProgress
              variant="determinate"
              value={course.progress}
              sx={{
                height: 5,
                borderRadius: 5,
                bgcolor: "rgba(255,255,255,0.08)",
                mb: 1,
                "& .MuiLinearProgress-bar": {
                  bgcolor: course.progressColor,
                  borderRadius: 5,
                },
              }}
            />
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                {course.instructor}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color: course.progressColor }}
              >
                {course.progress}%
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Button
            fullWidth
            onClick={() => navigate(`/courses/${course._id}`)}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 700,
              textTransform: "none",
              py: 1,
              "&:hover": { bgcolor: "primary.dark", opacity: 0.9 },
            }}
          >
            Enroll Now
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
  const [tab, setTab] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get(
        "https://smart-learning-production-61a2.up.railway.app/api/courses",
      );
      return res.data;
    },
  });
  const courses = data?.data?.course;
  console.log(courses);
  if (isLoading) return <p>جاري التحميل...</p>;
  if (isError) return <p>حصل خطأ: {error.message}</p>;

  const filtered = courses.filter((c) => {
    const matchesFilter =
      activeFilter === "All" ||
      c.category === activeFilter ||
      c.title === activeFilter;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 5 }}>
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
              {["All Courses", "My Courses"].map((label, i) => (
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
            <SearchIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
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

          {FILTERS.map((f) => (
            <Chip
              key={f}
              label={f}
              onClick={() => setActiveFilter(f)}
              sx={{
                bgcolor: activeFilter === f ? "#7C6BF0" : "background.paper",
                color:
                  activeFilter === f
                    ? "primary.contrastText"
                    : "text.secondary",
                border: activeFilter === f ? "none" : "1px solid #7777778f",
                fontWeight: 600,
                px: 1,
              }}
            />
          ))}
        </Stack>
        {/* Grid */}
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
            <CourseCard key={course.id} course={course} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
