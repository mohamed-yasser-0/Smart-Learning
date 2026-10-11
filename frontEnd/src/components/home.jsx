import React, { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Typography,
  useTheme,
} from "@mui/material";
import AccessTime from "@mui/icons-material/AccessTime";
import MenuBook from "@mui/icons-material/MenuBook";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import LocalFireDepartment from "@mui/icons-material/LocalFireDepartment";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { api } from "../api/client";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------
const COURSE_COLORS = ["#7C4DFF", "#00E5FF", "#B388FF", "#69F0AE"];
const MINUTES_PER_HOUR = 60; // افتراض: duration في الـ API بالدقايق

const cardSx = {
  bgcolor: "background.paper",
  borderRadius: "16px",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
  height: "100%",
};

function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    return token ? jwtDecode(token) : null;
  } catch {
    return null;
  }
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const toDayKey = (value) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

// عدد الأيام المتتالية اللي المستخدم خلّص فيها درس (اليوم أو لحد امبارح)
function calcStreak(progress) {
  const days = new Set(progress.map((p) => toDayKey(p.createdAt)));
  const cursor = new Date();
  if (!days.has(toDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// آخر 7 أيام (الأيام الفاضية بتظهر بصفر)
function buildWeeklyData(progress) {
  const minutesByDay = {};
  progress.forEach((p) => {
    const key = toDayKey(p.createdAt);
    minutesByDay[key] = (minutesByDay[key] ?? 0) + (p.duration ?? 0);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const hours = (minutesByDay[toDayKey(d)] ?? 0) / MINUTES_PER_HOUR;
    return {
      date: d,
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      hours: Math.round(hours * 10) / 10,
    };
  });
}

const formatShortDate = (d) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// ---------------------------------------------------------------------------
// Presentational components
// ---------------------------------------------------------------------------
function MultiRingProgress({ rings }) {
  const theme = useTheme();
  const size = 130;
  const stroke = 9;
  const gap = 4;

  return (
    <Box sx={{ width: size, height: size, mx: "auto", mb: 2.5 }}>
      <svg
        width={size}
        height={size}
        role="img"
        aria-label="Course progress rings"
      >
        {rings.map((ring, i) => {
          const r = size / 2 - stroke / 2 - i * (stroke + gap);
          const circumference = 2 * Math.PI * r;
          const offset = circumference * (1 - ring.value / 100);
          return (
            <g key={ring.label}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={theme.palette.divider}
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={ring.color}
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </g>
          );
        })}
      </svg>
    </Box>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <Card
      sx={{
        ...cardSx,
        transition: "0.3s",
        "&:hover": { borderColor: color, transform: "translateY(-2px)" },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          py: 2.2,
          px: 2.5,
          "&:last-child": { pb: 2.2 },
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            bgcolor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: "1.55rem",
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mt: 0.3 }}>
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Home() {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useMemo(getUserFromToken, []);

  // نفس مفتاح تاب "All Courses" في CourseLibrary عشان الكاش يتشارك
  const coursesQuery = useQuery({
    queryKey: ["courses", 1],
    queryFn: async () => (await api.get("/api/courses")).data,
  });

  const progressQuery = useQuery({
    queryKey: ["progress"],
    queryFn: async () => (await api.get("/api/progress")).data,
  });

  const courses = coursesQuery.data?.data?.course;
  const progress = progressQuery.data?.data?.progres;
  // ---- الإحصائيات ----
  const stats = useMemo(() => {
    const list = progress ?? [];
    const totalMinutes = list.reduce((sum, p) => sum + (p.duration ?? 0), 0);
    const quizzes = list.filter((p) => p.quizScore?.length > 0);
    const lessonsDone = list.filter((p) => !p.quizScore?.length);
    const quizTotal = quizzes.reduce((sum, p) => sum + (p.quizScore[2] ?? 0), 0);

    return {
      hours: Math.round((totalMinutes / MINUTES_PER_HOUR) * 10) / 10,
      lessons: lessonsDone.length,
      quizAvg: quizzes.length ? Math.round(quizTotal / quizzes.length) : 0,
      streak: calcStreak(list),
      weekly: buildWeeklyData(list),
    };
  }, [progress]);

  // ---- الكورسات اللي المستخدم بدأها (الأحدث نشاطاً أولاً) ----
  const started = useMemo(() => {
    if (!courses || !progress) return [];
    const orderedIds = [];
    [...progress]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((p) => {
        if (p.courseId && !orderedIds.includes(p.courseId))
          orderedIds.push(p.courseId);
      });
    return orderedIds
      .map((id) => courses.find((c) => c._id === id))
      .filter(Boolean)
      .slice(0, 4);
  }, [courses, progress]);

  // نفس مفتاح CourseLessons عشان الكاش يتشارك
  const lessonQueries = useQueries({
    queries: started.map((course) => ({
      queryKey: ["lessons", course._id],
      queryFn: async () => (await api.get(`/api/lessons/${course._id}`)).data,
    })),
  });

  const courseStats = started.map((course, i) => {
    const lessons = [...(lessonQueries[i]?.data?.data?.lesson ?? [])].sort(
      (a, b) => a.order - b.order,
    );
    const doneIds = new Set(
      (progress ?? [])
        .filter((p) => p.courseId === course._id)
        .map((p) => p.lessonId),
    );
    const percent = lessons.length
      ? Math.round((doneIds.size / lessons.length) * 100)
      : 0;
    const next = lessons.find((l) => !doneIds.has(l._id));

    return {
      course,
      percent: Math.min(percent, 100),
      color: COURSE_COLORS[i % COURSE_COLORS.length],
      nextText:
        percent >= 100
          ? "Course completed 🎉"
          : next
            ? `Next: ${next.title}`
            : "",
    };
  });

  const isLoading = coursesQuery.isLoading || progressQuery.isLoading;
  const isError = coursesQuery.isError || progressQuery.isError;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    const err = progressQuery.error ?? coursesQuery.error;
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          حصل خطأ: {err.response?.data?.message || err.message}
        </Alert>
      </Container>
    );
  }

  const weekStart = stats.weekly[0].date;
  const weekEnd = stats.weekly[stats.weekly.length - 1].date;
  const axisTick = { fill: theme.palette.text.secondary, fontSize: 13 };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* ========== HEADER ========== */}
        <Box sx={{ mb: 3.5 }}>
          <Typography
            component="h1"
            sx={{
              color: "text.primary",
              fontSize: { xs: "1.6rem", md: "1.85rem" },
              fontWeight: 700,
            }}
          >
            {getGreeting()}, {user?.username || "there"} 👋
          </Typography>
          <Typography sx={{ fontSize: "0.95rem", color: "text.secondary", mt: 0.6 }}>
            {stats.streak > 0
              ? `You're on a ${stats.streak}-day streak. Keep it up!`
              : "Complete a lesson today to start your streak."}
          </Typography>
        </Box>

        {/* ========== STATS ========== */}
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<AccessTime sx={{ fontSize: 22 }} />}
              value={`${stats.hours} hrs`}
              label="Hours Learned"
              color="#3F51B5"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<MenuBook sx={{ fontSize: 22 }} />}
              value={stats.lessons}
              label="Lessons Completed"
              color="#00ACC1"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<EmojiEvents sx={{ fontSize: 22 }} />}
              value={`${stats.quizAvg}%`}
              label="Quiz Score Avg"
              color="#9C27B0"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<LocalFireDepartment sx={{ fontSize: 22 }} />}
              value={`${stats.streak} ${stats.streak === 1 ? "day" : "days"}`}
              label="Day Streak"
              color="#FF9800"
            />
          </Grid>
        </Grid>

        {/* ========== CHARTS ========== */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {/* Weekly activity */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontSize: "1.05rem", fontWeight: 600 }}>
                    Weekly Study Activity
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                    {formatShortDate(weekStart)} – {formatShortDate(weekEnd)}
                  </Typography>
                </Box>
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.weekly}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C4DFF" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#7C4DFF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={axisTick}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={axisTick}
                        allowDecimals
                      />
                      <Tooltip
                        formatter={(value) => [`${value} hrs`, "Study time"]}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          color: theme.palette.text.primary,
                          borderRadius: 10,
                          fontSize: 13,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="hours"
                        stroke="#7C4DFF"
                        strokeWidth={3}
                        fill="url(#colorHours)"
                        dot={{ r: 5, fill: "#7C4DFF", strokeWidth: 0 }}
                        activeDot={{ r: 7 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Course progress rings */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: "1.05rem", fontWeight: 600, mb: 2 }}>
                  Course Progress
                </Typography>

                {courseStats.length === 0 ? (
                  <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                    Your course progress will show up here once you complete
                    your first lesson.
                  </Typography>
                ) : (
                  <>
                    <MultiRingProgress
                      rings={courseStats.map((s) => ({
                        label: s.course._id,
                        value: s.percent,
                        color: s.color,
                      }))}
                    />
                    <Box sx={{ display: "grid", gap: 1.2 }}>
                      {courseStats.map((s) => (
                        <Box
                          key={s.course._id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              minWidth: 0,
                            }}
                          >
                            <Box
                              sx={{
                                width: 9,
                                height: 9,
                                borderRadius: "50%",
                                bgcolor: s.color,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              noWrap
                              sx={{ fontSize: "0.85rem", color: "text.secondary" }}
                            >
                              {s.course.title}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                            {s.percent}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ========== CONTINUE LEARNING ========== */}
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 600, mb: 2 }}>
          Continue Learning
        </Typography>

        {courseStats.length === 0 ? (
          <Card sx={{ ...cardSx, height: "auto" }}>
            <CardContent sx={{ textAlign: "center", py: 5 }}>
              <Typography sx={{ color: "text.secondary", mb: 2 }}>
                You haven't started any course yet.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/courses")}
                sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 600 }}
              >
                Browse courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {courseStats.slice(0, 3).map((s) => (
              <Grid size={{ xs: 12, md: 4 }} key={s.course._id}>
                <Card
                  sx={{
                    ...cardSx,
                    transition: "all 0.25s ease",
                    "&:hover": {
                      borderColor: s.color,
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/courses/${s.course._id}`)}
                    sx={{ height: "100%" }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography
                        sx={{ fontSize: "1.05rem", fontWeight: 600, mb: 0.6 }}
                        noWrap
                      >
                        {s.course.title}
                      </Typography>
                      <Typography
                        noWrap
                        sx={{
                          fontSize: "0.8rem",
                          color: "text.secondary",
                          mb: 2.2,
                          minHeight: "1.2em",
                        }}
                      >
                        {s.nextText}
                      </Typography>

                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.6 }}>
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                          Progress
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {s.percent}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={s.percent}
                        sx={{
                          height: 7,
                          borderRadius: 4,
                          bgcolor: "divider",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: s.color,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}