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
  Zap,
  Award,
  BarChart3,
  Medal,
  TrendingUp,
  CheckCircle2,
  User,
  Sparkles,
  Globe,
  Timer,
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
        0,
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
          ].slice(0, 5),
        );

        fetchLeaderboard();
        toast.success(`${data.username} finished with ${data.score} pts!`);
      });
    }

    return () => {
      if (socket) socket.off("leaderboard-update");
    };
  }, [quizId, socket]);

  const getRankStyle = (index) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-200/50 ring-1 ring-amber-300";
      case 1:
        return "bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-md shadow-slate-200/50 ring-1 ring-slate-300";
      case 2:
        return "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-200/50 ring-1 ring-orange-300";
      default:
        return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy size={14} className="text-amber-100" />;
      case 1:
        return <Medal size={14} className="text-slate-100" />;
      case 2:
        return <Award size={14} className="text-orange-100" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate(`/host/live/${quizId}`)}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-900 hover:shadow-sm group"
                aria-label="Back to live quiz"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                    Live Leaderboard
                  </h1>
                  <p className="text-sm text-gray-500 font-medium truncate max-w-md">
                    {quizTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section - Stats */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50/80 rounded-xl border border-indigo-100">
                <Users size={16} className="text-indigo-600" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.completed}
                  </span>
                  <span className="text-xs text-gray-500">/</span>
                  <span className="text-sm font-medium text-gray-600">
                    {stats.totalParticipants}
                  </span>
                </div>
                <span className="text-xs text-gray-400 ml-1">completed</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50/80 rounded-xl border border-amber-100">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <span className="text-sm font-semibold text-gray-900">
                  {stats.avgScore}
                </span>
                <span className="text-xs text-gray-400">avg score</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              {/* Leaderboard Header */}
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Trophy size={18} className="text-white" />
                    </div>
                    <h2 className="font-semibold text-lg text-gray-900">
                      Rankings
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                      Live Updates
                    </span>
                  </div>
                </div>
              </div>

              {/* Leaderboard Content */}
              <div className="divide-y divide-gray-100">
                {leaderboard.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Timer size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      Waiting for participants
                    </h3>
                    <p className="text-sm text-gray-500">
                      Results will appear here as participants complete the quiz
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto">
                    {leaderboard.map((entry, idx) => (
                      <div
                        key={idx}
                        className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/80 transition-all duration-200"
                      >
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12">
                          <div
                            className={`
                              w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold
                              transition-all duration-200
                              ${getRankStyle(idx)}
                            `}
                          >
                            {idx < 3 ? (
                              <div className="flex items-center gap-0.5">
                                {getRankIcon(idx)}
                                <span className="text-sm">{idx + 1}</span>
                              </div>
                            ) : (
                              <span className="text-sm font-semibold">
                                {idx + 1}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Participant Info */}
                        <div className="flex-1 flex items-center gap-3 min-w-0">
                          <div className="relative">
                            <img
                              src={
                                entry.user?.profilePicture
                                  ? entry.user.profilePicture
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      entry.user?.username || "User",
                                    )}&background=4F46E5&color=fff&bold=true&length=2`
                              }
                              onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  entry.user?.username || "User",
                                )}&background=4F46E5&color=fff&bold=true&length=2`;
                              }}
                              alt={entry.user?.username || "Participant"}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                            />
                            {idx === 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center ring-2 ring-white">
                                <Sparkles size={10} className="text-white" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {entry.user?.username || "Anonymous"}
                              </h3>
                              {idx === 0 && (
                                <span className="shrink-0 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                  #1
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right shrink-0">
                          <div className="text-xl font-bold text-gray-900 tabular-nums">
                            {entry.totalScore}
                          </div>
                          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            PTS
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Stats */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Activity size={16} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                {recentActivity.length > 0 && (
                  <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    Live
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Globe size={20} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500">
                      No recent activity yet
                    </p>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 animate-slide-in"
                      style={{
                        animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">
                            {activity.username}
                          </span>
                          <span className="text-gray-500">
                            {" "}
                            completed the quiz
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.time.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-100">
                          <TrendingUp size={12} />
                          {activity.score}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Zap size={14} className="text-white" />
                  </div>
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                    Highest Score
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">
                  {leaderboard.length > 0
                    ? Math.max(...leaderboard.map((l) => l.totalScore || 0))
                    : "--"}
                </p>
                <p className="text-xs text-purple-600 mt-2 font-medium">
                  Top performer
                </p>
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-gray-500" />
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Participation Overview
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-semibold text-gray-900">
                      {stats.totalParticipants > 0
                        ? Math.round(
                            (stats.completed / stats.totalParticipants) * 100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats.totalParticipants > 0
                            ? (stats.completed / stats.totalParticipants) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total Participants
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {stats.totalParticipants}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-lg font-semibold text-emerald-600">
                      {stats.completed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="text-lg font-semibold text-amber-600">
                      {stats.totalParticipants - stats.completed}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
