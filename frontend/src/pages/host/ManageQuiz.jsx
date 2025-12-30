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
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ManageQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Generator state
  const [showAiGen, setShowAiGen] = useState(false);
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedTypes, setSelectedTypes] = useState(["mcq"]);
  const [aiLoading, setAiLoading] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState(null);

  // Expand text
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
  const handleDownloadQuestions = () => {
    if (questions.length === 0) return toast.error("No questions to download");
    const doc = new jsPDF();
    //Header
    const addHeader = () => {
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // Indigo
      doc.text("BudhiX", 14, 15);
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text("Smart Quiz Platform", 14, 22);

      doc.setDrawColor(79, 70, 229);
      doc.line(14, 25, 196, 25);
    };

    addHeader();
    //Title
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Quiz Questions", 14, 35);
    doc.setFontSize(11);
    doc.text(`Total Questions: ${questions.length}`, 14, 42);
    const tableData = questions.map((q, index) => [
      index + 1,
      q.questionText,
      q.questionType.toUpperCase(),
      q.options.map((o) => o.text).join(", "),
      q.options
        .filter((o) => o.isCorrect)
        .map((o) => o.text)
        .join(", ") ||
        q.correctAnswers?.join(", ") ||
        "N/A",
    ]);
    autoTable(doc, {
      startY: 50,
      head: [["#", "Question", "Type", "Options", "Answer"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
      //Repeat header on every page
      didDrawPage: () => {
        addHeader();
      },
    });

    doc.save("BudhiX_Quiz_Questions.pdf");
  };

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
        questionTypes: selectedTypes,
      });
      await api.post(endpoints.ai.save(quizId), { questions: data.questions });
      toast.success(
        `Successfully generated ${data.questions.length} questions!`
      );
      setTopic("");
      setQuestionCount(5);
      setSelectedTypes(["mcq"]);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  const availableTypes = [
    { id: "mcq", label: "Single Choice" },
    { id: "multiple-correct", label: "Multi Select" },
    { id: "fill-blank", label: "Fill Blank" },
    { id: "descriptive", label: "Descriptive" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/created-quizzes")}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={22} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Manage Questions
                </h1>
                <p className="text-sm text-gray-500">
                  {questions.length} questions
                </p>
              </div>
            </div>

            <div className="flex flex-wrap mt-4 gap-2 md:gap-3">
              <button
                onClick={handleDownloadQuestions}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition shadow-sm text-sm"
              >
                <Download size={18} />
                <span>PDF</span>
              </button>

              <button
                onClick={() => setShowAiGen(!showAiGen)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-medium transition text-sm ${
                  showAiGen
                    ? "bg-purple-100 text-purple-700 border border-purple-300"
                    : "bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                <Sparkles size={18} />
                <span className="whitespace-nowrap">
                  {showAiGen ? "Close" : "AI Generate"}
                </span>
              </button>

              <button
                onClick={() => setEditingId("new")}
                disabled={!!editingId}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
              >
                <Plus size={18} strokeWidth={2.5} />
                Add New
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* AI Generator Panel */}
        {showAiGen && (
          <div className="bg-white border border-purple-200 rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <Sparkles size={28} className="drop-shadow" />
                <div>
                  <h3 className="text-xl font-bold">AI Question Generator</h3>
                  <p className="text-purple-100">
                    Powered by advanced AI – create questions instantly
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic or Context
                </label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. React Hooks, Ancient Rome, Photosynthesis..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Question Types
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableTypes.map((type) => {
                    const isSelected = selectedTypes.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleType(type.id)}
                        className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition flex items-center justify-center gap-2 ${
                          isSelected
                            ? "bg-purple-600 border-purple-600 text-white shadow-md"
                            : "bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50"
                        }`}
                      >
                        {isSelected && <Check size={16} strokeWidth={3} />}
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="sm:w-32">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
                <button
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  className="flex-1 sm:flex-none px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-70 transition shadow-md"
                >
                  {aiLoading ? "Generating..." : "Generate Questions"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add New Question Form */}
        {editingId === "new" && (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
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
        <div className="space-y-5">
          {questions.length === 0 && !editingId && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <LayoutGrid size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">
                No questions yet
              </h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Start by adding questions manually or use the AI generator
                above.
              </p>
            </div>
          )}

          {questions.map((q, index) => (
            <div key={q._id}>
              {editingId === q._id ? (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-300 p-6 mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    Edit Question #{index + 1}
                  </h3>
                  <QuestionForm
                    initialData={q}
                    onSave={handleSaveQuestion}
                    onCancel={() => setEditingId(null)}
                    loading={loading}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden mb-6">
                  {/* Header: Number, Type, Points, Actions */}
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-600">
                          #{index + 1}
                        </span>
                        <GripVertical
                          size={20}
                          className="text-gray-400 cursor-move"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-full">
                          {q.questionType.replace("-", " ")}
                        </span>
                        <span className="px-4 py-1.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full flex items-center gap-1.5">
                          <Award size={15} />
                          {q.points} pts
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(q._id)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/*Question Text + Options */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-5 leading-relaxed">
                      {q.questionText}
                      {q.questionText.length > 150 && (
                        <button
                          onClick={() => toggleExpand(q._id)}
                          className="ml-3 text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          {expandedQuestions[q._id] ? (
                            <>
                              Show less <ChevronUp size={14} />
                            </>
                          ) : (
                            <>
                              See more <ChevronDown size={14} />
                            </>
                          )}
                        </button>
                      )}
                    </h3>

                    {/* Options or Answer Preview */}
                    <div className="space-y-3">
                      {q.questionType === "fill-blank" ||
                      q.questionType === "descriptive" ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Correct Answer:
                          </p>
                          <p className="font-mono text-gray-900 break-words">
                            {q.correctAnswers?.join(", ") ||
                              "Open-ended (no fixed answer)"}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                opt.isCorrect
                                  ? "bg-green-50 border-green-300"
                                  : "bg-gray-50 border-transparent hover:border-gray-300"
                              }`}
                            >
                              <div className="shrink-0">
                                {opt.isCorrect ? (
                                  <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check
                                      size={16}
                                      className="text-white"
                                      strokeWidth={3}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 rounded-full border-2 border-gray-400" />
                                )}
                              </div>
                              <span
                                className={`text-sm leading-relaxed ${
                                  opt.isCorrect
                                    ? "font-semibold text-green-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {opt.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Finish Section */}
        {questions.length > 0 && !editingId && (
          <>
            <div className="mt-12 p-8 bg-linear-to-r from-green-500 to-emerald-600 rounded-2xl text-white shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                    <CheckCircle2 size={36} />
                    <h3 className="text-2xl font-bold">Quiz Ready!</h3>
                  </div>
                  <p className="text-green-100 text-lg">
                    {questions.length} questions added – your quiz is ready to
                    publish.
                  </p>
                </div>
                <button
                  onClick={handleFinish}
                  className="px-8 py-4 bg-white text-green-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition flex items-center gap-3"
                >
                  Go to Dashboard <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Mobile FAB */}
            <div className="fixed bottom-6 left-4 right-4 md:hidden z-40">
              <button
                onClick={handleFinish}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-2xl flex items-center justify-center gap-2 hover:bg-gray-800 transition"
              >
                Finish Editing <ArrowRight size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
