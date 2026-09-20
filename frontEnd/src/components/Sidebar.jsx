import {
  Avatar,
  Box,
  Stack,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
} from "@mui/material";
import React, { useState } from "react";
import SchoolSharpIcon from "@mui/icons-material/SchoolSharp";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QuizIcon from "@mui/icons-material/Quiz";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, useLocation } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: "courses",
    label: "Courses",
    path: "/courses",
    icon: <MenuBookIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: "quizzes",
    label: "Quizzes",
    path: "/quizzes",
    icon: <QuizIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: "progress",
    label: "Progress",
    path: "/progress",
    icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: "foryou",
    label: "For You",
    path: "/for-you",
    icon: <StarIcon sx={{ fontSize: 18 }} />,
    badge: "AI",
  },
];

export default function Sidebar({ sideBar, setsideBar, mode, setMode }) {
  const [selected, setSelected] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItem = menuItems.find(
    (item) => item.path === location.pathname,
  );
  function logout() {
    navigate("/");
    localStorage.removeItem("token");
  }
  function LightDark() {
    return (
      <button
        onClick={() => setMode(mode === "dark" ? "light" : "dark")}
        style={{
          width: "48px",
          height: "26px",
          borderRadius: "20px",
          border: "none",
          cursor: "pointer",
          background:
            mode === "dark"
              ? "linear-gradient(135deg, #1e293b, #475569)"
              : "linear-gradient(135deg, #fbbf24, #fde68a)",
          display: "flex",
          alignItems: "center",
          justifyContent: mode === "dark" ? "flex-end" : "flex-start",
          padding: "3px",
          transition: "0.3s ease",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: mode === "dark" ? "#0f172a" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            transition: "0.3s ease",
          }}
        >
          {mode === "dark" ? "🌙" : "☀️"}
        </div>
      </button>
    );
  }
  return (
    <>
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          width: "100%",
          bgcolor: "background.paper",
          flexDirection: "row",
          justifyContent: "space-between",
          borderRight: "1px solid #77777773",
          borderBottom: "2px solid #77777773",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            padding: "20px",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={() => setsideBar(!sideBar)}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "text.primary", bgcolor: "action.hover" },
            }}
          >
            <MenuIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 36,
              height: 36,
              borderRadius: "50%",
              color: "primary.contrastText",
            }}
          >
            <SchoolSharpIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography
              sx={{
                color: "text.primary",
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.3,
              }}
            >
              LearnAI
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
              Smart Platform
            </Typography>
          </Box>
        </Stack>

        {/* User Profile Footer */}

        <Stack
          direction="row"
          sx={{ alignItems: "center", p: 2 }}
          spacing={1.5}
        >
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: 13,
              display: "block",
            }}
          >
            Dashboard
          </Typography>
          <IconButton
            onClick={logout}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "text.primary", bgcolor: "action.hover" },
            }}
          >
            <LogoutIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Box>
      <Box
        sx={{
          overflow: "hidden",
          top: "0",
          position: { xs: "absolute", md: "relative" },
          left: { xs: sideBar ? "0" : "-300px", md: "0" },
          transition: "0.3s",
          width: "250px",
          bgcolor: "background.paper",
          flexDirection: "column",
          height: "100%",
          display: "flex",
          zIndex: 1200,
          borderRight: "1px solid #77777773",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            p: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 36,
                height: 36,
                color: "primary.contrastText",
              }}
            >
              <SchoolSharpIcon sx={{ fontSize: 20 }} />
            </Avatar>

            <Box>
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                LearnAI
              </Typography>

              <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
                Smart Platform
              </Typography>
            </Box>
          </Stack>
          <LightDark />
          <IconButton
            onClick={() => setsideBar(!sideBar)}
            size="small"
            sx={{
              display: { xs: "flex", md: "none" },
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
                bgcolor: "action.hover",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 23 }} />
          </IconButton>
        </Box>

        {/* Menu Items */}
        <List
          sx={{
            borderTop: "1px solid #77777750",
            borderBottom: "1px solid #77777750",
            px: 1.5,
            pt: 2,
            flexGrow: 1,
          }}
        >
          {menuItems.map((item) => (
            <ListItemButton
              key={item.id}
              selected={selectedItem?.id === item.id}
              onClick={() => {
                setSelected(item.id);
                navigate(item.path);
              }}
              sx={{
                borderRadius: "10px",
                mb: 0.3,
                py: 0.7, // أصغر
                px: 1.2,
                minHeight: 36, // أصغر
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: "0 0 0 2px rgba(124, 92, 255, 0.4)",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 32, // أصغر
                  color:
                    selected === item.id
                      ? "primary.contrastText"
                      : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: selected === item.id ? 600 : 500,
                  fontSize: "0.85rem", // أصغر
                }}
              />
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    height: 18, // أصغر
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    bgcolor: "primary.dark",
                    color: "primary.contrastText",
                    borderRadius: "8px",
                  }}
                />
              )}
            </ListItemButton>
          ))}
        </List>

        {/* User Profile Footer */}
        <Box
          sx={{
            p: 2,
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.5}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 36,
                height: 36,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              AJ
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: 13.5,
                  lineHeight: 1.3,
                }}
              >
                Alex Johnson
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
                Level 7 Learner
              </Typography>
            </Box>
            <IconButton
              onClick={logout}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "text.primary", bgcolor: "action.hover" },
              }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
