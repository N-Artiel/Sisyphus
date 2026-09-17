import { Link } from "react-router-dom";
import { Boulder } from "../components/Boulder";

export default function NotFoundPage() {
  return (
    <div className="page">
      <div className="empty-state rise-in" style={{ margin: "auto" }}>
        <Boulder size={32} />
        <h1 style={{ fontSize: "var(--fs-2xl)" }}>Off the path</h1>
        <p>There's no ascent here. The stone must have rolled somewhere else.</p>
        <Link to="/" className="btn btn-ghost" style={{ marginTop: 8 }}>
          Back to your ascents
        </Link>
      </div>
    </div>
  );
}
