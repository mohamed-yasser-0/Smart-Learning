import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Avatar,
  Tabs,
  Tab,
  Link,
  Paper,
  CircularProgress,
} from "@mui/material";

// ------------------------------------------------------------------
// Color tokens taken from the design
// ------------------------------------------------------------------

import MailIcon from "@mui/icons-material/Mail";

import {
  School as SchoolIcon,
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  MenuBook as MenuBookIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  // HelpOutline as HelpOutlineIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const features = [
  {
    icon: <MenuBookIcon fontSize="18" />,
    label: "200+ Courses",
    bg: "rgba(99, 102, 241, 0.133);",
    cr: "rgb(99, 102, 241)",
  },
  {
    icon: <PsychologyIcon fontSize="18" />,
    label: "AI-Powered Quizzes",
    bg: "#1f4a4a",
    cr: "rgb(34, 211, 238)",
  },
  {
    icon: <TrendingUpIcon fontSize="18" />,
    label: "Progress Analytics",
    bg: "rgba(52, 211, 153, 0.133)",
    cr: "#6366f1",
  },
];
export default function LoginPage() {
  const [tab, setTab] = useState(0); // 0 = Sign In, 1 = Register
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (userData) => {
      const res = await axios.post(
        "https://smart-learning-production-61a2.up.railway.app/api/user/logIn",
        userData,
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.token) {
        console.log(data.token);

        localStorage.setItem("token", data.token);
        navigate("/dashboard");
        // بعد ما التسجيل ينجح، نحدث قائمة المستخدمين
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "حصل خطأ");
      console.log(error);
    },
  });
  const loginHandleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({
      email: email,
      password: password,
    });
  };
  const RegisterMutation = useMutation({
    mutationFn: async (userData) => {
      const res = await axios.post(
        "https://smart-learning-production-61a2.up.railway.app/api/user/register",
        userData,
      );
      return res.data;
    },
    onSuccess: (data) => {
      console.log(data);
      toast.success("Account created successfully. Please log in");
      setTab(0);
      // بعد ما التسجيل ينجح، نحدث قائمة المستخدمين
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "حصل خطأ");
      console.log(error);
    },
  });
  const RegisterHandleSubmit = (e) => {
    e.preventDefault();
    RegisterMutation.mutate({
      username: userName,
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    });
  };
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* ---------------- LEFT PANEL ---------------- */}
      <Box
        sx={{
          flex: "0 0 45%",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          bgcolor: "background.paper",
          borderRight: `1px solid rgba(255,255,255,0.08)`,
          p: { md: 6, lg: 7 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              bgcolor: "primary.light",
              width: 44,
              height: 44,
              borderRadius: "17px",
            }}
            variant="rounded"
          >
            <SchoolIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography
              sx={{
                color: "text.primary",
                fontWeight: 700,
                fontSize: 18,
                lineHeight: 1.2,
              }}
            >
              LearnAI
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 12.5 }}>
              Smart Learning Platform
            </Typography>
          </Box>
        </Stack>

        {/* Middle content */}
        <Box sx={{ maxWidth: 420 }}>
          <Typography
            sx={{
              color: "text.primary",
              fontWeight: 800,
              fontSize: { md: "2rem", lg: "2.1rem" },
              lineHeight: 1.15,
            }}
          >
            Learn smarter,
            <br />
            <Box component="span" sx={{ color: "primary.main" }}>
              not harder.
            </Box>
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: 15,
              mt: 2.5,
              lineHeight: 1.7,
            }}
          >
            AI-powered recommendations, adaptive quizzes, and real-time progress
            analytics — all in one place.
          </Typography>

          <Stack spacing={1.8} sx={{ mt: 4 }}>
            {features.map((f) => (
              <Stack
                key={f.label}
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                }}
              >
                <Avatar
                  sx={{ color: f.cr, bgcolor: f.bg, width: 34, height: 34 }}
                >
                  {f.icon}
                </Avatar>
                <Typography
                  sx={{ color: "text.midle", fontSize: 14.5, fontWeight: 500 }}
                >
                  {f.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Testimonial */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: "action.hover",
            border: `1px solid rgba(255,255,255,0.08)`,
            borderRadius: 2,
            p: 2.5,
          }}
        >
          <Typography
            sx={{
              color: "text.midle",
              fontSize: 13.5,
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            "LearnAI helped me go from zero to landing a data science job in 6
            months. The AI recommendations were spot-on."
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mt: 2 }}
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 32,
                height: 32,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              SK
            </Avatar>
            <Box>
              <Typography
                sx={{ color: "text.primary", fontSize: 13.5, fontWeight: 600 }}
              >
                Sara K.
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                Data Scientist @ Google
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* ---------------- RIGHT PANEL ---------------- */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          px: 3,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 440 }}>
          <Typography
            sx={{ color: "text.primary", fontWeight: 800, fontSize: "1.7rem" }}
          >
            Welcome back 👋
          </Typography>
          <Typography
            sx={{ color: "text.secondary", fontSize: 14.3, mt: 0.5, mb: 3.5 }}
          >
            Sign in to continue your learning journey
          </Typography>

          {/* Tabs (Sign In / Register) */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              minHeight: 44,
              bgcolor: "action.hover",
              borderRadius: "10px",
              p: "4px",
              mb: 3,
              "& .MuiTabs-indicator": { display: "none" },
            }}
          >
            <Tab
              label="Sign In"
              sx={{
                minHeight: 36,
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: 14,
                textTransform: "none",
                transition: "all .2s",
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.contrastText",
                  bgcolor: "primary.dark",
                },
              }}
            />
            <Tab
              label="Register"
              sx={{
                minHeight: 36,
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: 14,
                textTransform: "none",
                transition: "all .2s",
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.contrastText",
                  bgcolor: "primary.dark",
                },
              }}
            />
          </Tabs>
          {/* First Name */}
          {tab === 1 && (
            <>
              <Typography
                sx={{
                  color: "text.primary",
                  fontSize: 13.5,
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                First Name
              </Typography>
              <TextField
                fullWidth
                placeholder="Alex Johnson"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                sx={{
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "divider",
                    borderRadius: "10px",
                    color: "text.primary",
                    "& fieldset": { borderColor: "action.selected" },
                    "&:hover fieldset": { borderColor: "primary.main" },
                    "&.Mui-focused fieldset": { borderColor: "primary.main" },
                  },
                  "& input::placeholder": {
                    color: "text.secondary",
                    opacity: 1,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
          {/* last Name */}
          {tab === 1 && (
            <>
              <Typography
                sx={{
                  color: "text.primary",
                  fontSize: 13.5,
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Last Name
              </Typography>
              <TextField
                fullWidth
                placeholder="Alex Johnson"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                sx={{
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "divider",
                    borderRadius: "10px",
                    color: "text.primary",
                    "& fieldset": { borderColor: "action.selected" },
                    "&:hover fieldset": { borderColor: "primary.main" },
                    "&.Mui-focused fieldset": { borderColor: "primary.main" },
                  },
                  "& input::placeholder": {
                    color: "text.secondary",
                    opacity: 1,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
          {/* username */}
          {tab === 1 && (
            <>
              <Typography
                sx={{
                  color: "text.primary",
                  fontSize: 13.5,
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                User Name
              </Typography>
              <TextField
                fullWidth
                placeholder="Alex"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                sx={{
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "divider",
                    borderRadius: "10px",
                    color: "text.primary",
                    "& fieldset": { borderColor: "action.selected" },
                    "&:hover fieldset": { borderColor: "primary.main" },
                    "&.Mui-focused fieldset": { borderColor: "primary.main" },
                  },
                  "& input::placeholder": {
                    color: "text.secondary",
                    opacity: 1,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
          {/* Email */}
          <Typography
            sx={{
              color: "text.primary",
              fontSize: 13.5,
              fontWeight: 600,
              mb: 1,
            }}
          >
            Email Address
          </Typography>
          <TextField
            fullWidth
            placeholder="alex@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                bgcolor: "divider",
                borderRadius: "10px",
                color: "text.primary",
                "& fieldset": { borderColor: "action.hover" },
                "&:hover fieldset": { borderColor: "primary.main" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
              "& input::placeholder": { color: "text.secondary", opacity: 1 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Password */}
          <Typography
            sx={{
              color: "text.primary",
              fontSize: 13.5,
              fontWeight: 600,
              mb: 1,
            }}
          >
            Password
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              width: "100%",
              mb: 1,
              "& .MuiOutlinedInput-root": {
                bgcolor: "divider",
                borderRadius: "10px",
                color: "text.primary",
                "& fieldset": { borderColor: "action.hover" },
                "&:hover fieldset": { borderColor: "primary.main" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),

                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      sx={{ color: "text.secondary" }}
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {/* Forgot password */}
          <Box sx={{ textAlign: "right", mb: 3 }}>
            <Link
              href="#"
              underline="hover"
              sx={{ color: "primary.main", fontSize: 13, fontWeight: 600 }}
            >
              Forgot password?
            </Link>
          </Box>

          {/* Submit */}
          <form onSubmit={tab ? RegisterHandleSubmit : loginHandleSubmit}>
            <Button
              type="submit"
              disabled={
                tab ? RegisterMutation.isPending : loginMutation.isPending
              }
              fullWidth
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: "primary.dark",
                color: "primary.contrastText",
                fontWeight: 700,
                fontSize: 15,
                textTransform: "none",
                borderRadius: "10px",
                py: 1.4,
                boxShadow: "none",
                "&:hover": { bgcolor: "primary.main", boxShadow: "none" },
              }}
            >
              {loginMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "LogIn"
              )}
            </Button>
          </form>
          {/* Register link */}
          <Typography
            sx={{
              textAlign: "center",
              mt: 3,
              fontSize: 13.5,
              color: "text.secondary",
            }}
          >
            Don't have an account?{" "}
            <Link
              href="#"
              underline="hover"
              onClick={() => setTab(1)}
              sx={{ color: "primary.main", fontWeight: 700 }}
            >
              Register
            </Link>
          </Typography>
        </Box>

        {/* Help button */}
        <IconButton
          sx={{
            position: "absolute",
            bottom: 24,
            right: 24,
            bgcolor: "divider",
            color: "text.secondary",
            width: 38,
            fontSize: 20,
            height: 38,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          ?
        </IconButton>
      </Box>
    </Box>
  );
}
