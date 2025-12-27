// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOTP from "./pages/auth/VerifyOTP";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import CreatedQuizzes from "./pages/CreatedQuizzes";
import ParticipatedQuizzes from "./pages/ParticipatedQuizzes";
import Profile from "./pages/Profile";
import CreateQuiz from "./pages/host/CreateQuiz";
import EditQuiz from "./pages/host/EditQuiz";
import ManageQuiz from "./pages/host/ManageQuiz";
import HostLobby from "./pages/host/HostLobby";
import LiveLeaderboard from "./pages/host/LiveLeaderboard";
import JoinQuiz from "./pages/participant/JoinQuiz";
import UserLobby from "./pages/participant/UserLobby";
import TakeQuiz from "./pages/participant/TakeQuiz";
import Result from "./pages/participant/Result";
import QuizAttemptDetails from "./pages/participant/QuizAttemptDetails";

// Redirect logged-in users away from public pages
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-center" />
          <Routes>
            {/* Public Routes */}
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
            <Route path="/verify-otp" element={<VerifyOTP />} />

            {/* Protected Routes with Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* Dashboard is the index (home) route after login */}
                <Route index element={<Dashboard />} />
                <Route path="created-quizzes" element={<CreatedQuizzes />} />
                <Route
                  path="participated-quizzes"
                  element={<ParticipatedQuizzes />}
                />
                <Route path="profile" element={<Profile />} />
                <Route path="create" element={<CreateQuiz />} />
                <Route path="host/edit/:quizId" element={<EditQuiz />} />
                <Route path="host/manage/:quizId" element={<ManageQuiz />} />
                <Route path="host/live/:quizId" element={<HostLobby />} />
                <Route
                  path="host/live-dashboard/:quizId"
                  element={<LiveLeaderboard />}
                />
                <Route path="join" element={<JoinQuiz />} />
                <Route
                  path="attempt/:quizId"
                  element={<QuizAttemptDetails />}
                />
                <Route path="result/:quizId" element={<Result />} />
              </Route>

              {/* Full-screen immersive routes (no layout) */}
              <Route path="lobby/:quizId" element={<UserLobby />} />
              <Route path="take-quiz/:quizId" element={<TakeQuiz />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
