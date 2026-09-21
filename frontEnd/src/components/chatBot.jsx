import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Grow,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "bot",
    text: "أهلاً! أنا مساعدك الذكي اسألني عن أي شيء، وسأحاول مساعدتك.",
  },
];

const ChatBot = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  const scrollRef = useRef(null);

  // --------------------------------------------------
  // API Mutation
  // --------------------------------------------------

  const chatMutation = useMutation({
    mutationFn: async (summary) => {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://smart-learning-production-61a2.up.railway.app/api/ai/Summarize",
        {
          summary,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.data;
    },

    // --------------------------------------------------
    // لما الـ API يرجع بنجاح
    // --------------------------------------------------

    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "bot",
          text: data?.respo,
        },
      ]);
      setInput("");

      toast.success("تم التلخيص بنجاح");
    },

    // --------------------------------------------------
    // لما يحصل Error
    // --------------------------------------------------

    onError: (error) => {
      toast.error(error.response?.data?.message || "حصل خطأ أثناء التلخيص");
    },
  });

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const handleSubmit = () => {
    const trimmed = input.trim();

    if (!trimmed) return;

    // إضافة رسالة المستخدم إلى الشات
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        text: trimmed,
      },
    ]);

    // إرسال الرسالة للـ API
    chatMutation.mutate(`You are an educational assistant for Smart Learning Platform.

Your job is to help students understand courses,
        lessons, quizzes, and concepts.

Explain concepts simply and clearly.
If the student asks for an explanation, give examples.
Do not make up information.

Student message:${trimmed}`);
  };

  // --------------------------------------------------
  // Enter
  // --------------------------------------------------

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // --------------------------------------------------
  // Auto Scroll
  // --------------------------------------------------

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        left: { xs: 16, sm: "auto" },
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {/* ==================================================
          Chat Window
      ================================================== */}

      <Grow
        in={open}
        unmountOnExit
        timeout={280}
        style={{ transformOrigin: "bottom right" }}
      >
        <Paper
          elevation={6}
          sx={{
            width: { xs: "100%", sm: 340 },
            height: { xs: "70vh", sm: 460 },
            maxHeight: { xs: 560, sm: 460 },
            display: "flex",
            flexDirection: "column",
            borderRadius: "18px",
            overflow: "hidden",
            mb: 2,
          }}
        >
          {/* ==================================================
              Header
          ================================================== */}

          <Box
            sx={{
              px: 2,
              py: isMobile ? 1.75 : 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: "#1E293B",
              color: "#fff",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#4C6EF5",
                width: 34,
                height: 34,
              }}
            >
              <SmartToyRoundedIcon fontSize="small" />
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                المساعد الذكي
              </Typography>

              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                متصل الآن
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{ color: "#fff" }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* ==================================================
              Messages
          ================================================== */}

          <Box
            ref={scrollRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 1.5,
              py: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.2,
              bgcolor: "background.paper",
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius:
                      msg.role === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",

                    bgcolor: msg.role === "user" ? "#4C6EF5" : "#EEF1F6",

                    color: msg.role === "user" ? "#fff" : "#1E293B",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </Typography>
                </Paper>
              </Box>
            ))}

            {/* ==================================================
                Loading
            ================================================== */}

            {chatMutation.isPending && (
              <Box
                sx={{
                  alignSelf: "flex-start",
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  px: 1,
                }}
              >
                <CircularProgress size={14} thickness={5} />

                <Typography variant="caption" color="text.secondary">
                  جاري الرد ...
                </Typography>
              </Box>
            )}
          </Box>

          {/* ==================================================
              Input
          ================================================== */}

          <Box
            sx={{
              px: 1.5,
              py: 1.2,
              display: "flex",
              gap: 1,
              alignItems: "center",
              borderTop: "1px solid #E2E8F0",
              bgcolor: "background.paper",
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              variant="outlined"
              disabled={chatMutation.isPending}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />

            <IconButton
              onClick={handleSubmit}
              disabled={chatMutation.isPending || !input.trim()}
              sx={{
                bgcolor: "#4C6EF5",
                color: "#fff",

                "&:hover": {
                  bgcolor: "#3B5BDB",
                },

                "&.Mui-disabled": {
                  bgcolor: "#CBD5E1",
                  color: "#fff",
                },
              }}
            >
              {chatMutation.isPending ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                <SendRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Paper>
      </Grow>

      {/* ==================================================
          Floating Button
      ================================================== */}

      <Fab
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          bgcolor: "#4C6EF5",
          color: "#fff",

          transition: "transform 0.2s ease",

          "&:hover": {
            bgcolor: "#3B5BDB",
            transform: "scale(1.06)",
          },
        }}
      >
        {open ? <CloseRoundedIcon /> : <ChatBubbleOutlineRoundedIcon />}
      </Fab>
    </Box>
  );
};

export default ChatBot;
