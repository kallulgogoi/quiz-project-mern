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
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Check, // Added Check icon
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function ParticipatedQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false); // New state for custom dropdown
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

  // Stats Logic
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

  // Filtering & Sorting
  const processedQuizzes = useMemo(() => {
    let result = quizzes.filter((q) =>
      q.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      const dateA = new Date(a.dateTaken || 0);
      const dateB = new Date(b.dateTaken || 0);

      if (sortOrder === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    return result;
  }, [quizzes, searchTerm, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 relative">
      <div className="max-w-5xl mx-auto">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between items-start md:items-center">
          {/* Title Section */}
          <div className="flex items-center gap-4 w-full md:w-auto">
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

          {/* Controls Section - Improved Mobile Grid */}
          <div className="w-full md:w-auto grid grid-cols-2 gap-3 md:flex md:items-center">
            {/* Search Input - Forces full width on mobile top row */}
            <div className="relative col-span-2 md:w-64 group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search quiz..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium shadow-sm placeholder-gray-400"
              />
            </div>

            {/* Custom Sort Dropdown - Half width on mobile row 2 */}
            <div className="relative col-span-1 md:w-40">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full flex items-center justify-between pl-3 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  {sortOrder === "newest" ? (
                    <ArrowDown size={16} className="text-gray-500" />
                  ) : (
                    <ArrowUp size={16} className="text-gray-500" />
                  )}
                  <span>{sortOrder === "newest" ? "Newest" : "Oldest"}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 ${
                    isSortOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsSortOpen(false)}
                  ></div>
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={() => {
                        setSortOrder("newest");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        sortOrder === "newest"
                          ? "text-indigo-600 bg-indigo-50/50"
                          : "text-gray-700"
                      }`}
                    >
                      <span>Newest First</span>
                      {sortOrder === "newest" && <Check size={14} />}
                    </button>
                    <div className="h-px bg-gray-100"></div>
                    <button
                      onClick={() => {
                        setSortOrder("oldest");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        sortOrder === "oldest"
                          ? "text-indigo-600 bg-indigo-50/50"
                          : "text-gray-700"
                      }`}
                    >
                      <span>Oldest First</span>
                      {sortOrder === "oldest" && <Check size={14} />}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Join Button - Half width on mobile row 2 */}
            <button
              onClick={() => navigate("/join")}
              className="col-span-1 md:w-auto px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black hover:shadow-lg hover:shadow-gray-300 active:scale-95 transition-all font-bold shadow-md text-sm whitespace-nowrap flex items-center justify-center"
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
        ) : processedQuizzes.length === 0 ? (
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
            {processedQuizzes.map((quiz) => (
              <QuizCard key={quiz._id} quiz={quiz} navigate={navigate} />
            ))}
          </div>
        )}
      </div>

      {/* SCROLL TO TOP BUTTON */}
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

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          <button
            onClick={() => navigate(`/result/${quiz._id}`)}
            className="flex-1 lg:flex-none px-5 py-2.5 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:border-green-600 hover:text-green-600 transition flex items-center justify-center gap-2 text-sm whitespace-nowrap"
          >
            Results <ChevronRight size={16} />
          </button>
          <button
            onClick={() => navigate(`/attempt/${quiz._id}`)}
            className="flex-1 lg:flex-none px-5 py-2.5 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:border-red-600 hover:text-red-600 transition flex items-center justify-center gap-2 text-sm whitespace-nowrap"
          >
            Report <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
