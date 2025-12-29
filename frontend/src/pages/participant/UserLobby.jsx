import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import api, { endpoints } from "../../api/axios";
import { TrophySpin } from "react-loading-indicators";
import toast from "react-hot-toast";

export default function UserLobby() {
  const { quizId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState("Waiting for host to start...");

  useEffect(() => {
    const checkQuizStatus = async () => {
      try {
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
    socket.emit("join-quiz-room", quizId);
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
        <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <TrophySpin
            color="#23eeff"
            size="medium"
            text=""
            textColor="#0ae6f9"
          />
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
