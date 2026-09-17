import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";
import NotFoundPage from "./pages/NotFoundPage";
import { BoulderLoader } from "./components/Boulder";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
        <BoulderLoader label="Finding your footing…" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/projects/:id" element={user ? <ProjectPage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
