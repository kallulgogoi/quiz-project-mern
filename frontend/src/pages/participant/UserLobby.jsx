import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import api, { endpoints } from "../../api/axios";
import { TrophySpin } from "react-loading-indicators";
import {
  Clock,
  Play,
  BellRing,
  UserCheck,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
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

  // Initial Fetch to get quiz details and start time
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

  // Countdown Timer Logic
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

  // Socket Listener (Real-time trigger)
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

  // Fallback Polling (the "forced to refresh" bug if sockets fail)
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
    toast("The quiz has started! You can now join.", {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="text-center">
          <TrophySpin color="#4f46e5" size="medium" text="" textColor="" />
          <p className="mt-4 text-sm text-gray-500 font-medium">
            Loading lobby...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50 p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Top Gradient Bar */}
          <div
            className={`h-1.5 transition-all duration-500 ${
              isLive
                ? "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"
                : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            }`}
          />

          <div className="p-6 md:p-8">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              <div
                className={`relative transition-all duration-500 ${
                  isLive ? "animate-pulse" : ""
                }`}
              >
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                    isLive
                      ? "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200"
                      : "bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200"
                  }`}
                >
                  {isLive ? (
                    <Zap size={36} className="text-emerald-600" />
                  ) : (
                    <Timer size={36} className="text-indigo-600" />
                  )}
                </div>
                {isLive && (
                  <div className="absolute -top-1 -right-1">
                    <Sparkles
                      size={20}
                      className="text-amber-500 fill-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Title */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              {quiz?.title || "Quiz Lobby"}
            </h1>

            {/* Status Badge */}
            <div className="flex justify-center mb-6">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isLive
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isLive ? "bg-emerald-500 animate-pulse" : "bg-indigo-500"
                  }`}
                />
                {isLive ? "LIVE NOW" : "WAITING ROOM"}
              </div>
            </div>

            {/* Dynamic Content */}
            {!isLive ? (
              <>
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  You're in the waiting room. The quiz will begin when the host
                  starts the session.
                </p>

                {/* Countdown Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Clock size={16} className="text-indigo-600" />
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Starts In
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="text-5xl font-mono font-bold text-gray-900 tracking-wider mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    {timeLeft === 0 ? (
                      <p className="text-sm text-indigo-600 font-medium flex items-center justify-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                        Host is preparing to launch
                        <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Please wait for the host to begin
                      </p>
                    )}
                  </div>
                </div>

                {/* Quiz Info */}
                {quiz?.startTime && (
                  <div className="flex items-center justify-center gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar size={14} />
                      <span>
                        {new Date(quiz.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Users size={14} />
                      <span>{quiz?.participants?.length || 0} waiting</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BellRing size={16} className="text-emerald-600" />
                    <p className="text-sm font-semibold text-emerald-700">
                      Quiz is now live
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    The host has started the session. Click below to join
                    immediately!
                  </p>
                </div>

                <button
                  onClick={handleJoinQuiz}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl p-4 font-bold text-lg shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 mb-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <span className="relative flex items-center justify-center gap-2">
                    <Play size={20} className="fill-white" />
                    Enter Quiz Now
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </button>
              </>
            )}

            {/* User Profile Card */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user?.username || "User"}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {user?.username?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                    <CheckCircle2 size={10} className="text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {user?.username || "Guest User"}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <UserCheck size={14} className="text-emerald-600" />
                    <p className="text-xs font-medium text-emerald-600">
                      Connected & Ready
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-gray-400 text-center mt-4">
              {isLive
                ? "Quiz in progress • Good luck!"
                : "Stay on this page • You'll be notified when it starts"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
