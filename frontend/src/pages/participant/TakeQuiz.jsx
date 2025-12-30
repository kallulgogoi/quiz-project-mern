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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const { data } = await api.post(endpoints.quiz.start(quizId));
        setQuestions(data.questions);
        setQuizMeta(data.quiz);
        setEndTime(new Date(data.quiz.endTime));
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
    [answers, quizId, navigate]
  );

  useEffect(() => {
    if (!endTime) return;

    const calculateTime = () => {
      const now = new Date();
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
  }, [endTime, submitQuiz]);

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
      setAnswers((prev) => ({
        ...prev,
        [currentQId]: val,
      }));
    }
  };

  if (!questions.length || timeLeft === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <TrophySpin
          color="#23eeff"
          size="medium"
          text="loading"
          textColor="#0ae6f9"
        />
        <p className="text-gray-500 font-medium">Preparing your quiz...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-800 text-lg hidden md:block">
              {quizMeta?.title || "Quiz"}
            </h1>
            <span className="text-xs text-gray-400 font-mono">
              Q{currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold transition-colors ${
              isTimeCritical
                ? "bg-red-50 text-red-600 border border-red-100 animate-pulse"
                : "bg-blue-50 text-blue-600 border border-blue-100"
            }`}
          >
            <Timer size={18} />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="h-1 bg-gray-100 w-full">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {currentQ.questionType.replace("-", " ")}
              </span>
              <span className="text-gray-400 text-xs font-medium">
                {currentQ.points} Points
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug">
              {currentQ.questionText}
            </h2>
          </div>

          <div className="p-6 md:p-8 bg-gray-50/50">
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
                      className={`relative p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between group ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-800 shadow-sm"
                          : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-white text-gray-700"
                      } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className="font-medium">{opt.text}</span>
                      {isSelected && (
                        <CheckCircle2 className="text-indigo-600 w-5 h-5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {(currentQ.questionType === "fill-blank" ||
              currentQ.questionType === "descriptive") && (
              <div className="space-y-2">
                <textarea
                  value={currentAnswer || ""}
                  onChange={(e) => handleAnswer(e.target.value, "text")}
                  disabled={isSubmitting}
                  placeholder="Type your answer here..."
                  className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none bg-white min-h-[120px]"
                />
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Your answer is saved automatically as you type.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between w-full mt-6">
          <button
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            disabled={currentIndex === 0 || isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={20} /> Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={() => submitQuiz(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Sending...
                </>
              ) : (
                <>
                  Submit Quiz <Send size={18} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
            >
              Next <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
