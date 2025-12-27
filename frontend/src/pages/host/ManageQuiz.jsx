import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import QuestionForm from "../../components/quiz/QuestionForm";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Clock,
  Award,
  CheckCircle2,
  LayoutGrid,
  ArrowRight,
  GripVertical,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ManageQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for AI Generator
  const [showAiGen, setShowAiGen] = useState(false);
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);

  // State for Manual Edit/Add
  const [editingId, setEditingId] = useState(null);

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get(endpoints.quiz.getById(quizId));
      setQuestions(data.quiz.questions);
    } catch (err) {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  // --- Handlers ---
  const handleAiGenerate = async () => {
    if (!topic) return toast.error("Please enter a topic");
    if (questionCount < 1 || questionCount > 20)
      return toast.error("Count must be between 1 and 20");

    setAiLoading(true);
    try {
      const { data } = await api.post(endpoints.ai.generate, {
        topic,
        count: parseInt(questionCount),
        questionTypes: ["mcq", "fill-blank"],
      });
      await api.post(endpoints.ai.save(quizId), { questions: data.questions });
      toast.success(
        `Successfully generated ${data.questions.length} questions!`
      );
      setTopic("");
      setShowAiGen(false);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "AI Generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveQuestion = async (formData) => {
    setLoading(true);
    try {
      if (editingId === "new") {
        await api.post(`/questions/add/${quizId}`, formData);
        toast.success("Question Added");
      } else {
        await api.put(`/questions/${editingId}`, formData);
        toast.success("Question Updated");
      }
      setEditingId(null);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (qId) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    try {
      await api.delete(`/questions/${qId}`);
      toast.success("Deleted");
      setQuestions((prev) => prev.filter((q) => q._id !== qId));
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleFinish = () => {
    toast.success("Quiz setup complete!");
    navigate("/created-quizzes");
  };

  if (loading && !questions.length)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard/created")}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
                Manage Questions
              </h1>
              <p className="text-xs text-gray-500">
                {questions.length} questions
              </p>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100"
          >
            Finish <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowAiGen(!showAiGen)}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 group ${
              showAiGen
                ? "bg-purple-50 border-purple-500 text-purple-700"
                : "bg-white border-dashed border-gray-300 text-gray-600 hover:border-purple-400 hover:bg-purple-50/50"
            }`}
          >
            <div
              className={`p-3 rounded-full mb-3 transition-colors ${
                showAiGen
                  ? "bg-purple-200 text-purple-700"
                  : "bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600"
              }`}
            >
              <Sparkles size={24} />
            </div>
            <span className="font-bold">AI Generator</span>
            <span className="text-xs opacity-70 mt-1">
              Auto-create questions
            </span>
          </button>

          <button
            onClick={() => setEditingId("new")}
            disabled={!!editingId}
            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-3 bg-gray-100 text-gray-500 rounded-full mb-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <Plus size={24} />
            </div>
            <span className="font-bold">Add Manually</span>
            <span className="text-xs opacity-70 mt-1">Create from scratch</span>
          </button>
        </div>

        {/* AI Generator Panel */}
        {showAiGen && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-xl mb-10 animate-fade-in relative overflow-hidden ring-4 ring-purple-50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles className="text-purple-600" size={20} /> Generate
                  with AI
                </h3>
                <button
                  onClick={() => setShowAiGen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Close
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Topic
                  </label>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. World History, Javascript Basics..."
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-50 outline-none transition"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-50 outline-none transition"
                    />
                  </div>
                  <button
                    onClick={handleAiGenerate}
                    disabled={aiLoading}
                    className="flex-1 mt-7 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-70 transition shadow-lg shadow-purple-200"
                  >
                    {aiLoading ? "Generating..." : "Generate Questions"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editor Mode */}
        {editingId === "new" && (
          <div className="mb-10 bg-white p-6 rounded-3xl shadow-xl border border-blue-100 ring-4 ring-blue-50 relative z-20">
            <h3 className="font-bold text-xl text-gray-800 mb-6 border-b pb-4">
              Create New Question
            </h3>
            <QuestionForm
              onSave={handleSaveQuestion}
              onCancel={() => setEditingId(null)}
              loading={loading}
            />
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {questions.length === 0 && !editingId && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <LayoutGrid size={40} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                No questions yet
              </h3>
              <p className="text-gray-500 mt-2">
                Use the buttons above to start building your quiz.
              </p>
            </div>
          )}

          {questions.map((q, index) => (
            <div key={q._id}>
              {editingId === q._id ? (
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-blue-200 ring-4 ring-blue-50 relative z-20">
                  <h3 className="font-bold text-xl text-gray-800 mb-6 border-b pb-4">
                    Edit Question {index + 1}
                  </h3>
                  <QuestionForm
                    initialData={q}
                    onSave={handleSaveQuestion}
                    onCancel={() => setEditingId(null)}
                    loading={loading}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 group overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 text-gray-500 font-bold flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 leading-snug mb-2">
                            {q.questionText}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded-md">
                              {q.questionType.replace("-", " ")}
                            </span>
                            <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-md border border-amber-100 flex items-center gap-1">
                              <Award size={12} /> {q.points} pts
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(q._id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Options Preview */}
                    <div className="ml-12">
                      {q.questionType !== "fill-blank" ? (
                        <div className="grid sm:grid-cols-2 gap-2">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={`px-3 py-2.5 rounded-lg border flex items-center gap-2 text-sm ${
                                opt.isCorrect
                                  ? "bg-green-50 border-green-200 text-green-800 font-medium"
                                  : "bg-white border-gray-100 text-gray-500"
                              }`}
                            >
                              {opt.isCorrect ? (
                                <CheckCircle2
                                  size={16}
                                  className="text-green-600 shrink-0"
                                />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                              )}
                              <span className="truncate">{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 flex items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-500">
                            Correct Answer:
                          </span>
                          <span className="font-mono font-bold text-gray-800">
                            {q.correctAnswers?.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Floating Action Button for Finish */}
      <div className="fixed bottom-6 left-0 right-0 px-6 md:hidden z-40">
        <button
          onClick={handleFinish}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          Finish Editing <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
