import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedLayout from "./components/ProtectedLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ResourceListPage from "./pages/ResourceListPage";
import ResourceEditPage from "./pages/ResourceEditPage";
import UsersPage from "./pages/UsersPage";
import AdminsPage from "./pages/AdminsPage";
import UserDetailPage from "./pages/UserDetailPage";
import ProgressPage from "./pages/ProgressPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/content/:type" element={<ResourceListPage />} />
        <Route path="/content/:type/new" element={<ResourceEditPage />} />
        <Route path="/content/:type/:id" element={<ResourceEditPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/admins" element={<AdminsPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
