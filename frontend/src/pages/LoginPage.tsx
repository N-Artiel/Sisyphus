import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/");
  }

  return (
    <div className="login">
      <div className="login-scene" aria-hidden="true">
        <div className="login-sun" />
        <div className="login-scrim" />
        <div className="login-ridge" />
        <div className="login-boulder" />
      </div>

      <div className="login-content">
        <div className="login-eyebrow rise-in">A TASK &amp; PROJECT TRACKER</div>
        <h1 className="login-title rise-in" style={{ animationDelay: "0.08s" }}>Sisyphus</h1>
        <p className="login-quote rise-in" style={{ animationDelay: "0.16s" }}>
          "The struggle itself toward the heights is enough to fill a man's heart.
          One must imagine Sisyphus happy."
          <span>— Albert Camus, <em>The Myth of Sisyphus</em></span>
        </p>

        <form onSubmit={handleSubmit} className="login-card rise-in" style={{ animationDelay: "0.26s" }}>
          <h2>{mode === "signin" ? "Begin the ascent" : "Start a new ascent"}</h2>
          <input
            className="field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
          {error && <p className="error-banner">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <button
            type="button"
            className="login-toggle"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
          >
            {mode === "signin" ? "New here? Create an account" : "Already climbing? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
