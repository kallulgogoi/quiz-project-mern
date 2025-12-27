import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api, { endpoints } from "../api/axios";
import {
  Camera,
  Save,
  User,
  Mail,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, setUser } = useAuth();

  // Profile State
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Password State
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialize Data
  useEffect(() => {
    if (user) {
      setFormData({ username: user.username, email: user.email });
      setImagePreview(user.profilePicture);
    }
  }, [user]);

  // --- Profile Logic ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024)
        return toast.error("Image size must be < 5MB");
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const data = new FormData();
      data.append("username", formData.username);
      if (imageFile) data.append("profilePicture", imageFile);

      const response = await api.put(endpoints.auth.updateProfile, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(response.data.user);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  // --- Password Logic ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (passData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoadingPassword(true);
    try {
      await api.put(endpoints.auth.changePassword, {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      toast.success("Password changed successfully!");
      setPassData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Profile Details */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
            <User className="text-blue-600" /> Personal Info
          </h2>

          <form onSubmit={handleProfileSubmit}>
            {/* Image Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group cursor-pointer">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <User size={40} />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail
                    size={16}
                    className="absolute left-3 top-3.5 text-gray-400"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-9 p-3 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingProfile}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              {loadingProfile ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Save size={18} /> Save Profile
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Change Password */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
            <ShieldCheck className="text-green-600" /> Security
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative mt-1">
                <Lock
                  size={16}
                  className="absolute left-3 top-3.5 text-gray-400"
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passData.currentPassword}
                  onChange={(e) =>
                    setPassData({
                      ...passData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full pl-9 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative mt-1">
                <Lock
                  size={16}
                  className="absolute left-3 top-3.5 text-gray-400"
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passData.newPassword}
                  onChange={(e) =>
                    setPassData({ ...passData, newPassword: e.target.value })
                  }
                  className="w-full pl-9 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <Lock
                  size={16}
                  className="absolute left-3 top-3.5 text-gray-400"
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passData.confirmPassword}
                  onChange={(e) =>
                    setPassData({
                      ...passData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-9 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingPassword}
              className="w-full mt-6 bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2"
            >
              {loadingPassword ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
