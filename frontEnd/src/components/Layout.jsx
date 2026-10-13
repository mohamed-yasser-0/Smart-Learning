import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import ChatBot from "./chatBot";

const Layout = ({ setMode, mode }) => {
  const [sideBar, setsideBar] = useState(false);
  const contentRef = useRef(null);
  const { pathname } = useLocation();

  // الصفحات بتتعرض جوه div له scroll خاص، فلازم نرجّعه لفوق عند تغيير الصفحة
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        width: "100%",
        height: "100vh",
        // dvh بيراعي شريط العنوان في متصفحات الموبايل
        "@supports (height: 100dvh)": { height: "100dvh" },
      }}
    >
      {/* Sidebar */}
      <Box>
        <Sidebar
          setMode={setMode}
          mode={mode}
          sideBar={sideBar}
          setsideBar={setsideBar}
        />
      </Box>

      {/* Pages */}
      <Box
        component="main"
        ref={contentRef}
        // في مرحلة الـ capture: لو الـ sidebar مفتوح، الضغطة بتقفله بس
        // ومبتوصلش للعنصر اللي تحتها (مثلاً كارت كورس كان بيتفتح بالغلط)
        onClickCapture={(e) => {
          if (sideBar) {
            e.stopPropagation();
            setsideBar(false);
          }
        }}
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: "auto",
          bgcolor: "background.default",
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