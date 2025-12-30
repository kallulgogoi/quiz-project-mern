import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import {
  ArrowLeft,
  Search,
  User,
  ChevronRight,
  Download, // Import Download icon
} from "lucide-react";
import { TrophySpin } from "react-loading-indicators";
import * as XLSX from "xlsx"; // 🟢 IMPORT XLSX

export default function QuizReports() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const { data } = await api.get(endpoints.quiz.allAttempts(quizId));
        setAttempts(data.attempts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, [quizId]);

  // 🟢 NEW: Handle Excel Download
  const handleDownloadExcel = () => {
    if (attempts.length === 0) return;

    // 1. Format Data for Excel
    const dataToExport = attempts.map((attempt) => ({
      "Participant Name": attempt.user.username,
      "Email": attempt.user.email,
      "Score": attempt.totalScore,
      "Time Taken (sec)": attempt.timeTaken,
      "Date": new Date(attempt.finishedAt).toLocaleDateString(),
    }));

    // 2. Create Sheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz Results");

    // 3. Download File
    XLSX.writeFile(workbook, `Quiz_Report_${quizId}.xlsx`);
  };

  const filteredAttempts = attempts.filter((a) =>
    a.user.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <TrophySpin color="#4f46e5" size="medium" text="" textColor="" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={() => navigate("/created-quizzes")}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Participant Reports
              </h1>
              <p className="text-gray-500 text-sm">
                Total Attempts: {attempts.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* 🟢 NEW: Download Button */}
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-sm whitespace-nowrap"
            >
              <Download size={18} /> Export CSV
            </button>

            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <User size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-gray-500 font-medium">
                No participants found
              </h3>
            </div>
          ) : (
            filteredAttempts.map((attempt) => (
              <div
                key={attempt._id}
                onClick={() => navigate(`/host/report/${attempt._id}`)}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    {attempt.user.profilePicture ? (
                      <img
                        src={attempt.user.profilePicture}
                        alt="avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-indigo-600 text-lg">
                        {attempt.user.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {attempt.user.username}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {attempt.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Score
                    </p>
                    <p className="text-xl font-black text-indigo-600">
                      {attempt.totalScore}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Time
                    </p>
                    <p className="text-sm font-bold text-gray-700">
                      {attempt.timeTaken}s
                    </p>
                  </div>
                  <ChevronRight className="text-gray-300" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}