import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TrophySpin } from "react-loading-indicators";
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TrophySpin
          color="#23eeff"
          size="medium"
          text="loading"
          textColor="#0ae6f9"
        />
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
