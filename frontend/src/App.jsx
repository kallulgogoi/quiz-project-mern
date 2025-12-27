import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOTP from "./pages/auth/VerifyOTP";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "./pages/host/CreateQuiz";
import LiveLeaderboard from "./pages/host/LiveLeaderboard";
import EditQuiz from "./pages/host/EditQuiz";
import ManageQuiz from "./pages/host/ManageQuiz"; // <--- IMPORT THIS
import HostLobby from "./pages/host/HostLobby";
import JoinQuiz from "./pages/participant/JoinQuiz";
import UserLobby from "./pages/participant/UserLobby";
import TakeQuiz from "./pages/participant/TakeQuiz";
import Result from "./pages/participant/Result";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-center" />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Routes WITH Navbar (Wrapped in Layout) */}
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Navigate to="/" />} />
                <Route path="/profile" element={<Profile />} />
                {/* Host Pages */}
                <Route path="/create" element={<CreateQuiz />} />
                <Route path="/host/edit/:quizId" element={<EditQuiz />} />
                <Route
                  path="/host/live-dashboard/:quizId"
                  element={<LiveLeaderboard />}
                />
                <Route path="/host/manage/:quizId" element={<ManageQuiz />} />{" "}
                <Route path="/host/live/:quizId" element={<HostLobby />} />
                <Route path="/join" element={<JoinQuiz />} />
                <Route path="/result/:quizId" element={<Result />} />
              </Route>

              {/* Immersive Routes WITHOUT Navbar (Full Screen) */}
              <Route path="/lobby/:quizId" element={<UserLobby />} />
              <Route path="/take-quiz/:quizId" element={<TakeQuiz />} />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
