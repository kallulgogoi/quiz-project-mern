import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { Trophy, Medal, Home } from "lucide-react";

export default function Result() {
  const { quizId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myResult, setMyResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Leaderboard
        const lbRes = await api.get(endpoints.quiz.leaderboard(quizId));
        setLeaderboard(lbRes.data.leaderboard);

        // We could also fetch user's specific result from "participated quizzes" API or local logic
        // For now, let's just grab the user from the leaderboard if they exist
        // Or you can create a specific endpoint for "my-result"
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

  if (loading)
    return <div className="p-10 text-center">Calculating results...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-10">
        <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
          <Trophy className="w-12 h-12 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Quiz Completed!</h1>
        <p className="text-gray-500">Here is how everyone performed</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 bg-gray-50 border-b font-semibold grid grid-cols-12 gap-4 text-gray-500 text-sm uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">Participant</div>
          <div className="col-span-4 text-right">Score</div>
        </div>

        <div className="divide-y">
          {leaderboard.map((entry, index) => (
            <div
              key={index}
              className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50"
            >
              <div className="col-span-2 text-center font-bold text-gray-700">
                {index === 0 && (
                  <Medal className="w-6 h-6 mx-auto text-yellow-500" />
                )}
                {index === 1 && (
                  <Medal className="w-6 h-6 mx-auto text-gray-400" />
                )}
                {index === 2 && (
                  <Medal className="w-6 h-6 mx-auto text-orange-400" />
                )}
                {index > 2 && `#${index + 1}`}
              </div>
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                  {entry.user?.username?.[0]}
                </div>
                <span className="font-medium">{entry.user?.username}</span>
              </div>
              <div className="col-span-4 text-right font-mono font-bold text-blue-600">
                {entry.totalScore} pts
              </div>
            </div>
          ))}

          {leaderboard.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No results available yet.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/created-quizzes"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
        >
          <Home size={18} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
