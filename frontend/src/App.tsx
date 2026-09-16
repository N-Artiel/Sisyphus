import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/projects/:id" element={user ? <ProjectPage /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;