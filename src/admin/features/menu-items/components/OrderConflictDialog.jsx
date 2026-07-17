
import {
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function OrderConflictDialog({
  open,
  editing,
  currentName,
  conflict,
  currentOrder,
  desiredOrder,
  copy,
  busy,
  onCancel,
  onConfirm,
}) {
  if (!open || !conflict) return null;

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-end bg-trap-ink/50 backdrop-blur-sm sm:place-items-center sm:p-5"
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
        className="w-full rounded-t-[1.5rem] bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-[1.5rem] sm:p-6"
        style={{
          paddingBottom:
            "max(1.25rem, env(safe-area-inset-bottom))",
        }}
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fff9d7] text-trap-blue">
          <Sparkles size={21} />
        </span>

        <h2 className="mt-5 text-2xl font-extrabold text-trap-blue">
          {copy.conflictTitle}
        </h2>

        <p className="mt-3 text-sm font-medium leading-7 text-trap-ink/60">
          {editing
            ? copy.conflictEdit(
                currentName,
                conflict.name,
                desiredOrder,
                currentOrder
              )
            : copy.conflictCreate(
                conflict.name,
                desiredOrder
              )}
        </p>

        <div className="mt-7 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            className="admin-button-secondary"
            onClick={onCancel}
            disabled={busy}
          >
            {copy.keepEditing}
          </button>

          <button
            type="button"
            className="admin-button-primary"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Check size={16} />
            )}
            {editing ? copy.confirmSwap : copy.confirmInsert}
          </button>
        </div>
      </section>
    </div>
  );
}
