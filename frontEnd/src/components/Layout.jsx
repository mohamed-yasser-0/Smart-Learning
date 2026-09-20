import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import React, { useState } from "react";
import ChatBot from "./chatBot";

const Layout = ({ setMode, mode }) => {
  const [sideBar, setsideBar] = useState(false);
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        width: "100%",
        height: "100vh",
      }}
    >
      {/* Sidebar */}
      <Box>
        <Sidebar setMode={setMode} mode={mode} sideBar={sideBar} setsideBar={setsideBar} />
      </Box>

      {/* Pages */}
      <Box
        onClick={() => sideBar && setsideBar(false)}
        sx={{
          flex: 1,
          overflowY: "auto",
          filter: sideBar ? "blur(2px)" : "none",
          transition: "0.3s",
        }}
      >
        <Outlet />
      </Box>

      {/* Chat Bot (floating, over everything) */}
      <ChatBot />
    </Box>
  );
};

export default Layout;