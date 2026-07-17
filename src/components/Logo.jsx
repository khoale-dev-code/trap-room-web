import { useState } from "react";

export default function Logo({ src = "/trap-logo.png", className = "" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={`font-display lowercase tracking-[-0.08em] text-trap-blue ${className}`}>
        trap
      </span>
    );
  }

  return (
    <img
      src={src || "/trap-logo.png"}
      alt="TRAP Room"
      onError={() => setFailed(true)}
      className={`block object-contain ${className}`}
    />
  );
}
