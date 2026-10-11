import { lazy, Suspense } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { Toaster } from "react-hot-toast";
import "./App.css";
import LoginPage from "./components/Auth";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// الصفحات بتتحمّل عند الحاجة بس (code splitting)
const Home = lazy(() => import("./components/home"));
const Courses = lazy(() => import("./components/Course/Courses"));
const CourseLessons = lazy(() => import("./components/Course/Lessons"));
const UploadCourse = lazy(() => import("./components/Course/UploadCourse"));
const UploadLesson = lazy(() => import("./components/Course/UploadLesson"));
const Quizzes = lazy(() => import("./components/Quizzes/Quizzes"));
const QuizQuestion = lazy(() => import("./components/Quizzes/QuizQuestion"));
const Progress = lazy(() => import("./components/Progress"));
const ForYou = lazy(() => import("./components/For-you"));

function PageLoader() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
      <CircularProgress />
    </Box>
  );
}

// بيلف الصفحة بـ Suspense عشان الـ Layout يفضل ظاهر أثناء التحميل
const page = (element) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: "center", py: 10 }}>
      <Typography variant="h3" fontWeight={800}>
        404
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        الصفحة غير موجودة
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate("/dashboard")}
        sx={{ textTransform: "none", borderRadius: "10px" }}
      >
        الرئيسية
      </Button>
    </Box>
  );
}

const toastOptions = {
  duration: 3000,
  style: {
    background: "#1e1e1e",
    color: "#fff",
    borderRadius: "12px",
    padding: "14px 20px",
    fontSize: "15px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
  },
  success: {
    style: { background: "#10b981" },
    iconTheme: { primary: "#fff", secondary: "#10b981" },
  },
  error: {
    style: { background: "#ef4444" },
    iconTheme: { primary: "#fff", secondary: "#ef4444" },
  },
};

function App({ mode, setMode }) {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout setMode={setMode} mode={mode} />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={page(<Home />)} />
          <Route path="/courses" element={page(<Courses />)} />
          <Route path="/courses/:id" element={page(<CourseLessons />)} />
          <Route path="/UploadCourse" element={page(<UploadCourse />)} />
          <Route
            path="/courses/:id/UploadLesson"
            element={page(<UploadLesson />)}
          />
          <Route path="/quizzes" element={page(<Quizzes />)} />
          <Route path="/quizzes/question" element={page(<QuizQuestion />)} />
          <Route path="/progress" element={page(<Progress />)} />
          <Route path="/for-you" element={page(<ForYou />)} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={toastOptions}
      />
    </>
  );
}

export default App;
