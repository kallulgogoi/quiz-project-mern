import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import toast from "react-hot-toast";
import { LogIn, Loader2, ArrowLeft } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        ).then((res) => res.json());

        const { data } = await api.post(endpoints.auth.google, {
          email: userInfo.email,
          username: userInfo.name,
          googleId: userInfo.sub,
          profilePicture: userInfo.picture,
        });

        localStorage.setItem("token", data.token);
        setUser(data.user);
        toast.success("Welcome back!");
        navigate("/dashboard");
      } catch (err) {
        console.error("Login failed:", err);
        toast.error("Login failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error("Google Login Failed"),
  });

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-enter {
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-700" />

        {/* Login Card */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 md:p-12 text-center relative z-10 animate-enter">
          {/* Back Button */}
          <Link
            to="/"
            className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 transition-all"
            title="Back to Home"
          >
            <ArrowLeft size={20} />
          </Link>

          {/* Logo Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-8 shadow-lg shadow-indigo-200 transform rotate-3 hover:rotate-6 transition-transform duration-300">
            <LogIn size={32} className="text-white" />
          </div>

          {/* Headings */}
          <h1 className="text-4xl font-bold font-Merriweather text-slate-900 mb-3">
            Welcome Back
          </h1>
          <p className="text-slate-600 mb-10 text-lg">
            Sign in to access your dashboard
          </p>

          {/* Action Area */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
              <span className="font-medium text-slate-600">
                Securely logging you in...
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => googleLogin()}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 text-slate-700 font-bold py-4 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/30 hover:shadow-lg transition-all duration-300 group transform hover:-translate-y-0.5"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-6 h-6"
                />
                <span className="group-hover:text-indigo-900 transition-colors text-lg">
                  Continue with Google
                </span>
              </button>

              {/* 🟢 NEW: Go to Register Page */}
              <div className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-indigo-600 hover:text-indigo-800 underline transition"
                >
                  Create one here
                </Link>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              By continuing, you agree to BudhiX's{" "}
              <Link
                to="#"
                className="underline hover:text-indigo-600 transition"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                to="#"
                className="underline hover:text-indigo-600 transition"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
