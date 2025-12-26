import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { Sparkles, Save, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageQuiz() {
  const { quizId } = useParams();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);

  // AI Generation Handler
  const handleGenerate = async () => {
    if (!topic) return toast.error("Please enter a topic");
    setIsGenerating(true);
    try {
      const { data } = await api.post(endpoints.ai.generate, {
        topic,
        count: 5,
        questionTypes: ["mcq", "fill-blank"],
      });

      // Save directly to DB
      await api.post(endpoints.ai.save(quizId), { questions: data.questions });
      toast.success("Questions generated and saved!");
      window.location.reload(); // Simple reload to fetch new data
    } catch (err) {
      toast.error("Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Questions</h1>

      {/* AI Generator Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100 mb-8">
        <div className="flex items-center gap-2 mb-4 text-purple-700">
          <Sparkles className="w-5 h-5" />
          <h2 className="font-semibold">Generate with AI</h2>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Solar System, React Hooks, World War II"
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {isGenerating ? "Generating..." : "Generate Magic"}
          </button>
        </div>
      </div>

      {/* Existing Questions List would go here */}
      <div className="text-center text-gray-500 mt-8">
        <p>Check the database or start live to see questions in action.</p>
      </div>
    </div>
  );
}
