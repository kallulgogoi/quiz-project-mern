import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User } from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600 tracking-tight"
        >
          QuizMaster
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-600 hover:text-blue-600 font-medium"
          >
            Dashboard
          </Link>

          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                {user?.username?.[0].toUpperCase() || <User size={16} />}
              </div>
              <span className="hidden md:block font-medium text-gray-700">
                {user?.username}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
