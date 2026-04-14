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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <TrophySpin color="#23eeff" size="medium" text="" textColor="#0ae6f9" />
      </div>
    );
  }

  // RENDER WAITING ROOM UI (If they try to bypass the main result screen)
  if (isWaiting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-200">
          <Clock size={48} className="text-indigo-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz Ongoing
          </h2>
          <p className="text-gray-600 mb-6 font-medium">
            Detailed performance analysis is hidden while other participants are
            still taking the quiz. Please wait until it finishes.
          </p>
          <button
            onClick={() => navigate(`/result/${quizId}`)}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition"
          >
            Go to Waiting Room
          </button>
        </div>
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
      new Date(attempt.startedAt),
    );
  }
  const durationDisplay = durationMins < 1 ? "< 1 min" : `${durationMins} mins`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
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

          <button
            onClick={handleDownloadReport}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg text-sm"
          >
            <FileText size={16} /> Report PDF
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-8">
        <div className="md:hidden mb-6">
          <button
            onClick={handleDownloadReport}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg"
          >
            <FileText size={18} /> Download Result PDF
          </button>
        </div>

        {attempt.quiz?.certificateTemplate && (
          <div className="mb-8 bg-linear-to-r from-gray-900 to-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-700/50 rounded-full border border-gray-600">
                <Award size={32} className="text-yellow-400" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">
                  Certificate Available
                </h3>
                <p className="text-gray-300 text-sm">
                  Download your official record of completion.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadCertificate}
              className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition shadow-lg flex items-center gap-2"
            >
              <Download size={20} /> Get Certificate
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

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
                <Clock size={28} />
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

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-gray-900" size={20} /> Question
            Breakdown
          </h2>

          {fullReport.map((item, index) => {
            const { question, userAnswer } = item;

            let status = "unattempted";
            if (userAnswer) {
              status = userAnswer.isCorrect ? "correct" : "wrong";
            }

            return (
              <div
                key={question._id}
                className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm transition-all ${
                  status === "correct"
                    ? "border-green-100"
                    : status === "wrong"
                      ? "border-red-50"
                      : "border-gray-200 border-dashed"
                }`}
              >
                <div
                  className={`px-6 py-5 flex justify-between items-start gap-4 ${
                    status === "correct"
                      ? "bg-green-50/30"
                      : status === "wrong"
                        ? "bg-red-50/30"
                        : "bg-gray-50"
                  }`}
                >
                  <div className="flex gap-4">
                    <span
                      className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        status === "correct"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : status === "wrong"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-gray-200 text-gray-600 border border-gray-300"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 pt-0.5 leading-snug">
                      {question.questionText}
                    </h3>
                  </div>
                  <div className="shrink-0">
                    {status === "correct" && (
                      <span className="flex items-center gap-1.5 text-green-700 font-bold text-xs bg-white px-3 py-1.5 rounded-lg shadow-sm border border-green-200">
                        <CheckCircle2 size={14} /> +{question.points} pts
                      </span>
                    )}
                    {status === "wrong" && (
                      <span className="flex items-center gap-1.5 text-red-600 font-bold text-xs bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-200">
                        <XCircle size={14} /> 0 pts
                      </span>
                    )}
                    {status === "unattempted" && (
                      <span className="flex items-center gap-1.5 text-gray-500 font-bold text-xs bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-300">
                        <HelpCircle size={14} /> Skipped
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {(question.questionType === "mcq" ||
                    question.questionType === "multiple-correct") && (
                    <div className="grid gap-3">
                      {question.options.map((opt, i) => {
                        const isSelected = userAnswer
                          ? Array.isArray(userAnswer.answer)
                            ? userAnswer.answer.includes(opt.text)
                            : userAnswer.answer === opt.text
                          : false;

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
                            status === "correct"
                              ? "border-green-200 bg-green-50 text-green-900"
                              : status === "wrong"
                                ? "border-red-200 bg-red-50 text-red-900"
                                : "border-gray-200 bg-gray-50 text-gray-400 italic"
                          }`}
                        >
                          {userAnswer?.answer ||
                            "You did not attempt this question."}
                        </div>
                      </div>

                      {status !== "correct" &&
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
                    <div className="mt-6 p-5 bg-blue-50 rounded-2xl flex gap-4 border border-blue-100">
                      <div className="bg-blue-200 p-2 rounded-lg h-fit text-blue-700">
                        <AlertCircle size={20} />
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-bold block mb-1 text-blue-900">
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
