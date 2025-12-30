// components/Layout.jsx
import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  UserCircle,
  PencilRuler,
  Trophy,
} from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully!");
    setIsMobileMenuOpen(false);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const displayUsername = user?.username
    ? user.username.length > 6
      ? user.username.slice(0, 6) + "..."
      : user.username
    : "User";

  const navItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    {
      path: "/created-quizzes",
      label: "My Quizzes",
      icon: <PencilRuler size={20} />,
    },
    {
      path: "/participated-quizzes",
      label: "Participated quizzes",
      icon: <Trophy size={20} />,
    },
    { path: "/profile", label: "Profile", icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            onClick={closeMenu}
            className="text-3xl font-black tracking-tight bg-linear-to-r from-indigo-600 to-purple-600 font-Kanit bg-clip-text text-transparent"
          >
            BuddhiX
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-2xl shadow-inner">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? "bg-white text-indigo-600 shadow-md"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-white/60"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* User Section */}
            <div className="ml-4 pl-4 border-l border-slate-300 flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden"
                  title={user?.username || "User"}
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.username?.[0]?.toUpperCase() || <User size={20} />
                  )}
                </div>
                <span className="font-semibold text-slate-800 hidden lg:block">
                  {displayUsername}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 hover:scale-110 transition-all duration-200 shadow-sm"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 bg-slate-100 rounded-xl text-slate-700 hover:bg-slate-200 transition"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
                      isActive(item.path)
                        ? "bg-indigo-100 text-indigo-700 shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.icon}
                    <span className="text-lg">{item.label}</span>
                  </Link>
                ))}

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.username?.[0]?.toUpperCase() || <User size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">
                        {displayUsername}
                      </p>
                      <p className="text-sm text-slate-500">View profile</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-5 py-4 mt-2 bg-red-100 text-red-600 rounded-2xl font-semibold hover:bg-red-200 transition"
                  >
                    <LogOut size={22} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="pb-10">
        <Outlet />
      </main>
    </div>
  );
}
