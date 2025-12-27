import { useEffect, useState } from "react";
import api, { endpoints } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Play,
  BarChart2,
  Users,
  Trophy,
  ArrowRight,
  Layout,
  History,
  Target,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    createdCount: 0,
    participatedCount: 0,
    totalParticipants: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [createdRes, participatedRes] = await Promise.all([
          api.get(endpoints.quiz.myQuizzes("created")),
          api.get(endpoints.quiz.myQuizzes("participated")),
        ]);

        const created = createdRes.data.quizzes;
        const participated = participatedRes.data.quizzes;

        const totalParticipants = created.reduce(
          (acc, curr) => acc + (curr.participants?.length || 0),
          0
        );

        const totalScore = participated.reduce(
          (acc, curr) => acc + (curr.score || 0),
          0
        );
        const avgScore =
          participated.length > 0
            ? Math.round(totalScore / participated.length)
            : 0;

        setStats({
          createdCount: created.length,
          participatedCount: participated.length,
          totalParticipants,
          avgScore,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero / Welcome Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Hello, <span className="text-indigo-600">{user?.username}</span>{" "}
                👋
              </h1>
              <p className="text-lg text-gray-500 max-w-xl">
                Track your performance, manage your quizzes, and join new
                challenges all from one place.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate("/join")}
                className="px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm flex justify-center items-center"
              >
                Join with Code
              </button>
              <button
                onClick={() => navigate("/create")}
                className="px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2"
              >
                <Plus size={20} /> Create Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <h2 className="text-xl font-bold text-gray-800 mb-6">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard
            icon={<Layout className="text-blue-600" />}
            label="Quizzes You Hosted"
            value={stats.createdCount}
            bg="bg-blue-100"
          />
          <StatCard
            icon={<Users className="text-purple-600" />}
            label="Total Players Reached"
            value={stats.totalParticipants}
            bg="bg-purple-100"
          />
          <StatCard
            icon={<History className="text-orange-600" />}
            label="Quizzes You Taken"
            value={stats.participatedCount}
            bg="bg-orange-100"
          />
          <StatCard
            icon={<Target className="text-green-600" />}
            label="Your Average Score"
            value={`${stats.avgScore} pts`}
            bg="bg-green-100"
          />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Access</h2>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Host Path */}
          <div
            onClick={() => navigate("/created-quizzes")}
            className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-gray-200 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <BarChart2 size={140} className="text-indigo-600" />
            </div>

            <div className="relative z-10">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <BarChart2 size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Teacher & Host Mode
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm">
                Manage your created quizzes, launch live sessions, and view
                detailed reports for ended games.
              </p>
              <div className="flex items-center text-indigo-600 font-bold group-hover:gap-2 transition-all">
                Manage My Quizzes <ArrowRight size={20} className="ml-2" />
              </div>
            </div>
          </div>

          {/* Participant Path */}
          <div
            onClick={() => navigate("/participated-quizzes")}
            className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-gray-200 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Trophy size={140} className="text-pink-600" />
            </div>

            <div className="relative z-10">
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                <Play size={28} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Student & Player Mode
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm">
                Check your past attempts, review correct answers, and see how
                you ranked against others.
              </p>
              <div className="flex items-center text-pink-600 font-bold group-hover:gap-2 transition-all">
                View My History <ArrowRight size={20} className="ml-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:border-gray-300 transition-all">
      <div className={`p-4 rounded-xl ${bg} shrink-0`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}
