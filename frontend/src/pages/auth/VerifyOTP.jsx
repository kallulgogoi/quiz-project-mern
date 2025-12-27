import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Mail, Loader2, RefreshCw } from "lucide-react";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const email = location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.post(endpoints.auth.verify, { email, otp });

      localStorage.setItem("token", data.token);
      setUser(data.user);

      toast.success("Email verified successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await api.post("/auth/resend-otp", { email });
      toast.success("New OTP sent to your email");
      setOtp(""); // Clear previous input
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No email provided.</p>
          <Link
            to="/login"
            className="text-slate-900 font-medium hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
          {/* Icon & Title */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-5">
              <Mail size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Check Your Email
            </h1>
            <p className="text-slate-600 mt-3 max-w-sm mx-auto">
              We've sent a 6-digit verification code to
              <span className="font-semibold text-slate-900"> {email}</span>
            </p>
          </div>

          {/* OTP Input Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={isLoading}
                className="w-full max-w-xs mx-auto px-6 py-5 text-3xl font-mono tracking-widest text-center border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition disabled:opacity-70"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition shadow-lg disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </button>
          </form>

          {/* Resend Link */}
          <div className="mt-8">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center gap-2 text-slate-700 font-medium hover:text-slate-900 transition disabled:opacity-60"
            >
              {isResending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Resend Code
                </>
              )}
            </button>
          </div>

          {/* Back Link */}
          <div className="mt-8">
            <Link
              to="/login"
              className="text-sm text-slate-500 hover:text-slate-700 transition"
            >
              ← Back to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} QuizMaster. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
