import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { useSocket } from "../../context/SocketContext";
import {
  Trophy,
  Users,
  ArrowLeft,
  Activity,
  Star,
  Clock,
  Zap,
  Target,
} from "lucide-react";
import toast from "react-hot-toast";

export default function LiveLeaderboard() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    completed: 0,
    avgScore: 0,
  });
  const [quizTitle, setQuizTitle] = useState("Loading Quiz...");
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get(endpoints.quiz.leaderboard(quizId));
      setLeaderboard(data.leaderboard);

      const completed = data.leaderboard.length;
      const totalScore = data.leaderboard.reduce(
        (acc, curr) => acc + curr.totalScore,
        0
      );
      const avg = completed ? Math.round(totalScore / completed) : 0;

      setStats((prev) => ({ ...prev, completed, avgScore: avg }));
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    }
  };

  const fetchQuizDetails = async () => {
    try {
      const { data } = await api.get(endpoints.quiz.getById(quizId));
      setQuizTitle(data.quiz.title);
      setStats((prev) => ({
        ...prev,
        totalParticipants: data.quiz.participants.length,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuizDetails();
    fetchLeaderboard();

    if (socket) {
      socket.emit("join-quiz", quizId);

      socket.on("leaderboard-update", (data) => {
        setRecentActivity((prev) =>
          [
            {
              username: data.username,
              score: data.score,
              time: new Date(),
              id: Math.random(),
            },
            ...prev,
          ].slice(0, 5)
        );

        fetchLeaderboard();
        toast.success(`${data.username} finished with ${data.score} pts!`);
      });
    }

    return () => {
      if (socket) socket.off("leaderboard-update");
    };
  }, [quizId, socket]);

  // Helper to determine rank styling
  const getRankStyle = (index) => {
    switch (index) {
      case 0: // Gold
        return "bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-lg shadow-yellow-200 border-yellow-400";
      case 1: // Silver
        return "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-200 border-slate-300";
      case 2: // Bronze
        return "bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-lg shadow-orange-200 border-orange-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* --- Glassmorphism Header --- */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate(`/host/live/${quizId}`)}
              className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-indigo-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <Activity className="text-indigo-600" size={20} />
                Live Dashboard
              </h1>
              <p className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {quizTitle}
              </p>
            </div>
          </div>

          {/* Header Stats Pills */}
          <div className="flex items-center gap-4 text-sm font-medium w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              <Users size={16} />
              <span>
                {stats.completed} / {stats.totalParticipants} Done
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100">
              <Star size={16} className="fill-yellow-500 text-yellow-500" />
              <span>Avg: {stats.avgScore}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 grid lg:grid-cols-3 gap-6 lg:gap-8 mt-4">
        {/* --- Left Column: Leaderboard --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-white to-gray-50">
              <h2 className="font-bold text-xl flex items-center gap-2 text-gray-800">
                <Trophy className="text-yellow-500 fill-yellow-500" />{" "}
                Leaderboard
              </h2>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                  Live
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {leaderboard.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Clock size={40} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Waiting for submissions
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Results will appear here in real-time
                  </p>
                </div>
              ) : (
                leaderboard.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 flex items-center gap-4 hover:bg-gray-50/80 transition-all duration-300 group"
                  >
                    {/* Rank Badge */}
                    <div
                      className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border
                        ${getRankStyle(idx)}
                      `}
                    >
                      {idx + 1}
                    </div>

                    {/* Avatar & User Info */}
                    <div className="flex-1 flex items-center gap-4">
                      <img
                        src={`https://ui-avatars.com/api/?name=${entry.user?.username}&background=random&color=fff&bold=true`}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800 text-base group-hover:text-indigo-600 transition-colors">
                            {entry.user?.username}
                          </h3>
                          {idx === 0 && (
                            <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
                              LEADER
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {entry.timeTaken}s
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-2xl font-black text-gray-800 group-hover:scale-110 transition-transform duration-200">
                        {entry.totalScore}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Points
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {/* Recent Activity Feed */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xl shadow-gray-200/40">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Zap className="text-orange-500 fill-orange-500" size={18} />
              Recent Activity
            </h3>

            <div className="space-y-6 relative">
              {/* Vertical line connecting items */}
              {recentActivity.length > 0 && (
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100 rounded-full" />
              )}

              {recentActivity.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">Quiet for now...</p>
                </div>
              )}

              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 relative z-10 animate-fade-in-up"
                >
                  <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0 text-green-600 shadow-sm">
                    <Trophy size={16} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-bold text-gray-900">
                        {activity.username}
                      </span>{" "}
                      completed the quiz.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs border border-green-100">
                    +{activity.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-blue-500" />
                <p className="text-blue-600 text-xs font-bold uppercase tracking-wide">
                  Accuracy
                </p>
              </div>
              <p className="text-3xl font-black text-blue-900">
                {leaderboard.length > 0 ? "78%" : "--"}
              </p>
              <p className="text-xs text-blue-400 mt-1">Global average</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-100 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-purple-500" />
                <p className="text-purple-600 text-xs font-bold uppercase tracking-wide">
                  Fastest
                </p>
              </div>
              <p className="text-3xl font-black text-purple-900">
                {leaderboard.length > 0
                  ? `${Math.min(...leaderboard.map((l) => l.timeTaken))}s`
                  : "--"}
              </p>
              <p className="text-xs text-purple-400 mt-1">Record time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
