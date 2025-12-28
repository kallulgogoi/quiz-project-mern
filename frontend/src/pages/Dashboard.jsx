import { useEffect, useState } from "react";
import api, { endpoints } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Play,
  Users,
  Trophy,
  ArrowRight,
  LayoutDashboard,
  History,
  Target,
  Loader2,
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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Light abstract waves/curves in very light gray */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-0 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -translate-x-1/2"></div>
      </div>

      {/* Clean White Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-Merriweather text-slate-900">
                Welcome back,{" "}
                <span className="text-indigo-600">{user?.username}</span>
              </h1>
              <p className="text-lg text-slate-600 mt-3">
                Here's a quick overview of your quiz activity.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button
                onClick={() => navigate("/join")}
                className="px-7 py-3.5 bg-white border-2 border-slate-300 text-slate-800 font-semibold rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Play size={20} />
                Join a Quiz
              </button>
              <button
                onClick={() => navigate("/create")}
                className="px-7 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md"
              >
                <Plus size={20} />
                Create New Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-8">
            Your Stats
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse"
                >
                  <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4 mx-auto"></div>
                  <div className="h-5 bg-slate-200 rounded w-32 mb-2 mx-auto"></div>
                  <div className="h-9 bg-slate-200 rounded w-20 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<LayoutDashboard size={32} className="text-indigo-600" />}
                label="Quizzes Created"
                value={stats.createdCount}
                description="Hosted by you"
              />
              <StatCard
                icon={<Users size={32} className="text-purple-600" />}
                label="Total Players"
                value={stats.totalParticipants}
                description="Joined your quizzes"
              />
              <StatCard
                icon={<History size={32} className="text-orange-600" />}
                label="Quizzes Played"
                value={stats.participatedCount}
                description="You participated in"
              />
              <StatCard
                icon={<Target size={32} className="text-green-600" />}
                label="Average Score"
                value={stats.avgScore === 0 ? "—" : `${stats.avgScore} pts`}
                description="Across all games"
              />
            </div>
          )}
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-8 text-center">
          What would you like to do?
        </h2>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div
            onClick={() => navigate("/created-quizzes")}
            className="group relative bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl border border-slate-200 transition-all duration-500 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-100/0 group-hover:from-indigo-50/80 group-hover:to-indigo-100/50 transition-all duration-500 rounded-3xl"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="p-6 bg-indigo-100 rounded-3xl mb-6 group-hover:scale-110 group-hover:bg-indigo-200 transition-all duration-300">
                <LayoutDashboard size={48} className="text-indigo-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Manage My Quizzes
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                View, edit, launch live sessions, and check detailed results for
                quizzes you've created.
              </p>
              <div className="mt-8 flex items-center gap-3 text-indigo-600 font-bold text-lg group-hover:gap-5 transition-all">
                Go to My Quizzes
                <ArrowRight
                  size={28}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </div>
            </div>
          </div>
          <div
            onClick={() => navigate("/participated-quizzes")}
            className="group relative bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl border border-slate-200 transition-all duration-500 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/0 to-pink-100/0 group-hover:from-pink-50/80 group-hover:to-pink-100/50 transition-all duration-500 rounded-3xl"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="p-6 bg-pink-100 rounded-3xl mb-6 group-hover:scale-110 group-hover:bg-pink-200 transition-all duration-300">
                <Trophy size={48} className="text-pink-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                My Game History
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                See all quizzes you've played, review your scores, correct
                answers, and rankings.
              </p>
              <div className="mt-8 flex items-center gap-3 text-pink-600 font-bold text-lg group-hover:gap-5 transition-all">
                View History
                <ArrowRight
                  size={28}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, description }) {
  return (
    <div className="bg-white rounded-2xl p-7 text-center shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-5">
        {icon}
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
      <p className="text-lg font-medium text-slate-800">{label}</p>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
  );
}
