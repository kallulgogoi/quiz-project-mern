import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { TrophySpin } from "react-loading-indicators";

export default function HostParticipantResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(
          endpoints.quiz.attemptDetails(attemptId)
        );
        setData(data.attempt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attemptId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <TrophySpin color="#4f46e5" size="medium" text="" textColor="" />
      </div>
    );

  if (!data) return <div>Not found</div>;

  const { quiz, user, answers, totalScore } = data;

  // Merge Quiz Questions with Attempt Answers to find unattempted ones
  const fullReport = quiz.questions.map((question) => {
    const userAnswer = answers.find(
      (a) => a.question && a.question._id === question._id
    );

    return {
      question,
      userAnswer: userAnswer || null, // null means unattempted
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Reports
        </button>

        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.username}
              </h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="text-center bg-indigo-50 px-8 py-4 rounded-xl">
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
              Final Score
            </p>
            <p className="text-4xl font-black text-indigo-600">{totalScore}</p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-800">
            Detailed Breakdown
          </h2>

          {fullReport.map((item, index) => {
            const { question, userAnswer } = item;

            // Status Logic
            let status = "unattempted";
            if (userAnswer) {
              status = userAnswer.isCorrect ? "correct" : "wrong";
            }

            return (
              <div
                key={question._id}
                className={`bg-white rounded-2xl border-2 overflow-hidden ${
                  status === "correct"
                    ? "border-green-100"
                    : status === "wrong"
                    ? "border-red-50"
                    : "border-gray-200 border-dashed"
                }`}
              >
                {/* Question Header */}
                <div
                  className={`px-6 py-4 flex justify-between items-start gap-4 ${
                    status === "correct"
                      ? "bg-green-50/50"
                      : status === "wrong"
                      ? "bg-red-50/50"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-sm border border-gray-200">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 pt-0.5">
                      {question.questionText}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {status === "correct" && (
                      <span className="flex items-center gap-1.5 text-green-700 font-bold text-xs bg-white px-3 py-1.5 rounded-lg border border-green-200 shadow-sm">
                        <CheckCircle2 size={14} /> Correct
                      </span>
                    )}
                    {status === "wrong" && (
                      <span className="flex items-center gap-1.5 text-red-600 font-bold text-xs bg-white px-3 py-1.5 rounded-lg border border-red-200 shadow-sm">
                        <XCircle size={14} /> Wrong
                      </span>
                    )}
                    {status === "unattempted" && (
                      <span className="flex items-center gap-1.5 text-gray-500 font-bold text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-300 shadow-sm">
                        <HelpCircle size={14} /> Skipped
                      </span>
                    )}
                  </div>
                </div>

                {/* Answers Body */}
                <div className="p-6 space-y-4">
                  {/* User Answer */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Participant Answer
                    </p>
                    <div
                      className={`p-4 rounded-xl border-2 font-medium ${
                        status === "unattempted"
                          ? "bg-gray-50 border-gray-200 text-gray-400 italic"
                          : status === "correct"
                          ? "bg-green-50 border-green-200 text-green-900"
                          : "bg-red-50 border-red-200 text-red-900"
                      }`}
                    >
                      {status === "unattempted"
                        ? "Did not attempt"
                        : userAnswer.answer}
                    </div>
                  </div>

                  {/* Correct Answer (Show if wrong or skipped) */}
                  {status !== "correct" && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Correct Answer
                      </p>
                      <div className="p-4 rounded-xl border-2 border-green-100 bg-white text-green-800 font-bold shadow-sm">
                        {question.questionType === "fill-blank" ||
                        question.questionType === "descriptive"
                          ? question.correctAnswers?.join(", ") ||
                            "Manual Review"
                          : question.options
                              .filter((o) => o.isCorrect)
                              .map((o) => o.text)
                              .join(", ")}
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
