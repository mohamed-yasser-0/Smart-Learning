import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material";
import {
  AccessTime,
  MenuBook,
  EmojiEvents,
  LocalFireDepartment,
  TrendingUp,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Exact data from the image
const weeklyData = [
  { day: "Mon", hours: 48 },
  { day: "Tue", hours: 90 },
  { day: "Wed", hours: 32 },
  { day: "Thu", hours: 120 },
  { day: "Fri", hours: 75 },
  { day: "Sat", hours: 60 },
  { day: "Sun", hours: 105 },
];

const subjects = [
  { name: "AI", value: 78, color: "#7C4DFF" },
  { name: "React", value: 92, color: "#B388FF" },
  { name: "ML", value: 88, color: "#00E5FF" },
  { name: "Python", value: 65, color: "#69F0AE" },
];

const continueLearning = [
  {
    tag: "Data Science",
    tagColor: "#00BCD4",
    title: "Machine Learning Fundamentals",
    next: "Next: Decision Trees & Random Forests",
    progress: 68,
    barColor: "#7C4DFF",
  },
  {
    tag: "Frontend",
    tagColor: "#2196F3",
    title: "React & TypeScript Mastery",
    next: "Next: Custom Hooks Patterns",
    progress: 42,
    barColor: "#00BCD4",
  },
  {
    tag: "Backend",
    tagColor: "#4CAF50",
    title: "Python for Data Analysis",
    next: "Next: Advanced Pandas Operations",
    progress: 91,
    barColor: "#00E676",
  },
];

// Multi-ring progress (exact style from the image)
const MultiRingProgress = () => {
  const size = 130;
  const stroke = 9;
  const gap = 4; // المسافة بين الحلقات

  const rings = [
    { value: 78, color: "#7C4DFF" }, // AI
    { value: 92, color: "#B388FF" }, // React
    { value: 88, color: "#00E5FF" }, // ML
    { value: 65, color: "#69F0AE" }, // Python
  ];

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        mx: "auto",
        mb: 2.5,
      }}
    >
      <svg width={size} height={size}>
        {/* Background rings */}
        {rings.map((_, i) => {
          const r = size / 2 - stroke / 2 - i * (stroke + gap);
          return (
            <circle
              key={`bg-${i}`}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="#77777777"
              strokeWidth={stroke}
            />
          );
        })}

        {/* Progress rings */}
        {rings.map((ring, i) => {
          const r = size / 2 - stroke / 2 - i * (stroke + gap);
          const circumference = 2 * Math.PI * r;
          const offset = circumference * (1 - ring.value / 100);

          return (
            <circle
              key={`progress-${i}`}
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
          );
        })}
      </svg>
    </Box>
  );
};

