
import { AlertTriangle, Loader2, X } from "lucide-react";

export default function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-end bg-trap-ink/45 p-0 backdrop-blur-sm sm:place-items-center sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onCancel();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        className="w-full rounded-t-[1.5rem] bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-[1.5rem] sm:p-6"
        style={{
          paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-red-100 text-red-700">
            <AlertTriangle size={21} />
          </span>

          <button
            type="button"
            className="admin-icon-button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Close confirmation"
          >
            <X size={18} />
          </button>
        </div>

        <h2
          id="admin-confirm-title"
          className="mt-5 text-2xl font-extrabold text-trap-blue"
        >
          {title}
        </h2>

        <p className="mt-3 text-sm font-medium leading-6 text-trap-ink/60">
          {description}
        </p>

        <div className="mt-7 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            className="admin-button-secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            className="admin-button-danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy && <Loader2 className="animate-spin" size={16} />}
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
