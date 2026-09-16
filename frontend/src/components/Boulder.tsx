export function Boulder({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`boulder ${className}`}
      style={{ width: size, height: size, display: "inline-block", flexShrink: 0 }}
    />
  );
}

export function BoulderLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="boulder-loader">
      <Boulder size={26} />
      <span>{label}</span>
    </div>
  );
}
