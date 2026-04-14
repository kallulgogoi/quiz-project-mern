import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import {
  Timer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Send,
  AlertCircle,
  Flag,
  Clock,
  Award,
  Target,
  BookOpen,
  Zap,
} from "lucide-react";
import { TrophySpin } from "react-loading-indicators";
import { differenceInSeconds } from "date-fns";
import toast from "react-hot-toast";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [quizMeta, setQuizMeta] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeOffset, setTimeOffset] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  //LOAD SAVED PROGRESS ON MOUNT
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`quiz_${quizId}_answers`);
    const savedIndex = localStorage.getItem(`quiz_${quizId}_index`);

    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error("Failed to parse saved answers");
      }
    }
    if (savedIndex) {
      setCurrentIndex(parseInt(savedIndex, 10) || 0);
    }
  }, [quizId]);

  // AUTO-SAVE PROGRESS ON CHANGE
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(answers));
    }
  }, [answers, quizId]);

  useEffect(() => {
    localStorage.setItem(`quiz_${quizId}_index`, currentIndex.toString());
  }, [currentIndex, quizId]);

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const { data } = await api.post(endpoints.quiz.start(quizId));
        setQuestions(data.questions);
        setQuizMeta(data.quiz);
        setEndTime(new Date(data.quiz.endTime));

        if (data.serverTime) {
          const serverTime = new Date(data.serverTime).getTime();
          const clientTime = Date.now();
          setTimeOffset(serverTime - clientTime);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error starting quiz");
        navigate("/dashboard");
      }
    };
    startQuiz();
  }, [quizId, navigate]);

  const submitQuiz = useCallback(
    async (autoSubmit = false) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        questionId: qId,
        answer: val,
      }));

      let loadingToast;
      if (!autoSubmit) {
        loadingToast = toast.loading("Submitting quiz...");
      } else {
        toast("Time's up! Submitting answers...", {
          icon: "⏳",
          duration: 4000,
        });
      }

      try {
        await api.post(endpoints.quiz.submit(quizId), {
          answers: formattedAnswers,
        });

        // CLEAR SAVED PROGRESS ON SUCCESSFUL SUBMISSION
        localStorage.removeItem(`quiz_${quizId}_answers`);
        localStorage.removeItem(`quiz_${quizId}_index`);

        if (loadingToast) toast.success("Submitted!", { id: loadingToast });
        navigate(`/result/${quizId}`);
      } catch (err) {
        console.error(err);
        if (loadingToast)
          toast.error("Submission failed", { id: loadingToast });

        if (!autoSubmit) {
          isSubmittingRef.current = false;
          setIsSubmitting(false);
        } else {
          navigate(`/result/${quizId}`);
        }
      }
    },
    [answers, quizId, navigate],
  );

  useEffect(() => {
    if (!endTime) return;

    const calculateTime = () => {
      const now = new Date(Date.now() + timeOffset);
      const diff = differenceInSeconds(endTime, now);

      if (diff <= 0) {
        setTimeLeft(0);
        if (!isSubmittingRef.current) {
          submitQuiz(true);
        }
        return false;
      } else {
        setTimeLeft(diff);
        return true;
      }
    };

    const shouldContinue = calculateTime();
    if (!shouldContinue) return;

    const timer = setInterval(() => {
      const keepGoing = calculateTime();
      if (!keepGoing) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, submitQuiz, timeOffset]);

  const handleAnswer = (val, type) => {
    if (isSubmitting) return;

    const currentQId = questions[currentIndex]._id;

    if (type === "multiple-correct") {
      setAnswers((prev) => {
        const currentArr = prev[currentQId] || [];
        if (currentArr.includes(val)) {
          return {
            ...prev,
            [currentQId]: currentArr.filter((item) => item !== val),
          };
        } else {
          return { ...prev, [currentQId]: [...currentArr, val] };
        }
      });
    } else {
      setAnswers((prev) => ({ ...prev, [currentQId]: val }));
    }
  };

  if (!questions.length || timeLeft === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="text-center">
          <TrophySpin color="#4f46e5" size="medium" text="" textColor="" />
          <p className="mt-4 text-sm text-gray-500 font-medium">
            Preparing your quiz...
          </p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ._id];
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const isTimeCritical = timeLeft < 60;
  const answeredCount = Object.keys(answers).length;
  const completionPercentage = Math.round(
    (answeredCount / questions.length) * 100,
  );

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case "mcq":
        return <Target size={14} />;
      case "multiple-correct":
        return <CheckCircle2 size={14} />;
      case "fill-blank":
        return <BookOpen size={14} />;
      case "descriptive":
        return <Flag size={14} />;
      default:
        return <Award size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {quizMeta?.title || "Quiz"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-gray-500">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span className="text-xs font-medium text-gray-500">
                    {completionPercentage}% Complete
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold transition-all duration-300 ${
                    isTimeCritical
                      ? "bg-red-50 text-red-600 border border-red-200 shadow-sm shadow-red-100 animate-pulse"
                      : "bg-indigo-50 text-indigo-600 border border-indigo-200"
                  }`}
                >
                  <Timer
                    size={18}
                    className={isTimeCritical ? "animate-pulse" : ""}
                  />
                  <span className="tabular-nums">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {/* Question markers */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-0.5">
                {questions.map((_, idx) => {
                  const isAnswered = answers[questions[idx]?._id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  const isPast = idx < currentIndex;

                  return (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? "bg-indigo-600 ring-2 ring-indigo-200 scale-150"
                          : isAnswered
                            ? "bg-emerald-500"
                            : isPast
                              ? "bg-gray-400"
                              : "bg-gray-300"
                      }`}
                      title={`Question ${idx + 1}${isAnswered ? " (Answered)" : ""}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Question Header */}
            <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                    {getQuestionTypeIcon(currentQ.questionType)}
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                      {currentQ.questionType.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                    <Award size={14} className="text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700">
                      {currentQ.points}{" "}
                      {currentQ.points === 1 ? "Point" : "Points"}
                    </span>
                  </div>
                </div>

                {currentQ.questionType === "multiple-correct" && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    Select all that apply
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-relaxed">
                {currentQ.questionText}
              </h2>
            </div>

            {/* Answer Section */}
            <div className="p-6 sm:p-8 bg-gray-50/30">
              {/* MCQ / Multiple Choice */}
              {(currentQ.questionType === "mcq" ||
                currentQ.questionType === "multiple-correct") && (
                <div className="grid gap-3">
                  {currentQ.options?.map((opt, idx) => {
                    const isSelected =
                      currentQ.questionType === "multiple-correct"
                        ? Array.isArray(currentAnswer) &&
                          currentAnswer.includes(opt.text)
                        : currentAnswer === opt.text;

                    return (
                      <button
                        key={idx}
                        onClick={() =>
                          handleAnswer(opt.text, currentQ.questionType)
                        }
                        disabled={isSubmitting}
                        className={`relative p-4 sm:p-5 text-left rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100"
                            : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
                        } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.01]"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span
                            className={`font-medium ${isSelected ? "text-indigo-900" : "text-gray-700"}`}
                          >
                            {opt.text}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="text-indigo-600 w-5 h-5 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill in Blank / Descriptive */}
              {(currentQ.questionType === "fill-blank" ||
                currentQ.questionType === "descriptive") && (
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      value={currentAnswer || ""}
                      onChange={(e) => handleAnswer(e.target.value, "text")}
                      disabled={isSubmitting}
                      placeholder="Type your answer here..."
                      className="w-full p-4 sm:p-5 text-base border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none bg-white min-h-[160px] sm:min-h-[200px]"
                    />
                    {currentAnswer && (
                      <div className="absolute bottom-3 right-3">
                        <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-200">
                          {currentAnswer.length} characters
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <AlertCircle size={16} className="text-blue-600 shrink-0" />
                    <span className="text-sm">
                      Your answer is automatically saved as you type.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              disabled={currentIndex === 0 || isSubmitting}
              className="flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200"
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:block">
                Press ← → to navigate
              </span>
            </div>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={() => submitQuiz(false)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-200 hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Quiz</span>
                    <Send size={18} />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 hover:shadow-xl transition-all duration-200"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Keyboard Navigation Hint */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Tip: Use arrow keys or click options to navigate through questions
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
