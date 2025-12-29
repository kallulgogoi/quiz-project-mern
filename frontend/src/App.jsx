import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import QuizReports from "./pages/host/QuizReports";
import HostParticipantResult from "./pages/host/HostParticipantResult";
import Dashboard from "./pages/Dashboard";
import CreatedQuizzes from "./pages/CreatedQuizzes";
import ParticipatedQuizzes from "./pages/ParticipatedQuizzes";
import CreateQuiz from "./pages/host/CreateQuiz";
import LiveLeaderboard from "./pages/host/LiveLeaderboard";
import EditQuiz from "./pages/host/EditQuiz";
import ManageQuiz from "./pages/host/ManageQuiz";
import HostLobby from "./pages/host/HostLobby";
import JoinQuiz from "./pages/participant/JoinQuiz";
import UserLobby from "./pages/participant/UserLobby";
import TakeQuiz from "./pages/participant/TakeQuiz";
import Result from "./pages/participant/Result";
import QuizAttemptDetails from "./pages/participant/QuizAttemptDetails";
import Profile from "./pages/Profile";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <SocketProvider>
            <Toaster position="top-center" />
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* PROTECTED ROUTES */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/created-quizzes" element={<CreatedQuizzes />} />
                  <Route
                    path="/participated-quizzes"
                    element={<ParticipatedQuizzes />}
                  />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/create" element={<CreateQuiz />} />
                  <Route path="/host/edit/:quizId" element={<EditQuiz />} />
                  <Route path="/host/manage/:quizId" element={<ManageQuiz />} />
                  <Route path="/host/live/:quizId" element={<HostLobby />} />
                  <Route
                    path="/host/live-dashboard/:quizId"
                    element={<LiveLeaderboard />}
                  />
                  <Route
                    path="/host/reports/:quizId"
                    element={<QuizReports />}
                  />
                  <Route
                    path="/host/report/:attemptId"
                    element={<HostParticipantResult />}
                  />
                  <Route path="/join" element={<JoinQuiz />} />
                  <Route
                    path="/attempt/:quizId"
                    element={<QuizAttemptDetails />}
                  />
                  <Route path="/result/:quizId" element={<Result />} />
                </Route>

                <Route path="/lobby/:quizId" element={<UserLobby />} />
                <Route path="/take-quiz/:quizId" element={<TakeQuiz />} />
              </Route>
            </Routes>
            <Analytics />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
