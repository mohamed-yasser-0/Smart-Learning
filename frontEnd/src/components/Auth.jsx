import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import LockIcon from "@mui/icons-material/Lock";
import MailIcon from "@mui/icons-material/Mail";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { api } from "../api/client";

// ---------------------------------------------------------------------------
// Static data & helpers
// ---------------------------------------------------------------------------
const FEATURES = [
  {
    icon: <MenuBookIcon sx={{ fontSize: 18 }} />,
    label: "Rich Course Library",
    bg: "rgba(99, 102, 241, 0.133)",
    color: "rgb(99, 102, 241)",
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 18 }} />,
    label: "AI-Powered Quizzes",
    bg: "rgba(34, 211, 238, 0.133)",
    color: "rgb(34, 211, 238)",
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
    label: "Progress Tracking",
    bg: "rgba(52, 211, 153, 0.133)",
    color: "rgb(52, 211, 153)",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "divider",
    borderRadius: "10px",
    color: "text.primary",
    "& fieldset": { borderColor: "action.hover" },
    "&:hover fieldset": { borderColor: "primary.main" },
    "&.Mui-focused fieldset": { borderColor: "primary.main" },
  },
  "& input::placeholder": { color: "text.secondary", opacity: 1 },
};

const tabSx = {
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
};

// ---------------------------------------------------------------------------
// Reusable pieces
// ---------------------------------------------------------------------------
function FormField({ id, label, icon, endAdornment, ...textFieldProps }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        component="label"
        htmlFor={id}
        sx={{
          display: "block",
          color: "text.primary",
          fontSize: 13.5,
          fontWeight: 600,
          mb: 1,
        }}
      >
        {label}
      </Typography>
      <TextField
        fullWidth
        id={id}
        sx={fieldSx}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">{icon}</InputAdornment>
            ),
            endAdornment,
          },
        }}
        {...textFieldProps}
      />
    </Box>
  );
}

function BrandPanel() {
  return (
    <Box
      sx={{
        flex: "0 0 45%",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: "background.paper",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        p: { md: 6, lg: 7 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: "primary.light",
            width: 44,
            height: 44,
            borderRadius: "17px",
          }}
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
          AI-powered summaries, adaptive quizzes, and real-time progress
          tracking — all in one place.
        </Typography>

        <Stack spacing={1.8} sx={{ mt: 4 }}>
          {FEATURES.map((f) => (
            <Stack
              key={f.label}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center" }}
            >
              <Avatar
                sx={{ color: f.color, bgcolor: f.bg, width: 34, height: 34 }}
              >
                {f.icon}
              </Avatar>
              <Typography
                sx={{ color: "text.primary", fontSize: 14.5, fontWeight: 500 }}
              >
                {f.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Testimonial — مثال توضيحي، استبدله برأي حقيقي أو امسحه */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "action.hover",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 2,
          p: 2.5,
        }}
      >
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: 13.5,
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          "The AI summaries and quizzes helped me study faster and remember
          more."
        </Typography>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", mt: 2 }}
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
            S
          </Avatar>
          <Box>
            <Typography
              sx={{ color: "text.primary", fontSize: 13.5, fontWeight: 600 }}
            >
              Sample student
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
              Demo testimonial
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState(0); // 0 = Sign In, 1 = Register
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");

  const isRegister = tab === 1;

  const handleAuthSuccess = (data) => {
    if (!data?.token) {
      toast.error("Login failed, please try again");
      return;
    }
    localStorage.setItem("token", data.token);
    navigate("/dashboard");
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials) =>
      (await api.post("/api/user/logIn", credentials)).data,
    onSuccess: handleAuthSuccess,
    onError: (error) => toast.error(getErrorMessage(error, "Login failed")),
  });

  const googleLoginMutation = useMutation({
    mutationFn: async (credential) =>
      (await api.post("/api/user/google-login", { credential })).data,
    onSuccess: handleAuthSuccess,
    onError: (error) =>
      toast.error(getErrorMessage(error, "Google login failed")),
  });

  const registerMutation = useMutation({
    mutationFn: async (userData) =>
      (await api.post("/api/user/register", userData)).data,
    onSuccess: () => {
      toast.success("Account created successfully. Please log in");
      setPassword("");
      setTab(0);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Registration failed")),
  });

  const isPending =
    loginMutation.isPending ||
    registerMutation.isPending ||
    googleLoginMutation.isPending;

  const validate = () => {
    if (isRegister && userName.trim().length < 2)
      return "Please enter your user name";
    if (!EMAIL_RE.test(email.trim())) return "Please enter a valid email";
    if (!password) return "Please enter your password";
    if (isRegister && password.length < MIN_PASSWORD_LENGTH)
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errorMessage = validate();
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    if (isRegister) {
      registerMutation.mutate({
        username: userName.trim(),
        email: email.trim(),
        password,
      });
    } else {
      loginMutation.mutate({ email: email.trim(), password });
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <BrandPanel />

      {/* ---------------- Form panel ---------------- */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
          py: 4,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 440 }}>
          <Typography
            component="h1"
            sx={{ color: "text.primary", fontWeight: 800, fontSize: "1.7rem" }}
          >
            {isRegister ? "Create your account" : "Welcome back 👋"}
          </Typography>
          <Typography
            sx={{ color: "text.secondary", fontSize: 14.3, mt: 0.5, mb: 3.5 }}
          >
            {isRegister
              ? "Join and start your learning journey"
              : "Sign in to continue your learning journey"}
          </Typography>

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
            <Tab label="Sign In" sx={tabSx} />
            <Tab label="Register" sx={tabSx} />
          </Tabs>

          {/* Google */}
          <Stack spacing={2} sx={{ alignItems: "center", mb: 3 }}>
            <GoogleLogin
              onSuccess={({ credential }) => {
                if (credential) googleLoginMutation.mutate(credential);
              }}
              onError={() => toast.error("Google login failed")}
            />
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              or continue with email
            </Typography>
          </Stack>

          {/* Email / password form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <FormField
                id="username"
                label="User Name"
                placeholder="Alex"
                autoComplete="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                icon={<PersonIcon sx={{ color: "text.secondary", fontSize: 20 }} />}
              />
            )}

            <FormField
              id="email"
              label="Email Address"
              type="email"
              placeholder="alex@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<MailIcon sx={{ color: "text.secondary", fontSize: 20 }} />}
            />

            <FormField
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
              }
            />

            <Button
              type="submit"
              disabled={isPending}
              fullWidth
              variant="contained"
              endIcon={!isPending && <ArrowForwardIcon />}
              sx={{
                mt: 1,
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
              {isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : isRegister ? (
                "Create account"
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>

          {/* Switch mode */}
          <Typography
            sx={{
              textAlign: "center",
              mt: 3,
              fontSize: 13.5,
              color: "text.secondary",
            }}
          >
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => setTab(isRegister ? 0 : 1)}
              sx={{
                color: "primary.main",
                fontWeight: 700,
                verticalAlign: "baseline",
              }}
            >
              {isRegister ? "Sign In" : "Register"}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}