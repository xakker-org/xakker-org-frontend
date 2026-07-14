import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
      {/* Unlike the main app (whole page + sidebar remount per route,
          see app/src/App.jsx), AdminShell is a persistent layout around
          <Outlet/> here — so the fade/rise only touches page content,
          the sidebar/topbar never re-animate on navigation. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </AdminShell>
  );
}
