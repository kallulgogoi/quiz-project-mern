import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api, { endpoints } from "../api/axios";
import { Camera, Save, User, Mail, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Profile State
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Initialize Data
  useEffect(() => {
    if (user) {
      setFormData({ username: user.username, email: user.email });
      setImagePreview(user.profilePicture);
    }
  }, [user]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-3 bg-white hover:bg-gray-100 rounded-xl text-gray-500 shadow-sm border border-gray-200 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-Merriweather text-gray-800">
              Account Settings
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your personal information
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-fit transition-shadow hover:shadow-lg">
          <h2 className="text-lg font-bold font-Merriweather text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User size={20} />
            </div>
            Personal Information
          </h2>

          <form onSubmit={handleProfileSubmit}>
            {/* Image Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-4 ring-gray-50 transition-all group-hover:ring-blue-50">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all rounded-full backdrop-blur-sm cursor-pointer">
                  <div className="flex flex-col items-center gap-1">
                    <Camera size={24} />
                    <span className="text-xs font-medium">Change</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-3.5 text-gray-400"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 p-3.5 bg-gray-100/50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 ml-1">
                  Email is linked to your Google account
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingProfile}
              className="w-full mt-8 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loadingProfile ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
