import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./components/AppShell";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import MissionDetailPage from "./pages/MissionDetailPage";
import MissionsPage from "./pages/MissionsPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import PlansPage from "./pages/PlansPage";
import PlanDetailPage from "./pages/PlanDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import CoursesPage from "./pages/CoursesPage";
import CoursePage from "./pages/CoursePage";
import LessonPage from "./pages/LessonPage";
import AiAssistantPage from "./pages/AiAssistantPage";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle("self-study-body", true);
    return () => {
      document.body.classList.remove("self-study-body");
    };
  }, [location.pathname]);

  return (
    <Routes location={location}>
      {/* Root */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth (no shell) */}
      <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth/:mode" element={<AuthPage />} />

      {/* Authenticated app — persistent shell, only the Outlet content transitions */}
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* ── Missions (CTF-style, Round 19 — replaces old passes+exam flow) ── */}
        <Route path="/missions" element={<MissionsPage />} />
        <Route path="/missions/:slug" element={<MissionDetailPage />} />

        {/* Rooms / Plans / Courses */}
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:slug" element={<RoomDetailPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/plans/:slug" element={<PlanDetailPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CoursePage />} />
        <Route path="/courses/:slug/lessons/:lessonId" element={<LessonPage />} />

        {/* Community */}
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Xakker AI */}
        <Route path="/xakker-ai" element={<AiAssistantPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
