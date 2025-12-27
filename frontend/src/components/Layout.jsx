import { useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Helper to check active link
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="text-2xl font-bold text-blue-600 tracking-tight"
          >
            QuizMaster
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`font-medium transition-colors ${
                isActive("/")
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Dashboard
            </Link>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
                title="View Profile"
              >
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold overflow-hidden border border-blue-200 group-hover:border-blue-400 transition-colors">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.username?.[0]?.toUpperCase() || <User size={16} />
                  )}
                </div>
                <span className="hidden lg:block font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {user?.username}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors ml-2"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t mt-4 space-y-2 animate-fade-in-down">
            <Link
              to="/"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive("/")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <LayoutDashboard size={20} /> Dashboard
            </Link>

            <Link
              to="/profile"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive("/profile")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <UserCircle size={20} /> My Profile
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 text-left"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
