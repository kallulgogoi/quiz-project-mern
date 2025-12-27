import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import {
  Calendar,
  Clock,
  Settings,
  Type,
  AlignLeft,
  ArrowRight,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    // endTime is removed from state
    duration: 30, // minutes
    settings: {
      showLeaderboard: true,
      shuffleQuestions: false,
      allowMultipleAttempts: false,
    },
  });

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

    // --- VALIDATION START ---
    if (!formData.title) return toast.error("Please enter a title");
    if (!formData.startTime) return toast.error("Please set the start time");

    const start = new Date(formData.startTime);
    const now = new Date();

    // 1. Check if Start Time is in the future
    if (start < now) {
      return toast.error("Start time must be in the future");
    }
    // --- VALIDATION END ---

    setLoading(true);
    try {
      const { data } = await api.post(endpoints.quiz.create, formData);
      toast.success("Quiz created successfully!");
      // Navigate to Manage Quiz to add questions
      navigate(`/host/manage/${data.quiz.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10 shadow-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Create New Quiz</h1>
          <button
            onClick={() => navigate("/")}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <section className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Basic Details
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Give your quiz a catchy title and a brief description to let
                participants know what it's about.
              </p>
            </div>

            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Type size={16} className="text-blue-500" /> Quiz Title
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g., Ultimate Science Trivia"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition text-lg"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <AlignLeft size={16} className="text-blue-500" /> Description
                  (Optional)
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="What topics will be covered?"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition resize-none"
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Section 2: Schedule */}
          <section className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Schedule & Timing
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Set when the quiz opens and the duration. The system will
                automatically calculate the end time.
              </p>
            </div>

            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-purple-500" /> Start
                    Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-50 focus:border-purple-500 outline-none transition bg-gray-50/50"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-orange-500" /> Duration
                    (minutes)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="duration"
                      defaultValue={30}
                      min="1"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-50 focus:border-orange-500 outline-none transition font-medium"
                      onChange={handleChange}
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 hidden md:block">
                      mins
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Section 3: Configuration */}
          <section className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Configuration
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Control how participants interact with your quiz.
              </p>
            </div>

            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                      <Settings size={18} />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800">
                        Show Leaderboard
                      </span>
                      <span className="text-xs text-gray-500">
                        Display rankings after submission
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    name="settings.showLeaderboard"
                    checked={formData.settings.showLeaderboard}
                    onChange={handleChange}
                    className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                      <Settings size={18} />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800">
                        Shuffle Questions
                      </span>
                      <span className="text-xs text-gray-500">
                        Randomize order for each user
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    name="settings.shuffleQuestions"
                    checked={formData.settings.shuffleQuestions}
                    onChange={handleChange}
                    className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                      <Settings size={18} />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800">
                        Allow Multiple Attempts
                      </span>
                      <span className="text-xs text-gray-500">
                        Participants can retake the quiz
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    name="settings.allowMultipleAttempts"
                    checked={formData.settings.allowMultipleAttempts}
                    onChange={handleChange}
                    className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Submit Action */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-70 transform active:scale-95"
            >
              {loading ? (
                <span>Creating...</span>
              ) : (
                <>
                  Create & Continue <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
