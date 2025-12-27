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
  Check,
  ChevronDown,
  ChevronUp,
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
  // NEW: Selected types
  const [selectedTypes, setSelectedTypes] = useState(["mcq"]);
  const [aiLoading, setAiLoading] = useState(false);

  // State for Manual Edit/Add
  const [editingId, setEditingId] = useState(null);

  // State for expanding text
  const [expandedQuestions, setExpandedQuestions] = useState({});

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

  const toggleType = (type) => {
    if (selectedTypes.includes(type) && selectedTypes.length === 1) {
      toast.error("At least one type must be selected");
      return;
    }
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleAiGenerate = async () => {
    if (!topic) return toast.error("Please enter a topic");
    if (questionCount < 1 || questionCount > 20)
      return toast.error("Count must be between 1 and 20");
    if (selectedTypes.length === 0)
      return toast.error("Select question type(s)");

    setAiLoading(true);
    try {
      const { data } = await api.post(endpoints.ai.generate, {
        topic,
        count: parseInt(questionCount),
        questionTypes: selectedTypes, // Passing selection to API
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

  const toggleExpand = (id) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading && !questions.length)
    return (
      <div className="flex items-center justify-center h-screen text-blue-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
      </div>
    );

  const availableTypes = [
    { id: "mcq", label: "Single Choice" },
    { id: "multiple-correct", label: "Multi Select" },
    { id: "fill-blank", label: "Fill Blank" },
    { id: "descriptive", label: "Descriptive" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/created-quizzes")}
              className="p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition flex items-center gap-2"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Manage Questions
              </h1>
              <p className="text-sm text-gray-500">
                {questions.length} questions added
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAiGen(!showAiGen)}
              className={`flex-1 md:flex-none justify-center items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition shadow-sm border ${
                showAiGen
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
              }`}
            >
              <Sparkles size={18} className={showAiGen ? "fill-current" : ""} />
              {showAiGen ? "Close AI" : "AI Generate"}
            </button>
            <button
              onClick={() => setEditingId("new")}
              disabled={!!editingId}
              className="flex-1 md:flex-none justify-center items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
            >
              <Plus size={18} strokeWidth={2.5} /> Add New
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* AI Generator Panel */}
        {showAiGen && (
          <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 md:p-8 rounded-2xl border border-purple-100 shadow-lg mb-10 animate-fade-in-down relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white rounded-xl shadow-sm text-purple-600">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    AI Question Generator
                  </h3>
                  <p className="text-sm text-gray-500">
                    Instantly create relevant questions using Gemini AI
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Topic or Context
                  </label>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. World History, Javascript Basics..."
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 outline-none transition bg-white/80"
                  />
                </div>

                {/* Question Types Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
                    Question Types
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableTypes.map((type) => {
                      const isSelected = selectedTypes.includes(type.id);
                      return (
                        <div
                          key={type.id}
                          onClick={() => toggleType(type.id)}
                          className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm font-semibold select-none ${
                            isSelected
                              ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200"
                              : "bg-white border-gray-200 text-gray-500 hover:border-purple-300 hover:bg-purple-50"
                          }`}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                          {type.label}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="w-full md:w-32">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                      Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(e.target.value)}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 outline-none transition bg-white/80"
                    />
                  </div>
                  <button
                    onClick={handleAiGenerate}
                    disabled={aiLoading}
                    className="flex-1 w-full bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-70 transition shadow-lg shadow-purple-200 whitespace-nowrap h-[58px]"
                  >
                    {aiLoading ? "Creating..." : "Generate Questions"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editor Mode */}
        {editingId === "new" && (
          <div className="mb-10 animate-fade-in bg-white p-6 rounded-2xl shadow-lg border border-blue-100 ring-4 ring-blue-50 relative z-10">
            <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                #
              </span>
              Add New Question
            </h3>
            <QuestionForm
              onSave={handleSaveQuestion}
              onCancel={() => setEditingId(null)}
              loading={loading}
            />
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 && !editingId && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutGrid className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No questions yet
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">
                Get started by adding questions manually or let our AI generate
                them for you instantly.
              </p>
            </div>
          )}

          {questions.map((q, index) => (
            <div key={q._id} className="transition-all duration-300">
              {editingId === q._id ? (
                <div className="animate-fade-in bg-white p-6 rounded-2xl shadow-lg border border-blue-200 ring-4 ring-blue-50 my-4 relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-gray-800">
                      Edit Question #{index + 1}
                    </h3>
                  </div>
                  <QuestionForm
                    initialData={q}
                    onSave={handleSaveQuestion}
                    onCancel={() => setEditingId(null)}
                    loading={loading}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 group overflow-hidden flex flex-col md:flex-row">
                  {/* Number Handle */}
                  <div className="bg-gray-50 flex items-center justify-between p-4 md:w-16 md:flex-col md:justify-center border-b md:border-b-0 md:border-r border-gray-100">
                    <span className="font-bold text-gray-400 text-lg">
                      #{index + 1}
                    </span>
                    <GripVertical size={20} className="text-gray-300 md:mt-2" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      {/* See More Logic for Title */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-bold text-lg text-gray-800 leading-snug break-words ${
                            expandedQuestions[q._id] ? "" : "line-clamp-2"
                          }`}
                        >
                          {q.questionText}
                        </h3>
                        {q.questionText.length > 100 && (
                          <button
                            onClick={() => toggleExpand(q._id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 flex items-center gap-1"
                          >
                            {expandedQuestions[q._id] ? (
                              <>
                                Show Less <ChevronUp size={12} />
                              </>
                            ) : (
                              <>
                                See More <ChevronDown size={12} />
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 uppercase tracking-wide">
                          {q.questionType.replace("-", " ")}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          <Award size={12} /> {q.points} pts
                        </span>
                      </div>
                    </div>

                    {/* Options Preview */}
                    <div className="ml-0 md:ml-2">
                      {q.questionType !== "fill-blank" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={`px-3 py-2.5 rounded-lg border flex items-start gap-2 text-sm ${
                                opt.isCorrect
                                  ? "bg-green-50 border-green-200 text-green-800 font-medium"
                                  : "bg-white border-gray-100 text-gray-500"
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {opt.isCorrect ? (
                                  <CheckCircle2
                                    size={16}
                                    className="text-green-600"
                                  />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-gray-300" />
                                )}
                              </div>
                              <span className="break-words w-full">
                                {opt.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-500 shrink-0">
                            Correct Answer:
                          </span>
                          <span className="font-mono font-bold text-gray-800 break-all">
                            {q.correctAnswers?.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/50">
                    <button
                      onClick={() => setEditingId(q._id)}
                      className="flex-1 md:flex-none p-4 md:p-3 flex items-center justify-center text-blue-600 hover:bg-white hover:text-blue-700 transition"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <div className="w-px md:w-full h-full md:h-px bg-gray-200"></div>
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="flex-1 md:flex-none p-4 md:p-3 flex items-center justify-center text-red-400 hover:bg-white hover:text-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Finalize Button */}
        {questions.length > 0 && !editingId && (
          <div className="mt-12 bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Ready to go?
                </h3>
                <p className="text-gray-600">
                  You have added {questions.length} questions. Your quiz is
                  ready to be hosted.
                </p>
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="w-full md:w-auto px-8 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              Finish & Go to Dashboard <ArrowRight size={20} />
            </button>
          </div>
        )}
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
