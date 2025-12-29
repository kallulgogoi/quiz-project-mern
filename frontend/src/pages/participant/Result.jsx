import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Trophy, Medal, Home, Crown, Search, User } from "lucide-react";
import { TrophySpin } from "react-loading-indicators";
export default function Result() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lbRes = await api.get(endpoints.quiz.leaderboard(quizId));
        setLeaderboard(lbRes.data.leaderboard || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

  const myResult = useMemo(() => {
    if (!user || leaderboard.length === 0) return null;
    const index = leaderboard.findIndex(
      (entry) => entry.user?._id === user._id
    );
    if (index === -1) return null;
    return { ...leaderboard[index], rank: index + 1 };
  }, [leaderboard, user]);

  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter((entry) =>
      (entry.user?.username || "Anonymous")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [leaderboard, searchTerm]);

  const getRankStyle = (index) => {
    if (index === 0) return "from-yellow-400 to-amber-500 shadow-yellow-200";
    if (index === 1) return "from-gray-300 to-gray-400 shadow-gray-200";
    if (index === 2) return "from-orange-400 to-amber-600 shadow-orange-200";
    return "from-blue-500 to-indigo-600 shadow-blue-200";
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-6 h-6 text-white" />;
    if (index < 3) return <Medal className="w-6 h-6 text-white" />;
    return <span className="text-xl text-white font-bold">#{index + 1}</span>;
  };

  // Helper to truncate text
  const truncateName = (name) => {
    if (!name) return "Anonymous";
    return name.length > 8 ? name.substring(0, 8) + ".." : name;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <TrophySpin color="#4f46e5" size="medium" text="" textColor="" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-white rounded-full shadow-md mb-4">
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500">Final Results</p>
        </div>

        {myResult && (
          <div className="bg-indigo-600 rounded-2xl shadow-xl p-6 mb-8 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                #{myResult.rank}
              </div>
              <div>
                <h2 className="text-xl font-bold">Your Ranking</h2>
                <p className="text-indigo-200 text-sm">
                  Well done, {truncateName(user.username)}!
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{myResult.totalScore}</p>
              <p className="text-xs text-indigo-200 uppercase font-bold">
                Points
              </p>
            </div>
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm"
          />
        </div>

        <div className="space-y-3">
          {filteredLeaderboard.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">No participants found.</p>
            </div>
          ) : (
            filteredLeaderboard.map((entry) => {
              const originalRank = leaderboard.findIndex(
                (l) => l._id === entry._id
              );
              const isMe = user && entry.user?._id === user._id;
              const rawName = entry.user?.username || "Anonymous";

              return (
                <div
                  key={entry._id}
                  className={`flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 ${
                    isMe ? "ring-2 ring-indigo-500" : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br shrink-0 mr-4 ${getRankStyle(
                      originalRank
                    )}`}
                  >
                    {getRankIcon(originalRank)}
                  </div>

                  <div className="flex-1 flex items-center min-w-0 mr-4 gap-3">
                    {/* Avatar */}
                    <div className="shrink-0">
                      {entry.user?.profilePicture ? (
                        <img
                          src={entry.user.profilePicture}
                          alt={rawName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-50 shadow-sm">
                          <User size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-bold truncate ${
                            isMe ? "text-indigo-600" : "text-gray-800"
                          }`}
                          title={rawName} // Tooltip shows full name
                        >
                          {truncateName(rawName)}
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

        <div className="mt-10 text-center">
          <Link
            to="/created-quizzes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg"
          >
            <Home size={18} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
