import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../api";
import { BoulderLoader, Boulder } from "../components/Boulder";
import "./ProjectPage.css";

interface Task {
  id: string;
  title: string;
  is_done: boolean;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [projects, taskList] = await Promise.all([
        apiFetch("/projects"),
        apiFetch(`/tasks?project_id=${id}`),
      ]);
      setProject(projects.find((p: Project) => p.id === id) ?? null);
      setTasks(taskList);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleAddTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await apiFetch("/tasks", { method: "POST", body: JSON.stringify({ project_id: id, title }) });
      setTitle("");
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggleDone(task: Task) {
    try {
      await apiFetch(`/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_done: !task.is_done }),
      });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(taskId: string) {
    try {
      await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <BoulderLoader label="Retracing the path…" />
      </div>
    );
  }

  const done = tasks.filter((t) => t.is_done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="page proj">
      <Link to="/" className="proj-back rise-in">&larr; Back to ascents</Link>

      <div className="proj-intro rise-in" style={{ animationDelay: "0.05s" }}>
        <h1>{project ? project.name : "Project"}</h1>
        {tasks.length > 0 && (
          <div className="proj-progress">
            <div className="proj-progress-track">
              <div className="proj-progress-fill" style={{ width: `${pct}%` }} />
              <div className="proj-progress-boulder" style={{ left: `${pct}%` }} />
            </div>
            <span>{done} of {tasks.length} stones placed</span>
          </div>
        )}
      </div>

      <form onSubmit={handleAddTask} className="proj-new rise-in" style={{ animationDelay: "0.1s" }}>
        <input
          className="field"
          type="text"
          placeholder="Add a stone to carry up…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>

      {error && <p className="error-banner rise-in">{error}</p>}

      {tasks.length === 0 ? (
        <div className="empty-state rise-in">
          <Boulder size={32} />
          <p>No stones yet. Add the first one above.</p>
        </div>
      ) : (
        <ul className="proj-list">
          {tasks.map((task, i) => (
            <li
              key={task.id}
              className={`proj-item card rise-in ${task.is_done ? "is-done" : ""}`}
              style={{ animationDelay: `${0.12 + i * 0.03}s` }}
            >
              <button
                type="button"
                className="proj-stone"
                onClick={() => toggleDone(task)}
                aria-label={task.is_done ? "Mark as not done" : "Mark as done"}
                aria-pressed={task.is_done}
              />
              <span className="proj-item-title">{task.title}</span>
              <button
                type="button"
                className="btn-icon"
                onClick={() => handleDelete(task.id)}
                aria-label="Delete task"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
