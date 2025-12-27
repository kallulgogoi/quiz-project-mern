import { useEffect, useState } from "react";
import api, { endpoints } from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Play,
  Trash2,
  Calendar,
  Edit,
  ArrowLeft,
  Copy,
  Users,
  BarChart2,
  Search,
  X,
  ArrowUp, // Added ArrowUp icon
} from "lucide-react";
import toast from "react-hot-toast";

export default function CreatedQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false); // State for scroll button
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(endpoints.quiz.myQuizzes("created"));
        setQuizzes(data.quizzes);
        setFilteredQuizzes(data.quizzes);
      } catch (err) {
        toast.error("Failed to fetch quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredQuizzes(quizzes);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = quizzes.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(lowerQuery) ||
          quiz.code.toLowerCase().includes(lowerQuery)
      );
      setFilteredQuizzes(filtered);
    }
  }, [searchQuery, quizzes]);

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
  // ---------------------------

  const handleDelete = async (quizId) => {
    if (!window.confirm("Delete this quiz permanently? This cannot be undone."))
      return;
    try {
      await api.delete(endpoints.quiz.delete(quizId));
      const updated = quizzes.filter((q) => q._id !== quizId);
      setQuizzes(updated);
      setFilteredQuizzes(updated);
      toast.success("Quiz deleted successfully");
    } catch (err) {
      toast.error("Failed to delete quiz");
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Join code copied!");
  };

  const clearSearch = () => setSearchQuery("");

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
              <h1 className="text-2xl font-bold text-gray-800">
                My Hosted Quizzes
              </h1>
              <p className="text-gray-500 text-sm">
                Manage and launch your games
              </p>
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
                placeholder="Search by title or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm font-medium shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => navigate("/create")}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200 text-sm whitespace-nowrap flex items-center gap-2"
            >
              <Plus size={18} /> Create New
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchQuery ? <Search size={32} /> : <Plus size={32} />}
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {searchQuery ? "No quizzes found" : "No quizzes created yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? `No matches for "${searchQuery}". Try a different term.`
                : "Start creating interactive quizzes for your audience!"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate("/create")}
                className="text-indigo-600 font-bold hover:underline"
              >
                Create Now
              </button>
            )}
          </div>
        ) : (
          /* Quiz List */
          <div className="grid gap-4">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group relative"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Status Indicator Bar (Left side) */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${
                      quiz.status === "active"
                        ? "bg-green-500"
                        : quiz.status === "completed"
                        ? "bg-gray-300"
                        : "bg-indigo-500"
                    }`}
                  />

                  {/* Main Info */}
                  <div className="flex-1 pl-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {quiz.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wide shrink-0 ${
                          quiz.status === "active"
                            ? "bg-green-100 text-green-700"
                            : quiz.status === "completed"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {quiz.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span>
                          {new Date(quiz.startTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-gray-400" />
                        <span>{quiz.participants?.length || 0} players</span>
                      </div>
                    </div>
                  </div>

                  {/* Code Box */}
                  <div
                    onClick={() => copyCode(quiz.code)}
                    className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition group/code lg:w-40 justify-between"
                  >
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        Code
                      </p>
                      <p className="font-mono font-bold text-lg text-gray-700">
                        {quiz.code}
                      </p>
                    </div>
                    <Copy
                      size={16}
                      className="text-gray-400 group-hover/code:text-gray-600"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                    <button
                      onClick={() => navigate(`/host/edit/${quiz._id}`)}
                      className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-indigo-600 transition"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>

                    {quiz.status === "scheduled" ? (
                      <button
                        onClick={() => navigate(`/host/live/${quiz._id}`)}
                        className="flex-1 lg:flex-none px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Play size={16} fill="currentColor" /> Host
                      </button>
                    ) : quiz.status === "active" ? (
                      <button
                        onClick={() =>
                          navigate(`/host/live-dashboard/${quiz._id}`)
                        }
                        className="flex-1 lg:flex-none px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-sm animate-pulse"
                      >
                        <BarChart2 size={16} /> Live
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/result/${quiz._id}`)}
                        className="flex-1 lg:flex-none px-5 py-2.5 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition flex items-center justify-center gap-2"
                      >
                        <BarChart2 size={16} /> Results
                      </button>
                    )}

                    {quiz.status === "scheduled" && (
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className="p-2.5 text-red-400 bg-white border border-red-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SCROLL TO TOP BUTTON --- */}
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
