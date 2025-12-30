import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  Trophy,
  Medal,
  Home,
  Crown,
  Search,
  User,
  ArrowLeft,
} from "lucide-react";
import { TrophySpin } from "react-loading-indicators";

export default function Result() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbRes, quizRes] = await Promise.all([
          api.get(endpoints.quiz.leaderboard(quizId)),
          api.get(endpoints.quiz.getById(quizId)),
        ]);

        setLeaderboard(lbRes.data.leaderboard || []);
        setQuiz(quizRes.data.quiz);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);
  const isHost = useMemo(() => {
    if (!quiz || !user) return false;
    const hostId = quiz.host._id || quiz.host;
    return hostId === user._id || hostId === user.id;
  }, [quiz, user]);

  const myResult = useMemo(() => {
    if (!user || leaderboard.length === 0) return null;
    const index = leaderboard.findIndex(
      (entry) => entry.user?._id === user._id || entry.user?._id === user.id
    );
    if (index === -1) return null;
    return { ...leaderboard[index], rank: index + 1 };
  }, [leaderboard, user]);

  // Filter leaderboard
  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.user?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown size={24} className="text-yellow-500 fill-yellow-500" />;
      case 1:
        return <Medal size={24} className="text-gray-400 fill-gray-400" />;
      case 2:
        return <Medal size={24} className="text-amber-600 fill-amber-600" />;
      default:
        return (
          <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
        );
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <TrophySpin color="#4f46e5" size="medium" text="" textColor="" />
      </div>
    );

  return (
    <div className="min-h-screen bg-indigo-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            to={isHost ? "/created-quizzes" : "/participated-quizzes"}
            className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 text-center border border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="inline-flex p-4 bg-yellow-100 rounded-full mb-6 shadow-sm">
            <Trophy size={40} className="text-yellow-600" />
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {quiz?.title || "Quiz"} Results
          </h1>
          <p className="text-gray-500 font-medium">
            {leaderboard.length} Participants Completed
          </p>
          {myResult && !isHost && (
            <div className="mt-8 bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold border-4 border-white shadow-lg">
                  #{myResult.rank}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-indigo-400 uppercase">
                    Your Performance
                  </p>
                  <h3 className="text-2xl font-black text-gray-900">
                    {myResult.totalScore} pts
                  </h3>
                </div>
              </div>
              <Link
                to={`/attempt/${quizId}`}
                className="px-6 py-2.5 bg-white text-indigo-700 font-bold rounded-xl shadow-sm border border-indigo-200 hover:bg-indigo-50 transition"
              >
                View Analysis
              </Link>
            </div>
          )}
        </div>

        {/* Leaderboard List */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Medal className="text-indigo-500" /> Leaderboard
            </h2>
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search player..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredLeaderboard.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No participants found
              </div>
            ) : (
              filteredLeaderboard.map((entry, idx) => {
                const rawName = entry.user?.username || "Anonymous";
                const isMe = entry.user?._id === user?._id;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-5 hover:bg-gray-50 transition ${
                      isMe ? "bg-indigo-50/50" : ""
                    }`}
                  >
                    <div className="w-8 text-center shrink-0">
                      {getRankIcon(idx)}
                    </div>

                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden border border-gray-300">
                        {entry.user?.profilePicture ? (
                          <img
                            src={entry.user.profilePicture}
                            alt="User"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={20} className="text-gray-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-bold truncate ${
                              isMe ? "text-indigo-700" : "text-gray-800"
                            }`}
                          >
                            {rawName}
                          </h3>
                          {isMe && (
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-medium">
                          {entry.timeTaken
                            ? `${Math.round(entry.timeTaken)}s`
                            : "0s"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block text-xl font-bold text-gray-800">
                        {entry.totalScore}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        Points
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="mt-10 text-center pb-10">
          {isHost ? (
            <Link
              to="/created-quizzes"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition shadow-xl hover:scale-105 transform"
            >
              <Home size={20} /> Back to Dashboard
            </Link>
          ) : (
            <Link
              to="/participated-quizzes"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition shadow-xl hover:scale-105 transform"
            >
              <Home size={20} /> Back to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
