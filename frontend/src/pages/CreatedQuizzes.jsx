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
} from "lucide-react";
import toast from "react-hot-toast";

export default function CreatedQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(endpoints.quiz.myQuizzes("created"));
        setQuizzes(data.quizzes);
      } catch (err) {
        toast.error("Failed to fetch quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleDelete = async (quizId) => {
    if (!window.confirm("Delete this quiz? This cannot be undone.")) return;
    try {
      await api.delete(endpoints.quiz.delete(quizId));
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2.5 bg-white hover:bg-gray-100 rounded-xl text-gray-500 shadow-sm border border-gray-200 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                My Hosted Quizzes
              </h1>
              <p className="text-gray-500 text-sm">
                Create, manage, and analyze
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/create")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-md shadow-indigo-200"
          >
            <Plus size={20} /> Create New
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No quizzes yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first quiz to get started!
            </p>
            <button
              onClick={() => navigate("/create")}
              className="text-indigo-600 font-bold hover:underline"
            >
              Create Now
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Status Bar */}
                <div
                  className={`h-2 w-full ${
                    quiz.status === "active"
                      ? "bg-green-500"
                      : quiz.status === "completed"
                      ? "bg-gray-400"
                      : "bg-blue-500"
                  }`}
                />

                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wide ${
                        quiz.status === "active"
                          ? "bg-green-100 text-green-700"
                          : quiz.status === "completed"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {quiz.status}
                    </span>
                    <div className="flex items-center text-gray-400 text-xs font-medium bg-gray-50 px-2 py-1 rounded-md">
                      <Users size={12} className="mr-1" />
                      {quiz.participants?.length || 0}
                    </div>
                  </div>

                  <h3
                    className="text-xl font-bold text-gray-800 mb-2 line-clamp-1"
                    title={quiz.title}
                  >
                    {quiz.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Calendar size={14} />
                    <span>{new Date(quiz.startTime).toLocaleDateString()}</span>
                  </div>

                  {/* Join Code Box */}
                  <div
                    onClick={() => copyCode(quiz.code)}
                    className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition group/code"
                  >
                    <div className="text-xs text-gray-500 uppercase font-semibold">
                      Join Code
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-gray-800">
                        {quiz.code}
                      </span>
                      <Copy
                        size={14}
                        className="text-gray-400 group-hover/code:text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2">
                  <button
                    onClick={() => navigate(`/host/edit/${quiz._id}`)}
                    className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2"
                  >
                    <Edit size={16} /> Edit
                  </button>

                  {/* Logic for the secondary button */}
                  {quiz.status === "scheduled" ? (
                    <button
                      onClick={() => navigate(`/host/live/${quiz._id}`)}
                      className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Play size={16} fill="currentColor" /> Host
                    </button>
                  ) : quiz.status === "active" ? (
                    <button
                      onClick={() =>
                        navigate(`/host/live-dashboard/${quiz._id}`)
                      }
                      className="flex-1 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-sm animate-pulse"
                    >
                      <BarChart2 size={16} /> Live
                    </button>
                  ) : (
                    // FOR COMPLETED QUIZZES: Show "View Results"
                    <button
                      onClick={() => navigate(`/result/${quiz._id}`)}
                      className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-2"
                    >
                      <BarChart2 size={16} /> Results
                    </button>
                  )}

                  {quiz.status === "scheduled" && (
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
                      title="Delete Quiz"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
