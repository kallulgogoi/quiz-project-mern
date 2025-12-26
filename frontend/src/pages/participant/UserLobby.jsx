import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function UserLobby() {
  const { quizId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState("Waiting for host to start...");

  useEffect(() => {
    if (!socket) return;

    // Join the socket room
    socket.emit("join-quiz", quizId);

    // Listen for start event
    socket.on("quiz-start", () => {
      navigate(`/take-quiz/${quizId}`);
    });

    return () => {
      socket.off("quiz-start");
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
