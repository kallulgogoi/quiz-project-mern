import { useEffect, useState, useMemo } from "react";
import api, { endpoints } from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Medal,
  Calendar,
  Clock,
  Target,
  Trophy,
  BarChart2,
  CheckCircle2,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ParticipatedQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          endpoints.quiz.myQuizzes("participated")
        );
        setQuizzes(data.quizzes);
      } catch (err) {
        toast.error("Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // --- RESTORED FUNCTIONALITY: Stats Calculation ---
  const stats = useMemo(() => {
    const totalTaken = quizzes.length;
    const totalScore = quizzes.reduce(
      (acc, curr) => acc + (curr.score || 0),
      0
    );
    const avgScore = totalTaken > 0 ? Math.round(totalScore / totalTaken) : 0;

    // Filter out non-numeric ranks for best rank calc
    const numericRanks = quizzes
      .map((q) => q.rank)
      .filter((r) => typeof r === "number");

    const bestRank = numericRanks.length > 0 ? Math.min(...numericRanks) : "-";

    return { totalTaken, avgScore, bestRank };
  }, [quizzes]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-3 bg-white hover:bg-gray-100 rounded-xl text-gray-500 shadow-sm border border-gray-200 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Participation History
              </h1>
              <p className="text-gray-500 text-sm">
                Your past attempts and performance
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/join")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition font-bold shadow-lg shadow-gray-200"
          >
            Join New Quiz
          </button>
        </div>

        {/* Stats Overview (Restored) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Quizzes Taken</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.totalTaken}
              </h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <BarChart2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Average Score</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.avgScore} pts
              </h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Best Rank</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.bestRank === "-" ? "-" : `#${stats.bestRank}`}
              </h3>
            </div>
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No attempts yet</h3>
            <p className="text-gray-500 mb-6">
              Join a quiz to start building your history!
            </p>
            <button
              onClick={() => navigate("/join")}
              className="text-pink-600 font-bold hover:underline"
            >
              Join a Quiz
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-pink-200 transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-pink-600 transition-colors line-clamp-1">
                        {quiz.title}
                      </h3>
                      {/* Original Status Logic Preserved */}
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wide ${
                          quiz.status === "completed"
                            ? "bg-gray-100 text-gray-600"
                            : quiz.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {quiz.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>
                          {new Date(quiz.dateTaken).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>
                          {new Date(quiz.dateTaken).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Rank Stats */}
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-[100px] bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                      <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">
                        Score
                      </div>
                      <div className="font-bold text-xl text-blue-700">
                        {quiz.score}
                      </div>
                    </div>
                    <div className="flex-1 min-w-[100px] bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
                      <div className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider mb-1">
                        Rank
                      </div>
                      <div className="font-bold text-xl text-yellow-700 flex items-center justify-center gap-1">
                        {quiz.rank === 1 && <Medal size={16} />}
                        {quiz.rank ? `#${quiz.rank}` : "-"}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/attempt/${quiz._id}`)}
                    className="w-full lg:w-auto px-6 py-3 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:border-pink-600 hover:text-pink-600 transition flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    View Report <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
