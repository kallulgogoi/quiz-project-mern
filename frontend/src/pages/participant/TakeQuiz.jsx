import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { Timer } from "lucide-react";
import { differenceInSeconds } from "date-fns";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: answer }
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const { data } = await api.post(endpoints.quiz.start(quizId));
        setQuestions(data.questions);

        // Calculate Time Remaining based on server-provided End Time
        // This handles late joins correctly
        const endTime = new Date(data.quiz.endTime);
        const now = new Date();
        const diff = differenceInSeconds(endTime, now);

        setTimeLeft(diff > 0 ? diff : 0);
      } catch (err) {
        alert(err.response?.data?.message || "Error starting quiz");
        navigate("/dashboard");
      }
    };
    startQuiz();
  }, [quizId, navigate]);

  // Global Timer (Counts down to zero)
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (val) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentIndex]._id]: val,
    }));
  };

  const submitQuiz = async () => {
    // Format answers for backend
    const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
      questionId: qId,
      answer: val,
    }));

    try {
      await api.post(endpoints.quiz.submit(quizId), {
        answers: formattedAnswers,
      });
      navigate(`/result/${quizId}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (questions.length === 0)
    return <div className="p-10 text-center">Loading Quiz...</div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
        <span className="text-gray-500">
          Question {currentIndex + 1}/{questions.length}
        </span>
        <div className="flex items-center gap-2 text-orange-600 font-bold">
          <Timer size={20} />
          {/* Global Timer Display */}
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {currentQ.questionText}
        </h2>

        {/* MCQ / Options */}
        <div className="grid gap-3">
          {currentQ.options?.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(opt.text)}
              className={`p-4 text-left rounded-lg border-2 transition-all ${
                answers[currentQ._id] === opt.text
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              {opt.text}
            </button>
          ))}

          {currentQ.questionType === "fill-blank" && (
            <input
              type="text"
              placeholder="Type your answer..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
              onChange={(e) => handleAnswer(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-3xl flex justify-between mt-8">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          className="px-6 py-2 text-gray-600 disabled:opacity-50"
        >
          Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={submitQuiz}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-200"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}
