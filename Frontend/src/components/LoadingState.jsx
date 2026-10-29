
import { LoaderCircle } from "lucide-react";

export default function LoadingState({
  message = "Loading your data...",
  compact = false,
}) {
  return (
    <div
      className={`cloudsight-loading ${compact ? "is-compact" : ""}`}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className="cloudsight-loading-icon" size={compact ? 20 : 30} />
      <span>{message}</span>
    </div>
  );
}
