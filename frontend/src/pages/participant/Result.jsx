import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { Trophy, Medal, Home, Crown } from "lucide-react";
import { TrophySpin } from "react-loading-indicators";
export default function Result() {
  const { quizId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lbRes = await api.get(endpoints.quiz.leaderboard(quizId));
        setLeaderboard(lbRes.data.leaderboard || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <TrophySpin color="#23eeff" size="medium" text="" textColor="#0ae6f9" />
        <p className="text-xl text-gray-600">Calculating results...</p>
      </div>
    );
  }

  const getRankStyle = (index) => {
    if (index === 0)
      return "from-yellow-400 to-amber-500 text-yellow-700 shadow-yellow-200";
    if (index === 1)
      return "from-gray-300 to-gray-400 text-gray-700 shadow-gray-200";
    if (index === 2)
      return "from-orange-400 to-amber-600 text-orange-700 shadow-orange-200";
    return "from-blue-500 to-indigo-600 text-blue-700 shadow-blue-200";
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-7 h-7" />;
    if (index === 1 || index === 2) return <Medal className="w-7 h-7" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-6 bg-linear-to-br from-yellow-100 to-amber-100 rounded-full mb-6 shadow-lg">
            <Trophy className="w-16 h-16 text-yellow-600 drop-shadow-md" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Quiz Completed!
          </h1>
          <p className="text-xl text-gray-600">
            See how you and others performed
          </p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {leaderboard.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <p className="text-xl text-gray-500">No results available yet.</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  index < 3 ? "ring-4 ring-opacity-20" : ""
                }`}
              >
                {/* Top 3*/}
                {index < 3 && (
                  <div
                    className={`absolute inset-0 opacity-10 bg-linear-to-r ${
                      getRankStyle(index).split("text-")[0]
                    }`}
                  />
                )}

                <div className="relative flex items-center p-6 gap-6">
                  {/* Rank */}
                  <div className="shrink-0 text-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white shadow-xl bg-linear-to-br ${getRankStyle(
                        index
                      )}`}
                    >
                      {index < 3 ? (
                        getRankIcon(index)
                      ) : (
                        <span className="text-2xl">#{index + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={
                          entry.user?.profilePicture ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            entry.user?.username || "User"
                          )}&background=6366f1&color=fff&bold=true&length=2`
                        }
                        alt={`${entry.user?.username || "User"}'s avatar`}
                        className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-lg"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            entry.user?.username || "User"
                          )}&background=6366f1&color=fff&bold=true&length=2`;
                        }}
                      />
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {entry.user?.username || "Anonymous User"}
                      </h3>
                      <p className="text-sm text-gray-500">Participant</p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-800">
                      {entry.totalScore}
                    </p>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">
                      points
                    </p>
                  </div>
                </div>

                {/* Special glow for top 3 */}
                {index < 3 && (
                  <div
                    className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r opacity-70"
                    style={{
                      backgroundImage: `linear-gradient(to right, transparent, ${
                        getRankStyle(index).includes("yellow")
                          ? "#fbbf24"
                          : getRankStyle(index).includes("gray")
                          ? "#9ca3af"
                          : "#fb923c"
                      }, transparent)`,
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            to="/created-quizzes"
            className="inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <Home size={20} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
