import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { useSocket } from "../../context/SocketContext";
import { Users, Play, StopCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function HostLobby() {
  const { quizId } = useParams();
  const socket = useSocket();
  const [quiz, setQuiz] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    // Fetch initial quiz data
    const fetchQuiz = async () => {
      try {
        // 1. Fetch ONLY the specific quiz using your new endpoint
        const { data } = await api.get(endpoints.quiz.getById(quizId));

        // 2. Set the state directly with the result
        setQuiz(data.quiz);
      } catch (err) {
        console.error(err);
        // Optional: Add a toast error here if you want
      }
    };
    fetchQuiz();

    if (socket) {
      socket.emit("create-room", quizId);
    }
  }, [quizId, socket]);

  const startQuiz = async () => {
    try {
      await api.post(endpoints.quiz.startLive(quizId));
      toast.success("Quiz Started Live!");
      setQuiz((prev) => ({ ...prev, status: "active" }));
    } catch (err) {
      toast.error("Failed to start");
    }
  };

  const endQuiz = async () => {
    try {
      await api.post(endpoints.quiz.endLive(quizId));
      toast.success("Quiz Ended");
      setQuiz((prev) => ({ ...prev, status: "completed" }));
    } catch (err) {
      toast.error("Failed to end");
    }
  };

  if (!quiz) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-2">{quiz.title}</h1>
      <div className="text-6xl font-mono font-bold text-blue-600 my-8 bg-blue-50 p-6 rounded-xl inline-block border-2 border-blue-100">
        {quiz.code}
      </div>
      <p className="text-gray-500 mb-8">Share this code with participants</p>

      <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <Users className="w-8 h-8 mx-auto text-purple-500 mb-2" />
          <h3 className="text-2xl font-bold">
            {quiz.participants?.length || 0}
          </h3>
          <p className="text-gray-500">Participants</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div
            className={`w-3 h-3 rounded-full mx-auto mb-4 ${
              quiz.status === "active"
                ? "bg-green-500 animate-pulse"
                : "bg-gray-300"
            }`}
          />
          <p className="font-semibold capitalize">{quiz.status}</p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        {quiz.status !== "active" && quiz.status !== "completed" && (
          <button
            onClick={startQuiz}
            className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl text-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all"
          >
            <Play fill="currentColor" /> Start Live Quiz
          </button>
        )}

        {quiz.status === "active" && (
          <button
            onClick={endQuiz}
            className="flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-xl text-xl font-bold hover:bg-red-700 shadow-lg hover:shadow-red-200 transition-all"
          >
            <StopCircle /> End Quiz
          </button>
        )}
      </div>
    </div>
  );
}
