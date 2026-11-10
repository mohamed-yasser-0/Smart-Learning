import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Button,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { useNavigate } from "react-router-dom";

// ---------------------------------------------------------------------------
// Accent palette per quiz (icon tile, level chip, subject label, button)
// ---------------------------------------------------------------------------
const ACCENTS = {
  violet: {
    iconBg: "rgba(124,107,240,0.18)",
    iconColor: "#9B8CFF",
    levelBg: "rgba(124,107,240,0.20)",
    levelColor: "#B7ACFF",
    subjectColor: "#9B8CFF",
    buttonBg: "#7C6BF0",
  },
  cyan: {
    iconBg: "rgba(34,211,238,0.15)",
    iconColor: "#22D3EE",
    levelBg: "rgba(34,211,238,0.18)",
    levelColor: "#67E8F9",
    subjectColor: "#22D3EE",
    buttonBg: "#22D3EE",
  },
  green: {
    iconBg: "rgba(52,211,153,0.15)",
    iconColor: "#34D399",
    levelBg: "rgba(52,211,153,0.18)",
    levelColor: "#6EE7B7",
    subjectColor: "#34D399",
    buttonBg: "#34D399",
  },
};

// ---------------------------------------------------------------------------
// Mock quiz data (mirrors the screenshot)
// ---------------------------------------------------------------------------
const quizzes = [
  {
    id: 1,
    title: "Machine Learning Basics",
    level: "Intermediate",
    questions: 5,
    time: "10:00",
    subject: "Data Science",
    accent: "violet",
  },
  {
    id: 2,
    title: "React Hooks Deep Dive",
    level: "Advanced",
    questions: 4,
    time: "08:00",
    subject: "Frontend",
    accent: "cyan",
  },
  {
    id: 3,
    title: "Python Data Structures",
    level: "Beginner",
    questions: 3,
    time: "07:00",
    subject: "Backend",
    accent: "green",
  },
];

// ---------------------------------------------------------------------------
// Quiz row
// ---------------------------------------------------------------------------
function QuizRow({ quiz }) {
  const a = ACCENTS[quiz.accent];
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid #77777793",
        borderRadius: 1,
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap: { xs: 2, sm: 2 },
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1.5, sm: 2.5 }}
        alignItems="center"
        sx={{ minWidth: 0 }}
      >
        <Box
          sx={{
            width: { xs: 44, sm: 56 },
            height: { xs: 44, sm: 56 },
            borderRadius: 2.5,
            bgcolor: a.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <PsychologyRoundedIcon
            sx={{ color: a.iconColor, fontSize: { xs: 22, sm: 28 } }}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
            rowGap={0.5}
            sx={{ mb: 0.5 }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ fontSize: { xs: 15, sm: 16 } }}
            >
              {quiz.title}
            </Typography>
            <Chip
              label={quiz.level}
              size="small"
              sx={{
                bgcolor: a.levelBg,
                color: a.levelColor,
                fontWeight: 600,
                fontSize: 12,
                height: 24,
              }}
            />
          </Stack>
          <Stack
            direction="row"
            spacing={{ xs: 1.5, sm: 2.5 }}
            alignItems="center"
            flexWrap="wrap"
            rowGap={0.5}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <QuizRoundedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
              <Typography
                variant="caption"
                fontFamily="monospace"
                sx={{ color: "text.secondary" }}
              >
                {quiz.questions} questions
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AccessTimeRoundedIcon
                sx={{ fontSize: 15, color: "text.secondary" }}
              />
              <Typography
                variant="caption"
                fontFamily="monospace"
                sx={{ color: "text.secondary" }}
              >
                {quiz.time}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{ color: a.subjectColor }}
            >
              {quiz.subject}
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <Button
        endIcon={<ChevronRightRoundedIcon />}
        fullWidth={false}
        onClick={() => navigate("/quizzes/question")}
        sx={{
          bgcolor: a.buttonBg,
          color: "#0A0E27",
          fontWeight: 700,
          textTransform: "none",
          px: 3,
          py: 1,
          borderRadius: 2,
          flexShrink: 0,
          width: { xs: "100%", sm: "auto" },
          alignSelf: { xs: "stretch", sm: "center" },
          "&:hover": { bgcolor: a.buttonBg, opacity: 0.9 },
        }}
      >
        Start
      </Button>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function Quizzes() {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        py: { xs: 3, sm: 5 },
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ fontSize: { xs: 26, sm: 34 } }}
        >
          Quizzes
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 0.5, mb: { xs: 3, sm: 4 } }}
        >
          Test your knowledge and reinforce learning
        </Typography>

        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          {quizzes.map((quiz) => (
            <QuizRow key={quiz.id} quiz={quiz} />
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
