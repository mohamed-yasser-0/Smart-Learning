import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import getTheme from "./theme";

const queryClient = new QueryClient();

function Root() {
  const [mode, setMode] = useState<string>(() => {
    return localStorage.getItem("theme") || "Dark";
  });

  const theme = getTheme(mode);

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />

            <App mode={mode} setMode={setMode} />
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

createRoot(container).render(<Root />);
