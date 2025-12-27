import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { useSocket } from "../../context/SocketContext";
import { Trophy, Users, ArrowLeft, Activity, Star, Clock } from "lucide-react";
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
  const [quizTitle, setQuizTitle] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get(endpoints.quiz.leaderboard(quizId));
      setLeaderboard(data.leaderboard);

      // Calculate Stats
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

      // Listen for live updates
      socket.on("leaderboard-update", (data) => {
        // Add to recent activity feed
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
        ); // Keep last 5

        // Refresh the main table
        fetchLeaderboard();
        toast(`${data.username} just finished with ${data.score} pts!`, {
          icon: "🚀",
          position: "bottom-right",
        });
      });
    }

    return () => {
      if (socket) socket.off("leaderboard-update");
    };
  }, [quizId, socket]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/host/live/${quizId}`)}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-green-400 animate-pulse" size={20} />
                Live Dashboard
              </h1>
              <p className="text-slate-400 text-sm">{quizTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              <span>
                {stats.completed}/{stats.totalParticipants} Finished
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-400" />
              <span>Avg: {stats.avgScore}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
        {/* Left Column: Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Top Performers
              </h2>
              <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                Live Updates
              </span>
            </div>

            <div className="divide-y divide-slate-700/50">
              {leaderboard.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Clock size={32} />
                  </div>
                  <p>Waiting for results...</p>
                </div>
              ) : (
                leaderboard.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-center gap-4 hover:bg-white/5 transition group"
                  >
                    <div
                      className={`
                      w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                      ${
                        idx === 0
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : idx === 1
                          ? "bg-gray-400/20 text-gray-300 border border-gray-400/30"
                          : idx === 2
                          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          : "bg-slate-700 text-slate-400"
                      }
                    `}
                    >
                      #{idx + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">
                          {entry.user?.username}
                        </h3>
                        {idx === 0 && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 rounded-full border border-yellow-500/20">
                            Leader
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Time: {entry.timeTaken}s</span>
                        <span>•</span>
                        <span>Finished just now</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                        {entry.totalScore}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">
                        Points
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity & Quick Stats */}
        <div className="space-y-6">
          {/* Recent Feed */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h3 className="font-bold text-slate-300 mb-4 text-sm uppercase tracking-wider">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.length === 0 && (
                <p className="text-slate-500 text-sm">No recent submissions</p>
              )}
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 animate-fade-in-left"
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-bold text-white">
                        {activity.username}
                      </span>{" "}
                      finished
                    </p>
                    <p className="text-xs text-slate-500">
                      {activity.time.toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="font-mono text-green-400 font-bold">
                    +{activity.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl">
              <p className="text-blue-400 text-xs font-bold uppercase">
                Accuracy
              </p>
              <p className="text-2xl font-bold text-blue-100 mt-1">
                {leaderboard.length > 0 ? "78%" : "-"}
              </p>
            </div>
            <div className="bg-purple-600/10 border border-purple-500/20 p-4 rounded-xl">
              <p className="text-purple-400 text-xs font-bold uppercase">
                Fastest
              </p>
              <p className="text-2xl font-bold text-purple-100 mt-1">
                {leaderboard.length > 0
                  ? `${Math.min(...leaderboard.map((l) => l.timeTaken))}s`
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
