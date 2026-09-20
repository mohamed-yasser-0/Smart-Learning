import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import getTheme from "./theme";

const queryClient = new QueryClient();

function Root() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("theme") || "Dark";
  });
  const theme = getTheme(mode);
  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);
  return (
    <BrowserRouter basename="/Smart-Learning">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          <App mode={mode} setMode={setMode} />
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
