import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../api";

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
    // Same intentional fetch-on-mount tradeoff as the dashboard page.
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

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", fontFamily: "sans-serif" }}>
      <Link to="/">&larr; Back to projects</Link>
      <h1>{project ? project.name : "Project"}</h1>

      <form onSubmit={handleAddTask} style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input
          type="text"
          placeholder="New task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {tasks.length === 0 ? (
        <p>No tasks yet — add one above.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((task) => (
            <li key={task.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #ddd" }}>
              <input type="checkbox" checked={task.is_done} onChange={() => toggleDone(task)} />
              <span style={{ flex: 1, textDecoration: task.is_done ? "line-through" : "none" }}>{task.title}</span>
              <button onClick={() => handleDelete(task.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}