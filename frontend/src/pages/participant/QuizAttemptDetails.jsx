import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Award,
  AlertCircle,
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns"; 
export default function QuizAttemptDetails() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const { data } = await api.get(endpoints.quiz.attempt(quizId));
        setAttempt(data.attempt);
      } catch (err) {
        console.error("Failed to load attempt", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Result Not Found
        </h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-indigo-600 hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }
  const completionDate = attempt.finishedAt
    ? new Date(attempt.finishedAt)
    : attempt.createdAt
    ? new Date(attempt.createdAt)
    : null;
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {attempt.quiz?.title}
            </h1>
            <p className="text-sm text-gray-500">Your Result Analysis</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Score Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-full ${
                attempt.totalScore > 0
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Award size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">
                Total Score
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                {attempt.totalScore} pts
              </h2>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-gray-600 bg-gray-50 px-6 py-3 rounded-xl border border-gray-100 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-indigo-500" />
              <div className="flex flex-col">
                <span className="font-semibold">Date Taken</span>
                <span>
                  {completionDate
                    ? format(completionDate, "MMM dd, yyyy")
                    : "Date N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {attempt.answers.map((record, index) => {
            const question = record.question;
            if (!question) return null;

            const isCorrect = record.isCorrect;

            return (
              <div
                key={index}
                className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                  isCorrect
                    ? "border-green-100 shadow-sm"
                    : "border-red-50 shadow-sm"
                }`}
              >
                {/* Question Header */}
                <div
                  className={`px-6 py-4 flex justify-between items-start gap-4 ${
                    isCorrect ? "bg-green-50/50" : "bg-red-50/50"
                  }`}
                >
                  <div className="flex gap-4">
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isCorrect
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800 pt-0.5">
                      {question.questionText}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-green-700 font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                        <CheckCircle2 size={16} /> +{record.pointsEarned}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                        <XCircle size={16} /> 0 pts
                      </span>
                    )}
                  </div>
                </div>

                {/* Answers Section */}
                <div className="p-6 space-y-4">
                  {/* For MCQ / Multiple Choice */}
                  {(question.questionType === "mcq" ||
                    question.questionType === "multiple-correct") && (
                    <div className="grid gap-3">
                      {question.options.map((opt, i) => {
                        const isSelected = Array.isArray(record.answer)
                          ? record.answer.includes(opt.text)
                          : record.answer === opt.text;
                        const isActuallyCorrect = opt.isCorrect;

                        let styleClass =
                          "border-gray-200 bg-white text-gray-600";
                        let icon = null;

                        if (isSelected && isActuallyCorrect) {
                          styleClass =
                            "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500";
                          icon = <CheckCircle2 size={18} />;
                        } else if (isSelected && !isActuallyCorrect) {
                          styleClass = "border-red-300 bg-red-50 text-red-800";
                          icon = <XCircle size={18} />;
                        } else if (!isSelected && isActuallyCorrect) {
                          styleClass =
                            "border-green-200 bg-white text-green-700 border-dashed";
                          icon = (
                            <span className="text-xs font-bold px-2 py-0.5 bg-green-100 rounded">
                              Correct Answer
                            </span>
                          );
                        }

                        return (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border flex justify-between items-center ${styleClass}`}
                          >
                            <span className="font-medium">{opt.text}</span>
                            {icon}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* For Fill in Blank / Descriptive */}
                  {(question.questionType === "fill-blank" ||
                    question.questionType === "descriptive") && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                          Your Answer
                        </p>
                        <div
                          className={`p-4 rounded-xl border ${
                            isCorrect
                              ? "border-green-200 bg-green-50 text-green-800"
                              : "border-red-200 bg-red-50 text-red-800"
                          }`}
                        >
                          {record.answer || (
                            <span className="italic text-gray-400">
                              No answer submitted
                            </span>
                          )}
                        </div>
                      </div>

                      {!isCorrect &&
                        question.correctAnswers &&
                        question.correctAnswers.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                              Correct Answer
                            </p>
                            <div className="p-4 rounded-xl border border-green-200 bg-white text-green-700">
                              {question.correctAnswers.join(", ")}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl flex gap-3 text-sm text-blue-800">
                      <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <span className="font-bold block mb-1">
                          Explanation:
                        </span>
                        {question.explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
