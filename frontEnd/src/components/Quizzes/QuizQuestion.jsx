import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Button,
  LinearProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

// ---------------------------------------------------------------------------
// Mock quiz data (mirrors the screenshot)
// ---------------------------------------------------------------------------
const quiz = {
  title: "Machine Learning Basics",
  totalQuestions: 5,
  currentQuestion: 1,
  timeLeft: "10:00",
  question: "Which algorithm is best suited for classification tasks?",
  options: [
    { letter: "A", text: "Linear Regression" },
    { letter: "B", text: "Logistic Regression" },
    { letter: "C", text: "K-Means" },
    { letter: "D", text: "PCA" },
  ],
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function QuizQuestion() {
  const [selected, setSelected] = useState(null);

  const progress = (quiz.currentQuestion / quiz.totalQuestions) * 100;

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        py: { xs: 3, sm: 5 },
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Stack
          direction={"row"}
          sx={{
            mb: 2,
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
          gap={2}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ fontSize: { xs: 20, sm: 24 } }}
            >
              {quiz.title}
            </Typography>
            <Typography
              variant="body2"
              fontFamily="monospace"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              Question {quiz.currentQuestion} of {quiz.totalQuestions}
            </Typography>
          </Box>

          <Chip
            icon={
              <AccessTimeRoundedIcon
                sx={{ color: "#9B8CFF !important", fontSize: 16 }}
              />
            }
            label={quiz.timeLeft}
            sx={{
              border: "1px solid rgba(124,107,240,0.4)",
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          />
        </Stack>

        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 5,
            mb: 3,
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
            },
          }}
        />

        {/* Question card */}
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px solid #777777b6",
            borderRadius: 3,
            p: { xs: 2.5, sm: 4 },
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 3, fontSize: { xs: 16, sm: 18 } }}
          >
            {quiz.question}
          </Typography>

          <Stack spacing={2}>
            {quiz.options.map((opt) => {
              const isSelected = selected === opt.letter;
              return (
                <Box
                  key={opt.letter}
                  onClick={() => setSelected(opt.letter)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 2.5,
                    py: 2,
                    borderRadius: 2.5,
                    cursor: "pointer",
                    bgcolor: isSelected
                      ? "rgba(124,107,240,0.18)"
                      : "#7777771c",
                    border: isSelected
                      ? "1px solid #7C6BF0"
                      : "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: isSelected
                        ? "rgba(124,107,240,0.22)"
                        : "#7777775b",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      bgcolor: isSelected
                        ? "#7C6BF0"
                        : "rgba(124,107,240,0.12)",
                      border: isSelected
                        ? "none"
                        : "1px solid rgba(124,107,240,0.3)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{ color: isSelected ? "#fff" : "#9B8CFF" }}
                    >
                      {opt.letter}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {opt.text}
                  </Typography>
                </Box>
              );
            })}
          </Stack>

          <Stack direction="row" sx={{ mt: 3.5, justifyContent: "flex-start" }}>
            <Button
              disabled={selected === null}
              sx={{
                bgcolor: "#7C6BF0",
                color: "#fff",
                fontWeight: 700,
                textTransform: "none",
                px: 3.5,
                py: 1.2,
                borderRadius: 2,
                width: { xs: "100%", sm: "auto" },
                "&:hover": { bgcolor: "#6C5CE0" },
                "&.Mui-disabled": {
                  bgcolor: "rgba(124,107,240,0.35)",
                  color: "rgba(255,255,255,0.6)",
                },
              }}
            >
              Submit Answer
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
