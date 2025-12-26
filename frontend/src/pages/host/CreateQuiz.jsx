import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import toast from "react-hot-toast";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    duration: 30, // minutes
    settings: {
      showLeaderboard: true,
      shuffleQuestions: false,
      allowMultipleAttempts: false,
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("settings.")) {
      const settingName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        settings: { ...prev.settings, [settingName]: checked },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(endpoints.quiz.create, formData);
      toast.success("Quiz created!");
      // Navigate to Manage Quiz to add questions
      navigate(`/host/manage/${data.quiz.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm mt-8 border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Quiz</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Quiz Title</label>
          <input
            name="title"
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="datetime-local"
              name="startTime"
              required
              className="w-full p-2 border rounded outline-none"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="datetime-local"
              name="endTime"
              required
              className="w-full p-2 border rounded outline-none"
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            name="duration"
            defaultValue={30}
            className="w-full p-2 border rounded outline-none"
            onChange={handleChange}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h3 className="font-semibold text-gray-700">Settings</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="settings.showLeaderboard"
              checked={formData.settings.showLeaderboard}
              onChange={handleChange}
            />
            Show Leaderboard
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="settings.shuffleQuestions"
              checked={formData.settings.shuffleQuestions}
              onChange={handleChange}
            />
            Shuffle Questions
          </label>
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create & Add Questions"}
        </button>
      </form>
    </div>
  );
}
