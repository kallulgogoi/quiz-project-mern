import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import {
  Trophy,
  Medal,
  Home,
  Crown,
  Search,
  User,
  ArrowLeft,
  Clock,
  Award,
  BarChart3,
  Users,
  Target,
  Sparkles,
  ChevronRight,
  Timer,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { TrophySpin } from "react-loading-indicators";

export default function Result() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();

  const [leaderboard, setLeaderboard] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Waiting Room State
  const [isWaiting, setIsWaiting] = useState(false);
  const [targetEndTime, setTargetEndTime] = useState(null);
  const [countdown, setCountdown] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lbRes, quizRes] = await Promise.all([
        api.get(endpoints.quiz.leaderboard(quizId)),
        api.get(endpoints.quiz.getById(quizId)),
      ]);

      setLeaderboard(lbRes.data.leaderboard || []);
      setQuiz(quizRes.data.quiz);
      setIsWaiting(false);
    } catch (err) {
      // Catch the 403 Early Access Error from Backend
      if (
        err.response?.status === 403 &&
        err.response?.data?.isAvailable === false
      ) {
        setIsWaiting(true);
        setTargetEndTime(new Date(err.response.data.endTime));
      } else {
        console.error("Failed to load data", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for Host Ending the Quiz Live
    if (socket) {
      socket.emit("join-quiz-room", quizId);
      socket.on("quiz-ended", () => {
        fetchData(); // Refresh immediately when host ends it
      });
    }

    return () => {
      if (socket) socket.off("quiz-ended");
    };
  }, [quizId, socket]);

  // Countdown Timer Effect
  useEffect(() => {
    if (!isWaiting || !targetEndTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetEndTime - now;

      if (diff <= 0) {
        clearInterval(timer);
        setCountdown("00:00");
        fetchData(); // Time is up, fetch the real leaderboard!
      } else {
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setCountdown(`${m}:${s.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isWaiting, targetEndTime]);

  const isHost = useMemo(() => {
    if (!quiz || !user) return false;
    const hostId = quiz.host._id || quiz.host;
    return hostId === user._id || hostId === user.id;
  }, [quiz, user]);

  const myResult = useMemo(() => {
    if (!user || leaderboard.length === 0) return null;
    const index = leaderboard.findIndex(
      (entry) => entry.user?._id === user._id || entry.user?._id === user.id,
    );
    if (index === -1) return null;
    return { ...leaderboard[index], rank: index + 1 };
  }, [leaderboard, user]);

  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.user?.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-200">
            <Crown size={20} className="text-white" />
          </div>
        );
      case 1:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center shadow-md shadow-slate-200">
            <Medal size={20} className="text-white" />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
            <Award size={20} className="text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
            <span className="text-sm font-semibold text-gray-600">
              #{index + 1}
            </span>
          </div>
        );
    }
  };

  const getTopPerformers = () => {
    if (leaderboard.length === 0) return null;
    const top3 = leaderboard.slice(0, 3);
    const totalScore = leaderboard.reduce(
      (acc, curr) => acc + curr.totalScore,
      0,
    );
    const averageScore = Math.round(totalScore / leaderboard.length);

    return { top3, averageScore };
  };

  const stats = getTopPerformers();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="text-center">
          <TrophySpin color="#4f46e5" size="medium" text="" textColor="" />
          <p className="mt-4 text-sm text-gray-500 font-medium">
            Loading results...
          </p>
        </div>
      </div>
    );

  // RENDER WAITING ROOM UI
  if (isWaiting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50 p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="p-8 md:p-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-100">
                <Timer size={36} className="text-indigo-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Quiz Completed
              </h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                You've finished early! The leaderboard will be revealed once the
                quiz period ends.
              </p>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-100 mb-6">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">
                  Results Available In
                </p>
                <div className="text-5xl font-mono font-bold text-gray-900 tracking-wider">
                  {countdown}
                </div>
              </div>

              <Link
                to="/participated-quizzes"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Home size={18} />
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to={isHost ? "/created-quizzes" : "/participated-quizzes"}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                    <Trophy size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {quiz?.title || "Quiz Results"}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Users size={14} className="text-gray-400" />
                      <p className="text-sm text-gray-500">
                        {leaderboard.length}{" "}
                        {leaderboard.length === 1
                          ? "Participant"
                          : "Participants"}{" "}
                        Completed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {stats && (
                <div className="shrink-0">
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Average Score
                    </p>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">
                      {stats.averageScore}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* My Result Card */}
            {myResult && !isHost && (
              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                      <span className="text-2xl font-bold text-white">
                        #{myResult.rank}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                        Your Performance
                      </p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900 tabular-nums">
                          {myResult.totalScore}
                        </h3>
                        <span className="text-sm text-gray-500 font-medium">
                          points
                        </span>
                      </div>
                      {myResult.rank <= 3 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Sparkles size={14} className="text-amber-500" />
                          <span className="text-xs font-medium text-amber-600">
                            Top {myResult.rank} Finish
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/attempt/${quizId}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded-xl shadow-sm border border-indigo-200 hover:bg-indigo-50 hover:shadow transition-all duration-200 group"
                  >
                    <BarChart3 size={16} />
                    View Detailed Analysis
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top 3 Podium */}
        {stats && stats.top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            {/* 2nd Place */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 text-center transform translate-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                <Medal size={20} className="text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                2nd Place
              </p>
              <p className="font-semibold text-gray-900 truncate text-sm mb-1">
                {stats.top3[1]?.user?.username || "Anonymous"}
              </p>
              <p className="text-lg font-bold text-gray-900 tabular-nums">
                {stats.top3[1]?.totalScore || 0}
              </p>
            </div>

            {/* 1st Place */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center transform -translate-y-2">
              <div className="relative">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                  <Crown size={20} className="text-amber-500 fill-amber-500" />
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-200">
                  <Trophy size={22} className="text-white" />
                </div>
              </div>
              <p className="text-xs font-semibold text-amber-600 mb-1">
                1st Place
              </p>
              <p className="font-semibold text-gray-900 truncate text-sm mb-1">
                {stats.top3[0]?.user?.username || "Anonymous"}
              </p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">
                {stats.top3[0]?.totalScore || 0}
              </p>
            </div>

            {/* 3rd Place */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 text-center transform translate-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                <Award size={20} className="text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                3rd Place
              </p>
              <p className="font-semibold text-gray-900 truncate text-sm mb-1">
                {stats.top3[2]?.user?.username || "Anonymous"}
              </p>
              <p className="text-lg font-bold text-gray-900 tabular-nums">
                {stats.top3[2]?.totalScore || 0}
              </p>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-indigo-600" />
                <h2 className="font-semibold text-gray-900">
                  Complete Rankings
                </h2>
              </div>

              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search participant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredLeaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">
                  No participants found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search
                </p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {filteredLeaderboard.map((entry, idx) => {
                  const rawName = entry.user?.username || "Anonymous";
                  const isMe = entry.user?._id === user?._id;
                  const originalIndex = leaderboard.findIndex(
                    (lb) => lb.user?._id === entry.user?._id,
                  );

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 transition-all duration-200 ${
                        isMe
                          ? "bg-indigo-50/30 border-l-4 border-l-indigo-500"
                          : ""
                      }`}
                    >
                      <div className="shrink-0">
                        {getRankIcon(originalIndex)}
                      </div>

                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            {entry.user?.profilePicture ? (
                              <img
                                src={entry.user.profilePicture}
                                alt={rawName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={18} className="text-gray-500" />
                            )}
                          </div>
                          {isMe && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center ring-2 ring-white">
                              <CheckCircle2 size={10} className="text-white" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-semibold truncate ${
                                isMe ? "text-indigo-700" : "text-gray-900"
                              }`}
                            >
                              {rawName}
                            </h3>
                            {isMe && (
                              <span className="shrink-0 text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                YOU
                              </span>
                            )}
                            {originalIndex === 0 && !isMe && (
                              <span className="shrink-0 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                WINNER
                              </span>
                            )}
                          </div>
                          {/* <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Timer size={12} />
                              {entry.timeTaken || '—'}s
                            </span>
                          </div> */}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`text-xl font-bold tabular-nums ${
                            isMe ? "text-indigo-700" : "text-gray-900"
                          }`}
                        >
                          {entry.totalScore}
                        </div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          PTS
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pb-8 text-center">
          <Link
            to={isHost ? "/created-quizzes" : "/participated-quizzes"}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            <Home size={18} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
