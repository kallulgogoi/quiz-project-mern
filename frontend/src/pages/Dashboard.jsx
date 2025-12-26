import { useEffect, useState } from "react";
import api, { endpoints } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus, Play, BarChart } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("created"); // 'created' or 'participated'
  const [quizzes, setQuizzes] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await api.get(endpoints.quiz.myQuizzes(activeTab));
        setQuizzes(data.quizzes);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuizzes();
  }, [activeTab]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user?.username}
        </h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/join")}
            className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            Join Quiz
          </button>
          <button
            onClick={() => navigate("/create")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 inline-flex"
          >
            <Plus size={20} /> Create Quiz
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-3 font-medium ${
            activeTab === "created"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("created")}
        >
          Created Quizzes
        </button>
        <button
          className={`px-6 py-3 font-medium ${
            activeTab === "participated"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("participated")}
        >
          Participated
        </button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
            <p className="text-gray-500 text-sm mb-4">
              Code:{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {quiz.code}
              </span>
            </p>

            {activeTab === "created" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/host/manage/${quiz._id}`)}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/host/live/${quiz._id}`)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex justify-center items-center gap-2"
                >
                  <Play size={16} /> Host
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                <span>Score: {quiz.score || "N/A"}</span>
                <span className="font-bold">Rank: #{quiz.rank || "-"}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
