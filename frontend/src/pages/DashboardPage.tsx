import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { supabase } from "../supabaseClient";
import { BoulderLoader, Boulder } from "../components/Boulder";
import "./DashboardPage.css";

interface Project {
  id: string;
  name: string;
  created_at: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadProjects = useCallback(async () => {
    try {
      const data = await apiFetch("/projects");
      setProjects(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProjects();
  }, [loadProjects]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await apiFetch("/projects", { method: "POST", body: JSON.stringify({ name }) });
      setName("");
      loadProjects();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="dash page">
      <header className="dash-header rise-in">
        <div className="dash-wordmark">
          <span className="boulder" style={{ width: 18, height: 18 }} />
          <span>Sisyphus</span>
        </div>
        <button className="btn btn-ghost" onClick={handleSignOut}>Sign out</button>
      </header>

      <div className="dash-intro rise-in" style={{ animationDelay: "0.05s" }}>
        <h1>Your ascents</h1>
        <p>Every mountain begins the same way — with a single stone.</p>
      </div>

      <form onSubmit={handleCreate} className="dash-new rise-in" style={{ animationDelay: "0.1s" }}>
        <input
          className="field"
          type="text"
          placeholder="Name a new ascent…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Begin</button>
      </form>

      {error && <p className="error-banner rise-in">{error}</p>}

      {loading ? (
        <BoulderLoader label="Finding your mountains…" />
      ) : projects.length === 0 ? (
        <div className="empty-state rise-in">
          <Boulder size={32} />
          <p>No ascents yet. Start one above — the climb only ever begins with a first push.</p>
        </div>
      ) : (
        <ul className="dash-grid">
          {projects.map((p, i) => (
            <li
              key={p.id}
              className="dash-card card rise-in"
              style={{ animationDelay: `${0.12 + i * 0.04}s` }}
            >
              <Link to={`/projects/${p.id}`}>
                <span className="dash-card-peak" aria-hidden="true" />
                <h3>{p.name}</h3>
                <time className="dash-card-date">
                  {new Date(p.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
