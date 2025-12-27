import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import api, { endpoints } from "../../api/axios"; // Import API
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function UserLobby() {
  const { quizId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState("Waiting for host to start...");

  useEffect(() => {
    // 1. Check status immediately via API (Handles late joins/refreshes)
    const checkQuizStatus = async () => {
      try {
        // We need a public or participant-accessible endpoint to check status
        // reusing getQuizByCode or create a specific status endpoint is best.
        // For now, let's try the join endpoint or getById if allowed.
        // Assuming we can just try to "start" it to see if it's active,
        // or better: fetch details.

        // Note: You might need to adjust your backend to allow getting basic quiz info
        // (like status) without being the host.
        // If getQuizById is restricted, you might need a lightweight endpoint.
        // But usually, if you joined, you can fetch it.

        const { data } = await api.get(endpoints.quiz.getById(quizId));
        if (data.quiz.status === "active") {
          toast.success("Quiz is already live! Joining now...");
          navigate(`/take-quiz/${quizId}`);
        }
      } catch (err) {
        console.error("Status check failed", err);
      }
    };

    checkQuizStatus();

    if (!socket) return;

    // 2. Join the socket room
    socket.emit("join-quiz-room", quizId); // Make sure this matches server: socket.on("join-quiz-room")

    // 3. Listen for start event
    // FIXED: Changed from 'quiz-start' to 'quiz-started' to match Controller
    socket.on("quiz-started", () => {
      toast.success("Host started the quiz!");
      navigate(`/take-quiz/${quizId}`);
    });

    return () => {
      socket.off("quiz-started");
    };
  }, [socket, quizId, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold mb-2">You're In!</h1>
        <p className="text-gray-500 mb-8">{status}</p>

        <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center font-bold">
            {user?.username?.[0].toUpperCase()}
          </div>
          <div className="text-left">
            <p className="font-semibold">{user?.username}</p>
            <p className="text-xs text-gray-400">Ready to play</p>
          </div>
        </div>
      </div>
    </div>
  );
}
