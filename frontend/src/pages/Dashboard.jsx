import { useEffect, useState, useMemo } from "react";
import api, { endpoints } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Play,
  BarChart2,
  Users,
  Trophy,
  Target,
  Clock,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("created");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(endpoints.quiz.myQuizzes(activeTab));
        setQuizzes(data.quizzes);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [activeTab]);

  // Handle Delete Quiz
  const handleDelete = async (quizId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(endpoints.quiz.delete(quizId));
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      toast.success("Quiz deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete quiz");
    }
  };

  // Calculate Stats
  const stats = useMemo(() => {
    if (activeTab === "created") {
      const totalQuizzes = quizzes.length;
      const totalParticipants = quizzes.reduce(
        (acc, curr) => acc + (curr.participants?.length || 0),
        0
      );
      return [
        {
          label: "Quizzes Created",
          value: totalQuizzes,
          icon: <BarChart2 size={24} className="text-blue-600" />,
          color: "bg-blue-100",
        },
        {
          label: "Total Participants",
          value: totalParticipants,
          icon: <Users size={24} className="text-purple-600" />,
          color: "bg-purple-100",
        },
      ];
    } else {
      const totalTaken = quizzes.length;
      const totalScore = quizzes.reduce(
        (acc, curr) => acc + (curr.score || 0),
        0
      );
      const avgScore = totalTaken > 0 ? Math.round(totalScore / totalTaken) : 0;
      const bestRank =
        quizzes.length > 0
          ? Math.min(...quizzes.map((q) => q.rank || 999))
          : "-";

      return [
        {
          label: "Quizzes Taken",
          value: totalTaken,
          icon: <Target size={24} className="text-blue-600" />,
          color: "bg-blue-100",
        },
        {
          label: "Average Score",
          value: avgScore,
          icon: <BarChart2 size={24} className="text-green-600" />,
          color: "bg-green-100",
        },
        {
          label: "Best Rank",
          value: bestRank === 999 ? "-" : `#${bestRank}`,
          icon: <Trophy size={24} className="text-yellow-600" />,
          color: "bg-yellow-100",
        },
      ];
    }
  }, [quizzes, activeTab]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.username}
          </h1>
          <p className="text-gray-500 mt-1">
            Here's an overview of your quiz activity
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate("/join")}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition"
          >
            Join Quiz
          </button>
          <button
            onClick={() => navigate("/create")}
            className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition"
          >
            <Plus size={20} /> Create
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className={`grid grid-cols-2 ${
          activeTab === "participated" ? "md:grid-cols-3" : "md:grid-cols-2"
        } gap-4 mb-8`}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        <button
          className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
            activeTab === "created"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("created")}
        >
          Created Quizzes
        </button>
        <button
          className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
            activeTab === "participated"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("participated")}
        >
          Participated
        </button>
      </div>

      {/* Quiz Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading quizzes...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No quizzes found
          </h3>
          <p className="text-gray-500 mt-1 mb-6">
            You haven't {activeTab} any quizzes yet.
          </p>
          {activeTab === "created" ? (
            <button
              onClick={() => navigate("/create")}
              className="text-blue-600 font-medium hover:underline"
            >
              Create your first quiz
            </button>
          ) : (
            <button
              onClick={() => navigate("/join")}
              className="text-blue-600 font-medium hover:underline"
            >
              Join a quiz
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3
                    className="text-lg font-bold text-gray-800 line-clamp-1"
                    title={quiz.title}
                  >
                    {quiz.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Clock size={12} />
                    <span>{new Date(quiz.startTime).toLocaleDateString()}</span>
                  </div>
                </div>
                {activeTab === "created" && (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      quiz.status === "completed"
                        ? "bg-gray-100 text-gray-600"
                        : quiz.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {quiz.status}
                  </span>
                )}
              </div>

              {activeTab === "created" ? (
                <>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Code:</span>
                    <span className="font-mono font-bold text-gray-800 tracking-wider bg-white px-2 py-0.5 rounded border">
                      {quiz.code}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/host/edit/${quiz._id}`)}
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => navigate(`/host/live/${quiz._id}`)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex justify-center items-center gap-2 transition"
                    >
                      <Play size={14} /> Host
                    </button>

                    {/* Delete Button - Only shown if quiz is scheduled (not active/completed) */}
                    {quiz.status === "scheduled" && (
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className="px-3 py-2 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-200 transition"
                        title="Delete Quiz"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Score
                    </p>
                    <p className="font-bold text-lg text-blue-600">
                      {quiz.score}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Rank
                    </p>
                    <div className="flex items-center justify-end gap-1">
                      {quiz.rank === 1 && (
                        <Trophy size={16} className="text-yellow-500" />
                      )}
                      <p className="font-bold text-lg text-gray-800">
                        #{quiz.rank}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
