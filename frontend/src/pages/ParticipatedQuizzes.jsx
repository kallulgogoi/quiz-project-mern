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
  Search,
  Filter,
  ArrowUp, // Added ArrowUp icon
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function ParticipatedQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false); // State for scroll button
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
        console.error(err);
        toast.error("Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // --- SCROLL TO TOP LOGIC ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // stats
  const stats = useMemo(() => {
    const totalTaken = quizzes.length;
    const totalScore = quizzes.reduce(
      (acc, curr) => acc + (curr.score || 0),
      0
    );
    const avgScore = totalTaken > 0 ? Math.round(totalScore / totalTaken) : 0;
    const numericRanks = quizzes
      .map((q) => q.rank)
      .filter((r) => typeof r === "number");
    const bestRank = numericRanks.length > 0 ? Math.min(...numericRanks) : "-";

    return { totalTaken, avgScore, bestRank };
  }, [quizzes]);

  //  FILTERING
  const filteredQuizzes = quizzes.filter((q) =>
    q.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 relative">
      <div className="max-w-5xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-3 bg-white hover:bg-gray-100 rounded-xl text-gray-500 shadow-sm border border-gray-200 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">History</h1>
              <p className="text-gray-500 text-sm">Your past results</p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by quiz title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm font-medium shadow-sm"
              />
            </div>
            <button
              onClick={() => navigate("/join")}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition font-bold shadow-lg shadow-gray-200 text-sm whitespace-nowrap"
            >
              Join New
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            icon={<Target size={24} />}
            label="Quizzes"
            value={stats.totalTaken}
            color="blue"
          />
          <StatCard
            icon={<BarChart2 size={24} />}
            label="Avg Score"
            value={`${stats.avgScore}`}
            color="green"
          />
          <StatCard
            icon={<Trophy size={24} />}
            label="Best Rank"
            value={stats.bestRank === "-" ? "-" : `#${stats.bestRank}`}
            color="yellow"
          />
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
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              No results found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? `No matches for "${searchTerm}"`
                : "You haven't participated in any quizzes yet."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate("/join")}
                className="text-indigo-600 font-bold hover:underline"
              >
                Join a Quiz
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredQuizzes.map((quiz) => (
              <QuizCard key={quiz._id} quiz={quiz} navigate={navigate} />
            ))}
          </div>
        )}
      </div>

      {/* SCROLL TO TOP BUTTON*/}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3.5 bg-gray-900 text-white rounded-full shadow-2xl hover:bg-black hover:scale-110 transition-all duration-300 z-50 animate-bounce"
          title="Scroll to Top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}

// Helper Components

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
  };

  return (
    <div
      className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 ${colors[
        color
      ].replace("bg-", "hover:border-")}`}
    >
      <div
        className={`p-3 rounded-xl ${colors[color].split(" ")[0]} ${
          colors[color].split(" ")[1]
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
          {label}
        </p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
}

function QuizCard({ quiz, navigate }) {
  // Safe Date Parsing
  let dateStr = "N/A";
  let timeStr = "";

  if (quiz.dateTaken) {
    try {
      const date = new Date(quiz.dateTaken);
      dateStr = format(date, "dd MMM, yyyy");
      timeStr = format(date, "h:mm a");
    } catch (e) {
      dateStr = "Invalid Date";
    }
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Icon & Title */}
        <div className="flex items-start gap-4 flex-1">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              quiz.completed
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {quiz.completed ? <CheckCircle2 size={24} /> : <Clock size={24} />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors truncate">
                {quiz.title}
              </h3>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wide shrink-0 ${
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

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                <span>{dateStr}</span>
              </div>
              {timeStr && (
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" />
                  <span>{timeStr}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mini Stats */}
        <div className="flex gap-3 self-start lg:self-center w-full lg:w-auto">
          <div className="flex-1 lg:w-32 bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
              Score
            </div>
            <div className="font-bold text-lg text-indigo-600">
              {quiz.score}
            </div>
          </div>
          <div className="flex-1 lg:w-32 bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
              Rank
            </div>
            <div className="font-bold text-lg text-gray-800 flex items-center justify-center gap-1">
              {quiz.rank === 1 && (
                <Medal size={16} className="text-yellow-500" />
              )}
              {quiz.rank ? `#${quiz.rank}` : "-"}
            </div>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => navigate(`/attempt/${quiz._id}`)}
          className="w-full lg:w-auto px-6 py-3 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition flex items-center justify-center gap-2 whitespace-nowrap lg:self-center"
        >
          View Report <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
