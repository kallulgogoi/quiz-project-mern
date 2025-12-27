import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { useSocket } from "../../context/SocketContext";
import {
  Users,
  Play,
  StopCircle,
  Clock,
  Calendar,
  Edit,
  BarChart2,
} from "lucide-react"; // Added BarChart2
import toast from "react-hot-toast";
import { formatDistanceToNow, differenceInSeconds } from "date-fns";

export default function HostLobby() {
  const { quizId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isReadyToStart, setIsReadyToStart] = useState(false);

  // Fetch Quiz
  const fetchQuiz = async () => {
    try {
      const { data } = await api.get(endpoints.quiz.getById(quizId));
      setQuiz(data.quiz);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quiz");
    }
  };

  useEffect(() => {
    fetchQuiz();
    if (socket) {
      socket.emit("create-room", quizId);
    }
  }, [quizId, socket]);

  // Timer Logic
  useEffect(() => {
    if (!quiz || quiz.status !== "scheduled") return;

    const timer = setInterval(() => {
      const start = new Date(quiz.startTime);
      const now = new Date();
      const diff = differenceInSeconds(start, now);

      if (diff <= 0) {
        setIsReadyToStart(true);
        setTimeLeft(0);
        clearInterval(timer);
      } else {
        setIsReadyToStart(false);
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // Actions
  const startQuiz = async () => {
    try {
      await api.post(endpoints.quiz.startLive(quizId));
      toast.success("Quiz Started Live!");
      fetchQuiz(); // Refresh to get active status
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start");
    }
  };

  const endQuiz = async () => {
    try {
      await api.post(endpoints.quiz.endLive(quizId));
      toast.success("Quiz Ended");
      fetchQuiz();
    } catch (err) {
      toast.error("Failed to end");
    }
  };

  // Feature: "Start Now" (Reschedules start time to current time)
  const handleRescheduleNow = async () => {
    if (
      !window.confirm("This will update the quiz start time to NOW. Continue?")
    )
      return;

    try {
      // Set start time to 5 seconds ago to ensure it's valid
      const now = new Date();
      now.setSeconds(now.getSeconds() - 5);

      await api.put(endpoints.quiz.update(quizId), {
        startTime: now.toISOString(),
      });

      toast.success("Rescheduled to now!");
      fetchQuiz(); // Refresh data to update timer
    } catch (err) {
      toast.error("Failed to reschedule");
    }
  };

  if (!quiz) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-2">{quiz.title}</h1>

      {/* Code Display */}
      <div className="flex flex-col items-center my-8">
        <span className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-2">
          Join Code
        </span>
        <div className="text-6xl font-mono font-bold text-blue-600 bg-blue-50 px-8 py-4 rounded-2xl border-2 border-blue-100 shadow-sm tracking-wider">
          {quiz.code}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center">
          <Users className="w-8 h-8 text-purple-500 mb-2" />
          <h3 className="text-2xl font-bold">
            {quiz.participants?.length || 0}
          </h3>
          <p className="text-gray-500 text-sm">Participants Joined</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center">
          <div
            className={`w-3 h-3 rounded-full mb-4 ${
              quiz.status === "active"
                ? "bg-green-500 animate-pulse"
                : quiz.status === "completed"
                ? "bg-gray-400"
                : "bg-yellow-500"
            }`}
          />
          <p className="font-bold capitalize text-lg">{quiz.status}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center justify-center">
          <Clock className="w-8 h-8 text-blue-500 mb-2" />
          {quiz.status === "scheduled" ? (
            timeLeft > 0 ? (
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-blue-600">
                  {formatTime(timeLeft)}
                </p>
                <p className="text-xs text-gray-400">until start</p>
              </div>
            ) : (
              <span className="text-green-600 font-bold">Ready to Start!</span>
            )
          ) : (
            <span className="text-gray-500">
              {quiz.status === "active" ? "Quiz in Progress" : "Quiz Ended"}
            </span>
          )}
        </div>
      </div>

      {/* Control Area */}
      <div className="flex flex-col items-center gap-4">
        {/* === NEW BUTTON ADDED HERE === */}
        {(quiz.status === "active" || quiz.status === "completed") && (
          <button
            onClick={() => navigate(`/host/live-dashboard/${quizId}`)}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl text-xl font-bold hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all mb-4"
          >
            <BarChart2 /> View Live Leaderboard
          </button>
        )}

        {/* Scheduled State Controls */}
        {quiz.status === "scheduled" && (
          <div className="space-y-4 w-full max-w-md">
            {/* Start Button - Disabled if timer > 0 */}
            <button
              onClick={startQuiz}
              disabled={!isReadyToStart}
              className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xl font-bold shadow-lg transition-all ${
                isReadyToStart
                  ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-green-200"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Play fill="currentColor" />
              {isReadyToStart ? "Start Quiz Live" : `Wait for Timer`}
            </button>

            {/* Reschedule Options */}
            {!isReadyToStart && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800 mb-3">
                  Don't want to wait?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRescheduleNow}
                    className="flex-1 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg font-medium hover:bg-blue-50 transition text-sm"
                  >
                    Start Immediately
                  </button>
                  <button
                    onClick={() => navigate(`/host/edit/${quizId}`)}
                    className="flex-1 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition text-sm flex items-center justify-center gap-2"
                  >
                    <Edit size={14} /> Edit Time
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active State Controls */}
        {quiz.status === "active" && (
          <button
            onClick={endQuiz}
            className="flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-xl text-xl font-bold hover:bg-red-700 shadow-lg hover:shadow-red-200 transition-all"
          >
            <StopCircle /> End Quiz
          </button>
        )}

        {/* Completed State */}
        {quiz.status === "completed" && (
          <button
            onClick={() => navigate(`/result/${quizId}`)}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            View Final Results
          </button>
        )}
      </div>
    </div>
  );
}
