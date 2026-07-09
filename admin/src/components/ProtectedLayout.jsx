import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminShell from "./AdminShell";
import { TileSkeleton } from "./ui/Skeleton";

export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: 32, display: "grid", gap: 16 }}>
        <TileSkeleton height={80} />
        <TileSkeleton height={240} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
