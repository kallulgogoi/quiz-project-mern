import { useEffect, useState, useRef } from "react";
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
  Timer,
  Download,
  Loader2,
  ArrowUp, // Added ArrowUp icon
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function QuizAttemptDetails() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false); // State for scroll button
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const { data } = await api.get(endpoints.quiz.attempt(quizId));
        setAttempt(data.attempt);
      } catch (err) {
        console.error("Failed to load attempt", err);
        toast.error("Could not load result details");
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [quizId]);

  // --- SCROLL TO TOP LOGIC ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // ---------------------------

  const handleDownloadCertificate = () => {
    if (!attempt?.quiz?.certificateTemplate) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = attempt.quiz.certificateTemplate;

    toast.loading("Generating certificate...", { duration: 1500 });

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const fontSize = Math.floor(img.width * 0.05);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(user.username, img.width / 2, img.height / 2);

      ctx.font = `${Math.floor(fontSize * 0.4)}px Arial`;
      ctx.fillStyle = "#4b5563";
      ctx.fillText(
        `Awarded: ${new Date().toLocaleDateString()}`,
        img.width / 2,
        img.height / 2 + fontSize * 1.5
      );

      try {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `Certificate-${user.username}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Certificate downloaded!");
      } catch (e) {
        toast.error("Download failed due to browser security.");
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Result Not Found
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 font-medium hover:text-black hover:underline transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const completionDate = attempt.finishedAt
    ? new Date(attempt.finishedAt)
    : attempt.createdAt
    ? new Date(attempt.createdAt)
    : null;

  let durationMins = 0;
  if (attempt.timeTaken > 0) {
    durationMins = Math.round(attempt.timeTaken / 60);
  } else if (attempt.startedAt && attempt.finishedAt) {
    durationMins = differenceInMinutes(
      new Date(attempt.finishedAt),
      new Date(attempt.startedAt)
    );
  }
  const durationDisplay = durationMins < 1 ? "< 1 min" : `${durationMins} mins`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      {/* Header (Standard, not fixed) */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-gray-100 text-gray-700 hover:bg-gray-900 hover:text-white rounded-full transition-all duration-300 shadow-sm"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {attempt.quiz?.title}
              </h1>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Result Analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-8">
        {/* Certificate Section */}
        {attempt.quiz?.certificateTemplate && (
          <div className="mb-8 bg-gray-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-800 rounded-full border border-gray-700">
                <Award size={32} className="text-yellow-400" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">
                  Certificate Available
                </h3>
                <p className="text-gray-400 text-sm">
                  Download your official record of completion.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadCertificate}
              className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition shadow-lg flex items-center gap-2"
            >
              <Download size={20} /> Download PDF
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Score Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  attempt.totalScore > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Award size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Total Score
                </p>
                <h3 className="text-2xl font-black text-gray-900">
                  {attempt.totalScore} pts
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Date Taken
                </p>
                <h3 className="text-lg font-bold text-gray-900">
                  {completionDate
                    ? format(completionDate, "MMM dd, yyyy")
                    : "N/A"}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <Timer size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Duration
                </p>
                <h3 className="text-2xl font-black text-gray-900">
                  {durationDisplay}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-gray-900" size={20} /> Question
            Breakdown
          </h2>

          {attempt.answers.map((record, index) => {
            const question = record.question;
            if (!question) return null;

            const isCorrect = record.isCorrect;

            return (
              <div
                key={index}
                className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm transition-all ${
                  isCorrect ? "border-green-100" : "border-red-50"
                }`}
              >
                {/* Question Header */}
                <div
                  className={`px-6 py-5 flex justify-between items-start gap-4 ${
                    isCorrect ? "bg-green-50/30" : "bg-red-50/30"
                  }`}
                >
                  <div className="flex gap-4">
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isCorrect
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 pt-0.5 leading-snug">
                      {question.questionText}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <span className="flex items-center gap-1.5 text-green-700 font-bold text-xs bg-white px-3 py-1.5 rounded-lg shadow-sm border border-green-200">
                        <CheckCircle2 size={14} /> +{record.pointsEarned} pts
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-600 font-bold text-xs bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-200">
                        <XCircle size={14} /> 0 pts
                      </span>
                    )}
                  </div>
                </div>

                {/* Answers Section */}
                <div className="p-6 md:p-8 space-y-6">
                  {(question.questionType === "mcq" ||
                    question.questionType === "multiple-correct") && (
                    <div className="grid gap-3">
                      {question.options.map((opt, i) => {
                        const isSelected = Array.isArray(record.answer)
                          ? record.answer.includes(opt.text)
                          : record.answer === opt.text;
                        const isActuallyCorrect = opt.isCorrect;

                        let styleClass =
                          "border-gray-100 bg-white text-gray-600 hover:bg-gray-50";
                        let icon = null;

                        if (isSelected && isActuallyCorrect) {
                          styleClass =
                            "border-green-500 bg-green-50 text-green-900 ring-1 ring-green-500 font-medium";
                          icon = (
                            <CheckCircle2
                              size={20}
                              className="text-green-600"
                            />
                          );
                        } else if (isSelected && !isActuallyCorrect) {
                          styleClass =
                            "border-red-300 bg-red-50 text-red-900 font-medium";
                          icon = <XCircle size={20} className="text-red-600" />;
                        } else if (!isSelected && isActuallyCorrect) {
                          styleClass =
                            "border-green-400 border-dashed bg-green-50/50 text-green-800";
                          icon = (
                            <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-800 rounded uppercase tracking-wide border border-green-200">
                              Correct Answer
                            </span>
                          );
                        }

                        return (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border-2 flex justify-between items-center transition-all ${styleClass}`}
                          >
                            <span className="text-base">{opt.text}</span>
                            {icon}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(question.questionType === "fill-blank" ||
                    question.questionType === "descriptive") && (
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Your Answer
                        </p>
                        <div
                          className={`p-4 rounded-xl border-2 text-base font-medium ${
                            isCorrect
                              ? "border-green-200 bg-green-50 text-green-900"
                              : "border-red-200 bg-red-50 text-red-900"
                          }`}
                        >
                          {record.answer || (
                            <span className="italic text-gray-400 font-normal">
                              No answer submitted
                            </span>
                          )}
                        </div>
                      </div>

                      {!isCorrect &&
                        question.correctAnswers &&
                        question.correctAnswers.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                              Correct Answer
                            </p>
                            <div className="p-4 rounded-xl border-2 border-green-200 bg-white text-green-800 font-medium shadow-sm">
                              {question.correctAnswers.join(", ")}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {question.explanation && (
                    <div className="mt-6 p-5 bg-gray-50 rounded-2xl flex gap-4 border border-gray-200">
                      <div className="bg-gray-200 p-2 rounded-lg h-fit text-gray-600">
                        <AlertCircle size={20} />
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-bold block mb-1 text-gray-900">
                          Explanation
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

      {/* --- SCROLL TO TOP BUTTON --- */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3.5 bg-gray-900 text-white rounded-full shadow-2xl hover:bg-black hover:scale-110 transition-all duration-300 z-50 animate-bounce"
          title="Scroll to Top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
