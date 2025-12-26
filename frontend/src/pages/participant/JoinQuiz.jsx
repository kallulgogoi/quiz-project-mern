import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import toast from "react-hot-toast";

export default function JoinQuiz() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(endpoints.quiz.join, { code });
      toast.success("Joined successfully!");
      // Navigate to lobby with the quiz ID returned
      navigate(`/lobby/${data.quiz.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join quiz");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          Join Quiz
        </h1>
        <p className="text-gray-500 mb-8">Enter the code shared by your host</p>

        <form onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="CODE"
            maxLength={6}
            className="w-full p-4 text-center text-3xl font-mono uppercase tracking-widest border-2 border-gray-200 rounded-xl mb-6 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <button
            disabled={code.length < 6}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-200"
          >
            Enter Quiz
          </button>
        </form>
      </div>
    </div>
  );
}
