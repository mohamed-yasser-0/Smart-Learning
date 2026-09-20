import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { Box, Button } from "@mui/material";
import LoginPage from "./components/Auth";
import { Route, Routes } from "react-router-dom";
import Home from "./components/home";
import Courses from "./components/Course/Courses";
import CourseLessons from "./components/Course/Lessons";
import Quizzes from "./components/Quizzes/Quizzes";
import Progress from "./components/Progress";
import ForYou from "./components/For-you";
import Layout from "./components/Layout";
import QuizQuestion from "./components/Quizzes/QuizQuestion";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast"; // ← ضيف السطر ده
import UploadCourse from "./components/Course/UploadCourse";
import UploadLesson from "./components/Course/UploadLesson";

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
          <Route path="/dashboard" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseLessons />} />
          <Route path="/UploadCourse" element={<UploadCourse />} />
          <Route path="/courses/:id/UploadLesson" element={<UploadLesson />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/quizzes/question" element={<QuizQuestion />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/for-you" element={<ForYou />} />
        </Route>
      </Routes>

      {/* ← حط الـ Toaster هنا */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
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
            style: {
              background: "#10b981",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#ef4444",
            },
          },
        }}
      />
    </>
  );
}

export default App;
