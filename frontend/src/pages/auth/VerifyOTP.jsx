import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Helper from context to update state manually if needed

  const [otp, setOtp] = useState("");
  const email = location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(endpoints.auth.verify, { email, otp });

      // Save token and update user
      localStorage.setItem("token", data.token);
      setUser(data.user);

      toast.success("Email verified successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-otp", { email });
      toast.success("New OTP sent to your email");
    } catch (err) {
      toast.error("Failed to resend OTP");
    }
  };

  if (!email)
    return (
      <div className="p-10 text-center">
        No email provided. Go back to login.
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Verify Email</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Enter the code sent to {email}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            className="w-full p-3 text-center text-2xl tracking-widest border rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium mb-4">
            Verify & Login
          </button>
        </form>

        <button
          onClick={handleResend}
          className="text-sm text-blue-600 hover:underline"
        >
          Resend Code
        </button>
      </div>
    </div>
  );
}
