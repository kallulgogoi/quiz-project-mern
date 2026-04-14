import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import api, { endpoints } from "../../api/axios";
import { TrophySpin } from "react-loading-indicators";
import { Clock, Play, BellRing, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function UserLobby() {
  const { quizId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Initial Fetch to get quiz details and start time
  const fetchQuizStatus = async () => {
    try {
      const { data } = await api.get(endpoints.quiz.getById(quizId));
      setQuiz(data.quiz);
      if (data.quiz.status === "active") {
        setIsLive(true);
      }
    } catch (err) {
      console.error("Status check failed", err);
      toast.error("Failed to load lobby details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizStatus();
  }, [quizId]);

  // 2. Countdown Timer Logic
  useEffect(() => {
    if (!quiz || quiz.status !== "scheduled") return;

    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(quiz.startTime);
      const diff = Math.floor((start - now) / 1000);

      if (diff <= 0) {
        setTimeLeft(0);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz]);

  // 3. Socket Listener (Real-time trigger)
  useEffect(() => {
    if (!socket) return;
    socket.emit("join-quiz-room", quizId);

    socket.on("quiz-started", () => {
      triggerQuizStart();
    });

    return () => {
      socket.off("quiz-started");
    };
  }, [socket, quizId]);

  // 4. Fallback Polling (Fixes the "forced to refresh" bug if sockets fail)
  useEffect(() => {
    if (isLive || !quiz) return;

    const poll = setInterval(async () => {
      try {
        const { data } = await api.get(endpoints.quiz.getById(quizId));
        if (data.quiz.status === "active") {
          triggerQuizStart();
        }
      } catch (err) {
        // ignore polling errors to prevent spamming the console
      }
    }, 4000); // Check every 4 seconds

    return () => clearInterval(poll);
  }, [isLive, quiz, quizId]);

  // Function to handle the exact moment the quiz goes live
  const triggerQuizStart = () => {
    setIsLive(true);
    toast("THE QUIZ HAS STARTED!", {
      icon: "🚀",
      duration: 8000,
      style: {
        borderRadius: "10px",
        background: "#4f46e5",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "bold",
      },
    });

    // Play a notification sound
    try {
      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
      );
      audio.play().catch((e) => console.log("Audio blocked by browser"));
    } catch (e) {}
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    if (seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleJoinQuiz = () => {
    navigate(`/take-quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <TrophySpin color="#4f46e5" size="medium" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-indigo-100">
        {/* Header Icon */}
        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm transition-all duration-500 ${isLive ? "bg-green-100 animate-bounce" : "bg-indigo-100"}`}
        >
          {isLive ? (
            <BellRing size={40} className="text-green-600" />
          ) : (
            <Clock size={40} className="text-indigo-600" />
          )}
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {quiz?.title || "Quiz Lobby"}
        </h1>

        {/* Dynamic State UI */}
        {!isLive ? (
          <>
            <p className="text-gray-500 mb-8 font-medium">
              You're in! Waiting for the host to start the quiz.
            </p>

            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8">
              <p className="text-xs text-indigo-800 font-bold uppercase tracking-widest mb-2">
                Time until start
              </p>
              <div className="text-5xl font-mono font-black text-indigo-600">
                {formatTime(timeLeft)}
              </div>
              {timeLeft === 0 && (
                <p className="text-sm text-indigo-600 font-bold mt-3 animate-pulse">
                  Host is preparing to launch...
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-green-600 mb-8 font-bold text-lg animate-pulse">
              The host has started the quiz!
            </p>

            <button
              onClick={handleJoinQuiz}
              className="w-full flex items-center justify-center gap-2 py-4 bg-green-500 text-white rounded-xl text-xl font-black shadow-lg shadow-green-200 hover:bg-green-600 hover:scale-105 transition-all mb-8"
            >
              <Play fill="currentColor" size={24} /> ENTER QUIZ NOW
            </button>
          </>
        )}

        {/* User Card */}
        <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 bg-indigo-600 rounded-full text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="User"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user?.username?.[0].toUpperCase()
            )}
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-gray-900">{user?.username}</p>
            <p className="text-xs text-green-600 font-bold flex items-center gap-1">
              <UserCheck size={14} /> Connected & Ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
