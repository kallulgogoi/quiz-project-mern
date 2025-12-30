import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import {
  Save,
  Loader2,
  ArrowLeft,
  Calendar,
  Clock,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";

export default function EditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    duration: 30,
    settings: {
      showLeaderboard: true,
      shuffleQuestions: false,
      allowMultipleAttempts: false,
    },
  });

  // Fetch Quiz Data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(endpoints.quiz.getById(quizId));
        const quiz = data.quiz;

        // 🟢 FIX: Correctly format date to Local Time (Indian Standard Time)
        // The input type="datetime-local" expects format: YYYY-MM-DDTHH:mm
        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          
          // Get local components
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");

          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setFormData({
          title: quiz.title,
          description: quiz.description || "",
          startTime: formatDateForInput(quiz.startTime),
          duration: quiz.duration,
          settings: {
            showLeaderboard: quiz.settings?.showLeaderboard ?? true,
            shuffleQuestions: quiz.settings?.shuffleQuestions ?? false,
            allowMultipleAttempts:
              quiz.settings?.allowMultipleAttempts ?? false,
          },
        });
      } catch (err) {
        toast.error("Failed to load quiz data");
        navigate("/created-quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, navigate]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
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
    setSaving(true);
    try {
      await api.put(endpoints.quiz.update(quizId), formData);
      toast.success("Quiz updated successfully!");
      navigate("/created-quizzes");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 min-h-screen bg-gray-50/50">
      <button
        onClick={() => navigate("/created-quizzes")}
        className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Edit Quiz Details
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Update title, schedule and settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Basic Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Enter quiz title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="What is this quiz about?"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Schedule & Timing */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} /> Schedule & Timing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" /> Duration
                  (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Settings size={16} /> Configuration
            </h3>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition">
                <input
                  type="checkbox"
                  name="settings.showLeaderboard"
                  checked={formData.settings.showLeaderboard}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 shrink-0"
                />
                <div>
                  <span className="block font-medium text-gray-700">
                    Show Leaderboard
                  </span>
                  <span className="text-xs text-gray-500">
                    Participants can see their rank after submission
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition">
                <input
                  type="checkbox"
                  name="settings.shuffleQuestions"
                  checked={formData.settings.shuffleQuestions}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 shrink-0"
                />
                <div>
                  <span className="block font-medium text-gray-700">
                    Shuffle Questions
                  </span>
                  <span className="text-xs text-gray-500">
                    Randomize question order for each participant
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col md:flex-row gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-200"
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Save size={20} /> Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/host/manage/${quizId}`)}
              className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition w-full md:w-auto text-center"
            >
              Manage Questions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}