import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  LinearProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0A0E27", paper: "#12173A" },
    primary: { main: "#7C6BF0" },
  },
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
  },
  shape: { borderRadius: 6 },
});

const PAPER_BORDER = "1px solid #7777779c";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const stats = [
  {
    icon: AccessTimeRoundedIcon,
    iconBg: "rgba(124,107,240,0.18)",
    iconColor: "#9B8CFF",
    value: "218",
    label: "Total Hours",
  },
  {
    icon: MenuBookRoundedIcon,
    iconBg: "rgba(52,211,153,0.18)",
    iconColor: "#34D399",
    value: "3",
    label: "Courses Done",
  },
  {
    icon: PsychologyRoundedIcon,
    iconBg: "rgba(124,107,240,0.18)",
    iconColor: "#9B8CFF",
    value: "86",
    label: "Quizzes Taken",
  },
  {
    icon: LocalFireDepartmentRoundedIcon,
    iconBg: "rgba(251,146,60,0.18)",
    iconColor: "#FB923C",
    value: "23d",
    label: "Best Streak",
  },
];

const studyHours = [
  { month: "Jan", hours: 22 },
  { month: "Feb", hours: 34 },
  { month: "Mar", hours: 26 },
  { month: "Apr", hours: 40 },
  { month: "May", hours: 47 },
  { month: "Jun", hours: 33 },
];

const quizScores = [
  { month: "Jan", score: 76 },
  { month: "Feb", score: 79 },
  { month: "Mar", score: 75 },
  { month: "Apr", score: 85 },
  { month: "May", score: 88 },
  { month: "Jun", score: 92 },
];

const skillBreakdown = [
  { skill: "Python", value: 90 },
  { skill: "React", value: 65 },
  { skill: "ML Concepts", value: 75 },
  { skill: "Data Viz", value: 55 },
  { skill: "Statistics", value: 60 },
  { skill: "SQL", value: 70 },
];

const coursePerformance = [
  {
    title: "Machine Learning Fundamentals",
    studied: "12h studied",
    quizzes: "4 quizzes",
    progress: 68,
    color: "#7C6BF0",
  },
  {
    title: "React & TypeScript Mastery",
    studied: "9h studied",
    quizzes: "2 quizzes",
    progress: 42,
    color: "#22D3EE",
  },
  {
    title: "Python for Data Analysis",
    studied: "13h studied",
    quizzes: "7 quizzes",
    progress: 91,
    color: "#34D399",
  },
];

const achievements = [
  {
    icon: "🏆",
    title: "First Quiz Pass",
    desc: "Scored 100% on Python Basics",
    meta: "Jan 15",
    color: "#FBBF24",
    unlocked: true,
  },
  {
    icon: "🔥",
    title: "7-Day Streak",
    desc: "Studied 7 days in a row",
    meta: "Feb 3",
    color: "#FB923C",
    unlocked: true,
  },
  {
    icon: "⭐",
    title: "Course Champion",
    desc: "Completed React & TypeScript",
    meta: "Mar 22",
    color: "#34D399",
    unlocked: true,
  },
  {
    icon: "🧠",
    title: "Data Scientist",
    desc: "Finish all Data Science courses",
    meta: null,
    color: "#8B93B8",
    unlocked: false,
  },
  {
    icon: "💪",
    title: "30-Day Streak",
    desc: "Study for 30 consecutive days",
    meta: null,
    color: "#8B93B8",
    unlocked: false,
  },
  {
    icon: "🎯",
    title: "Quiz Master",
    desc: "Score 95%+ on 10 quizzes",
    meta: null,
    color: "#8B93B8",
    unlocked: false,
  },
];

// ---------------------------------------------------------------------------
// Reusable panel wrapper
// ---------------------------------------------------------------------------
function Panel({ title, children, sx }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: PAPER_BORDER,
        borderRadius: 3,
        p: { xs: 2.5, sm: 3 },
        ...sx,
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ mb: 2.5 }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({ icon: Icon, iconBg, iconColor, value, label }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: PAPER_BORDER,
        borderRadius: 3,
        p: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        flex: 1,
        minWidth: 200,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.5,
          bgcolor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ color: iconColor, fontSize: 22 }} />
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={800} lineHeight={1.1}>
          {value}
        </Typography>
        <Typography variant="caption">
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Course performance row
// ---------------------------------------------------------------------------
function CourseRow({ title, studied, quizzes, progress, color }) {
  return (
    <Box sx={{ mb: 3, "&:last-of-type": { mb: 0 } }}>
      <Stack
        direction="row"
        sx={{ mb: 1, justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography variant="body2" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ color }}>
          {progress}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 5,
          mb: 1,
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 5 },
        }}
      />
      <Stack direction="row" spacing={2.5}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <AccessTimeRoundedIcon
            sx={{ fontSize: 13, color: "text.secondary" }}
          />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {studied}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <QuizRoundedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {quizzes}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Achievement card
// ---------------------------------------------------------------------------
function AchievementCard({ icon, title, desc, meta, color, unlocked }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: unlocked ? `1px solid ${color}44` : PAPER_BORDER,
        borderRadius: 3,
        p: 2.5,
        textAlign: "center",
        opacity: unlocked ? 1 : 0.5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography sx={{ fontSize: 28, mb: 1 }}>{icon}</Typography>
        <Typography
          variant="body2"
          fontWeight={700}
          color={unlocked ? "#fff" : "#8B93B8"}
          sx={{ mb: 0.5 }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 0.75, lineHeight: 1.4 }}
        >
          {desc}
        </Typography>
      </Box>

      {meta && (
        <Typography variant="caption" fontWeight={700} sx={{ color }}>
          {meta}
        </Typography>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function LearningProgress() {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        py: { xs: 3, sm: 5 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ fontSize: { xs: 24, sm: 30 } }}
        >
          Learning Progress
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "primary.main", mt: 0.5, mb: 3 }}
        >
          Your 6-month learning analytics overview
        </Typography>

        {/* Stat cards */}
        <Stack direction="row" sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}>
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </Stack>

        {/* Monthly Study Hours + Quiz Score Trend */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
            mb: 3,
          }}
        >
          <Panel title="Monthly Study Hours">
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyHours}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#8B93B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#8B93B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a2050fb",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {studyHours.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === studyHours.length - 1 ? "#7C6BF0" : "#3B3F80"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Panel>

          <Panel title="Quiz Score Trend">
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quizScores}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#8B93B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[60, 100]}
                    stroke="#8B93B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1A2050",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#22D3EE"
                    strokeWidth={2.5}
                    dot={{ fill: "#22D3EE", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Panel>
        </Box>

        {/* Skill Breakdown + Course Performance */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
            gap: 3,
            mb: 3,
          }}
        >
          <Panel title="Skill Breakdown">
            <Box sx={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillBreakdown} outerRadius="70%">
                  <PolarGrid stroke="rgba(255,255,255,0.12)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    stroke="#8B93B8"
                    fontSize={11}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#9B8CFF"
                    fill="#7C6BF0"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Panel>

          <Panel title="Course Performance">
            {coursePerformance.map((c) => (
              <CourseRow key={c.title} {...c} />
            ))}
          </Panel>
        </Box>

        {/* Achievements */}
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          Achievements
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(6, 1fr)",
            },
            gap: 2,
          }}
        >
          {achievements.map((a) => (
            <AchievementCard key={a.title} {...a} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
