import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { TrophySpin } from "react-loading-indicators";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Award,
  AlertCircle,
  Download,
  ArrowUp,
  FileText,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Target,
  Timer,
  BookOpen,
  BarChart3,
  Medal,
  Share2,
  Eye,
  EyeOff,
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function QuizAttemptDetails() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showExplanations, setShowExplanations] = useState(true);
  const canvasRef = useRef(null);

  // Waiting Room State
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const { data } = await api.get(endpoints.quiz.attempt(quizId));
        setAttempt(data.attempt);
      } catch (err) {
        // Waiting Room State
        if (
          err.response?.status === 403 &&
          err.response?.data?.isAvailable === false
        ) {
          setIsWaiting(true);
        } else {
          console.error("Failed to load attempt", err);
          toast.error("Could not load result details");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [quizId]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fullReport =
    attempt?.quiz?.questions?.map((question) => {
      const userAnswer = attempt.answers.find(
        (a) => a.question && a.question._id === question._id,
      );
      return {
        question,
        userAnswer: userAnswer || null,
      };
    }) || [];

  const handleDownloadReport = () => {
    if (!attempt) return;

    const doc = new jsPDF();
    const { quiz, totalScore } = attempt;

    // Header
    doc.setFontSize(20);
    doc.text("Quiz Result Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Participant: ${user.username} (${user.email})`, 14, 32);
    doc.text(`Quiz: ${quiz.title}`, 14, 38);
    doc.text(`Score: ${totalScore}`, 14, 44);
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 14, 50);

    // Prepare Data for Table
    const tableData = fullReport.map((item, index) => {
      const { question, userAnswer } = item;
      let status = "Skipped";
      let answerText = "-";

      if (userAnswer) {
        status = userAnswer.isCorrect ? "Correct" : "Incorrect";
        answerText = Array.isArray(userAnswer.answer)
          ? userAnswer.answer.join(", ")
          : userAnswer.answer;
      }

      const correctAnswer =
        question.questionType === "fill-blank" ||
        question.questionType === "descriptive"
          ? question.correctAnswers?.join(", ")
          : question.options
              .filter((o) => o.isCorrect)
              .map((o) => o.text)
              .join(", ");

      return [
        index + 1,
        question.questionText,
        answerText,
        correctAnswer,
        status,
      ];
    });
    autoTable(doc, {
      startY: 60,
      head: [["#", "Question", "Your Answer", "Correct Answer", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [79, 70, 229],
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 10 },
        4: { cellWidth: 25, fontStyle: "bold" },
      },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 4) {
          if (data.cell.raw === "Correct")
            data.cell.styles.textColor = [0, 128, 0];
          if (data.cell.raw === "Incorrect")
            data.cell.styles.textColor = [220, 38, 38];
          if (data.cell.raw === "Skipped")
            data.cell.styles.textColor = [128, 128, 128];
        }
      },
    });

    doc.save(`Report_${quiz.title.replace(/\s+/g, "_")}.pdf`);
    toast.success("Report downloaded");
  };

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
        img.height / 2 + fontSize * 1.5,
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

  const calculateStats = () => {
    if (!fullReport.length)
      return { correct: 0, incorrect: 0, skipped: 0, accuracy: 0 };

    const correct = fullReport.filter(
      (item) => item.userAnswer?.isCorrect,
    ).length;
    const incorrect = fullReport.filter(
      (item) => item.userAnswer && !item.userAnswer.isCorrect,
    ).length;
    const skipped = fullReport.filter((item) => !item.userAnswer).length;
    const accuracy =
      fullReport.length > 0
        ? Math.round((correct / fullReport.length) * 100)
        : 0;

    return { correct, incorrect, skipped, accuracy };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="text-center">
          <TrophySpin color="#4f46e5" size="medium" text="" textColor="" />
          <p className="mt-4 text-sm text-gray-500 font-medium">
            Loading analysis...
          </p>
        </div>
      </div>
    );
  }

  // RENDER WAITING ROOM UI (If they try to bypass the main result screen)
  if (isWaiting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50 p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-100">
                <Timer size={32} className="text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Quiz In Progress
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                Detailed performance analysis is hidden while other participants
                are still taking the quiz. Results will be available once the
                quiz concludes.
              </p>
              <button
                onClick={() => navigate(`/result/${quizId}`)}
                className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Return to Waiting Room
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50 p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Result Not Found
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            The analysis you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200"
          >
            <ArrowLeft size={16} />
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
      new Date(attempt.startedAt),
    );
  }
  const durationDisplay =
    durationMins < 1
      ? "< 1 min"
      : `${durationMins} min${durationMins > 1 ? "s" : ""}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 pb-20 relative">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-900 group"
                aria-label="Go back"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
              </button>
              <div className="hidden sm:block w-px h-8 bg-gray-200" />
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate max-w-md">
                  {attempt.quiz?.title}
                </h1>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance Analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExplanations(!showExplanations)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                title={
                  showExplanations ? "Hide explanations" : "Show explanations"
                }
              >
                {showExplanations ? <EyeOff size={16} /> : <Eye size={16} />}
                <span className="hidden md:inline">
                  {showExplanations ? "Hide" : "Show"} Details
                </span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                <FileText size={16} />
                <span className="hidden sm:inline">Download Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Mobile Download Button */}
        <div className="sm:hidden mb-6">
          <button
            onClick={handleDownloadReport}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-semibold shadow-lg hover:bg-gray-800 transition-all duration-200"
          >
            <FileText size={18} />
            Download Report PDF
          </button>
        </div>

        {/* Certificate Banner */}
        {attempt.quiz?.certificateTemplate && (
          <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 lg:p-8 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Award size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Certificate of Completion
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    Download your official achievement certificate
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadCertificate}
                className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg flex items-center gap-2 group"
              >
                <Download
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                Download Certificate
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 lg:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border border-blue-100">
                <Award size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Score
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 tabular-nums">
                  {attempt.totalScore}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg flex items-center justify-center border border-emerald-100">
                <Target size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Accuracy
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 tabular-nums">
                  {stats.accuracy}%
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.accuracy}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex items-center justify-center border border-amber-100">
                <Calendar size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Completed
                </p>
                <p className="text-sm lg:text-base font-semibold text-gray-900">
                  {completionDate
                    ? format(completionDate, "MMM dd, yyyy")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center border border-purple-100">
                <Timer size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Duration
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {durationDisplay}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Question Breakdown Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Question Breakdown
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <span className="text-gray-600">Correct ({stats.correct})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span className="text-gray-600">
                Incorrect ({stats.incorrect})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
              <span className="text-gray-600">Skipped ({stats.skipped})</span>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {fullReport.map((item, index) => {
            const { question, userAnswer } = item;

            let status = "unattempted";
            if (userAnswer) {
              status = userAnswer.isCorrect ? "correct" : "incorrect";
            }

            return (
              <div
                key={question._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Question Header */}
                <div className="px-5 lg:px-6 py-4 flex items-start justify-between gap-4 border-b border-gray-100">
                  <div className="flex gap-3 flex-1">
                    <div
                      className={`
                      w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm shrink-0
                      ${
                        status === "correct"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : status === "incorrect"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                      }
                    `}
                    >
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base lg:text-lg leading-relaxed flex-1">
                      {question.questionText}
                    </h3>
                  </div>

                  <div className="shrink-0">
                    {status === "correct" && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                        <CheckCircle2 size={14} />
                        <span className="text-xs font-semibold">
                          +{question.points}
                        </span>
                      </div>
                    )}
                    {status === "incorrect" && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg border border-red-200">
                        <XCircle size={14} />
                        <span className="text-xs font-semibold">0 pts</span>
                      </div>
                    )}
                    {status === "unattempted" && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">
                        <HelpCircle size={14} />
                        <span className="text-xs font-semibold">Skipped</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-5 lg:p-6 space-y-5">
                  {/* MCQ / Multiple Choice Questions */}
                  {(question.questionType === "mcq" ||
                    question.questionType === "multiple-correct") && (
                    <div className="grid gap-2.5">
                      {question.options.map((opt, i) => {
                        const isSelected = userAnswer
                          ? Array.isArray(userAnswer.answer)
                            ? userAnswer.answer.includes(opt.text)
                            : userAnswer.answer === opt.text
                          : false;

                        const isActuallyCorrect = opt.isCorrect;

                        let styleClass =
                          "border-gray-200 bg-white text-gray-700";
                        let icon = null;

                        if (isSelected && isActuallyCorrect) {
                          styleClass =
                            "border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500";
                          icon = (
                            <CheckCircle2
                              size={18}
                              className="text-emerald-600 shrink-0"
                            />
                          );
                        } else if (isSelected && !isActuallyCorrect) {
                          styleClass = "border-red-300 bg-red-50 text-red-900";
                          icon = (
                            <XCircle
                              size={18}
                              className="text-red-600 shrink-0"
                            />
                          );
                        } else if (!isSelected && isActuallyCorrect) {
                          styleClass =
                            "border-emerald-300 border-dashed bg-emerald-50/50 text-emerald-800";
                          icon = (
                            <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md uppercase tracking-wide border border-emerald-200 shrink-0">
                              Correct
                            </span>
                          );
                        }

                        return (
                          <div
                            key={i}
                            className={`p-4 rounded-lg border-2 flex items-center justify-between gap-3 transition-all ${styleClass}`}
                          >
                            <span className="text-sm lg:text-base">
                              {opt.text}
                            </span>
                            {icon}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Fill in Blank / Descriptive Questions */}
                  {(question.questionType === "fill-blank" ||
                    question.questionType === "descriptive") && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Your Response
                        </p>
                        <div
                          className={`p-4 rounded-lg border-2 text-sm lg:text-base ${
                            status === "correct"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-900 font-medium"
                              : status === "incorrect"
                                ? "border-red-200 bg-red-50 text-red-900"
                                : "border-gray-200 bg-gray-50 text-gray-500 italic"
                          }`}
                        >
                          {userAnswer?.answer || "No response provided"}
                        </div>
                      </div>

                      {status !== "correct" &&
                        question.correctAnswers &&
                        question.correctAnswers.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Expected Answer
                            </p>
                            <div className="p-4 rounded-lg border-2 border-emerald-200 bg-white text-emerald-800 font-medium">
                              {question.correctAnswers.join(", ")}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Explanation */}
                  {question.explanation && showExplanations && (
                    <div className="mt-4 p-4 lg:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex gap-3">
                        <div className="shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <AlertCircle size={16} className="text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1.5">
                            Explanation
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3.5 bg-gray-900 text-white rounded-full shadow-xl hover:bg-gray-800 hover:scale-110 transition-all duration-300 z-50 group"
          aria-label="Scroll to top"
        >
          <ArrowUp
            size={22}
            className="group-hover:-translate-y-0.5 transition-transform"
          />
        </button>
      )}
    </div>
  );
}