const StatCard = ({ icon, value, label, iconBg }) => (
  <Card
    sx={{
      bgcolor: "background.paper",
      borderRadius: "16px",
      border: "1px solid #252B45",
      boxShadow: "none",
      height: "100%",
      transition: "0.3s",
      "&:hover": {
        borderColor: iconBg,
        transform: "translateY(-2px)",
      },
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
          color: iconBg,
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
        <Typography
          sx={{ fontSize: "0.8rem", color: "text.secondary", mt: 0.3 }}
        >
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default function Home() {
  
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://smart-learning-production-61a2.up.railway.app/api/progress/6a5dae4f0a086d8462075f0c",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.data;
    },
  });
  // const { data:Coursedata, isLoading:isLoadingCourse, isError:isErrorCourse, error:errorCourse, refetch:refetchCourse } = useQuery({
  //   queryKey: ["users"],
  //   queryFn: async () => {
  //     const res = await axios.get(
  //       "https://smart-learning-production-61a2.up.railway.app/api/courses",
  //     );
  //     return res.data;
  //   },
  // });
  // const courses = Coursedata?.data?.course;
  // console.log(courses);
  // if (isLoadingCourse) return <p>جاري التحميل...</p>;
  // if (isErrorCourse) return <p>حصل خطأ: {error.message}</p>;


  console.log(data?.data?.progres);
  const day = data?.data?.progres.map((e) => ({
    day: new Date(e?.createdAt).toLocaleDateString("en-US", {
      weekday: "short",
    }),
    hours: e?.duration,
  }));

  console.log(day);
  const progress = data?.data?.progres;
  const sub = progress?.reduce((acc, e) => acc + e.duration, 0);
  // if (isError) return <p>حصل خطأ: {error.message}</p>;
  const score = data?.data?.progres?.reduce(
    (total, score) => total + (score?.quizScore[2] || 0),
    0,
  );
  const quiz =
    data?.data?.progres?.filter((e) => e?.quizScore?.length > 0) || [];

  const lessons =
    data?.data?.progres?.filter((e) => !e?.quizScore?.length) || [];
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.defult",
        p: { xs: 2, md: 3.5 },
        px: { xs: 2, lg: 20 },
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ========== HEADER ========== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3.5,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "text.primary",
              fontSize: { xs: "1.6rem", md: "1.85rem" },
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Good morning, {} 👋
          </Typography>
          <Typography
            sx={{ fontSize: "0.95rem", color: "text.secondary", mt: 0.6 }}
          >
            You're on a 23-day streak. Keep it up — 3 lessons to your next
            milestone.
          </Typography>
        </Box>

        <Chip
          icon={
            <TrendingUp sx={{ fontSize: 18, color: "#00E676 !important" }} />
          }
          label="Top 12% this week"
          sx={{
            bgcolor: "rgba(0, 230, 118, 0.08)",
            color: "#00E676",
            border: "1px solid rgba(0, 230, 118, 0.25)",
            fontWeight: 600,
            fontSize: "0.8rem",
            height: 34,
            px: 0.5,
            borderRadius: "20px",
          }}
        />
      </Box>

      {/* ========== STATS ========== */}
      <Grid container spacing={2} mb={3.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<AccessTime sx={{ fontSize: 22 }} />}
            value={`${Math.round(sub/60) ?? 0} hrs`}
            label="Hours Learned"
            iconBg="#3F51B5"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<MenuBook sx={{ fontSize: 22 }} />}
            value={lessons?.length || 0}
            label="Lessons Completed"
            iconBg="#00ACC1"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<EmojiEvents sx={{ fontSize: 22 }} />}
            value={(Math.round(score / quiz?.length) || 0) + "%"}
            label="Quiz Score Avg"
            iconBg="#9C27B0"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<LocalFireDepartment sx={{ fontSize: 22 }} />}
            value="1 days"
            label="Day Streak"
            iconBg="#FF9800"
          />
        </Grid>
      </Grid>

      {/* ========== CHARTS ========== */}
      <Grid container spacing={2.5} sx={{ my: 4 }}>
        {/* Weekly Study Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              bgcolor: "background.paper",
              borderRadius: "16px",
              border: "1px solid #252B45",
              boxShadow: "none",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography sx={{ fontSize: "1.05rem", fontWeight: 600 }}>
                  Weekly Study Activity
                </Typography>
                <Typography
                  sx={{ fontSize: "0.8rem", color: "text.secondary" }}
                >
                  Jun 9 – 15, 2026
                </Typography>
              </Box>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={day}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorHours"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#7C4DFF"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#7C4DFF"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#252B45"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#8B92B0", fontSize: 13 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#8B92B0", fontSize: 13 }}
                      domain={[0, 130]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#161B2E",
                        border: "1px solid #252B45",
                        color: "#ffffffe5",
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

        {/* Subject Mastery */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              bgcolor: "backgorund.paper",
              borderRadius: "16px",
              border: "1px solid #252B45",
              boxShadow: "none",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: "1.05rem", fontWeight: 600, mb: 2 }}>
                Subject Mastery
              </Typography>

              {/* الحلقات المحسّنة */}
              <MultiRingProgress />
              {/* Legend */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                {[
                  { name: "--", value: 78, color: "#7C4DFF" },
                  { name: "--", value: 88, color: "#00E5FF" },
                  { name: "--", value: 92, color: "#B388FF" },
                  { name: "--", value: 65, color: "#69F0AE" },
                ].map((s) => (
                  <Box
                    key={s.name}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                        sx={{ fontSize: "0.85rem", color: "text.secondary" }}
                      >
                        {s.name}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {s.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ========== CONTINUE LEARNING ========== */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        sx={{
          color: "text.primary",
        }}
      >
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 600, mb: 2 }}>
          Continue Learning
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {continueLearning.map((item) => (
          <Grid size={{ xs: 12, md: 4 }} key={item.title}>
            <Card
              sx={{
                bgcolor: "backgorund.paper",
                borderRadius: "16px",
                border: "1px solid #252B45",
                boxShadow: "none",
                height: "100%",
                transition: "all 0.25s ease",
                "&:hover": {
                  borderColor: item.barColor,
                  transform: "translateY(-3px)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Chip
                  label={item.tag}
                  size="small"
                  sx={{
                    bgcolor: `${item.tagColor}18`,
                    color: item.tagColor,
                    fontWeight: 600,
                    fontSize: "0.72rem",
                    height: 24,
                    mb: 1.5,
                    borderRadius: "6px",
                  }}
                />
                <Typography
                  sx={{ fontSize: "1.05rem", fontWeight: 600, mb: 0.6 }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{ fontSize: "0.8rem", color: "text.secondary", mb: 2.2 }}
                >
                  {item.next}
                </Typography>

                <Box display="flex" justifyContent="space-between" mb={0.6}>
                  <Typography
                    sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                  >
                    Progress
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    {item.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.progress}
                  sx={{
                    height: 7,
                    borderRadius: 4,
                    bgcolor: "backgorund.paper",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: item.barColor,
                      borderRadius: 4,
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
