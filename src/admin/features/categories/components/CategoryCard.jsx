
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

export default function CategoryCard({
  item,
  index,
  total,
  copy,
  reordering,
  onEdit,
  onToggle,
  onMove,
  onDelete,
}) {
  const isVisible =
    item.isActive !== false;

  return (
    <article className="admin-card-flat overflow-hidden">
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[64px_minmax(0,1fr)_auto] lg:items-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef1ff] text-lg font-extrabold text-trap-blue">
          {String(
            item.sortOrder ||
              index + 1
          ).padStart(2, "0")}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-extrabold text-trap-blue sm:text-xl">
              {item.name}
            </h2>

            <span
              className={[
                "admin-badge",
                isVisible
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              {isVisible
                ? copy.active
                : copy.hidden}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-trap-ink/52">
            {item.description ||
              copy.noDescription}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[9px] font-extrabold uppercase tracking-[0.1em] text-trap-ink/38">
            <span>
              {copy.products(
                Number(
                  item.productCount || 0
                )
              )}
            </span>

            <span>
              {copy.orderText(
                item.sortOrder ||
                  index + 1
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 lg:grid-cols-2 xl:grid-cols-5">
          <ActionButton
            label={
              isVisible
                ? copy.hide
                : copy.show
            }
            onClick={onToggle}
            icon={
              isVisible
                ? EyeOff
                : Eye
            }
          />

          <ActionButton
            label={copy.edit}
            onClick={onEdit}
            icon={Edit3}
          />

          <ActionButton
            label={copy.moveUp}
            onClick={() =>
              onMove(-1)
            }
            icon={ArrowUp}
            disabled={
              reordering ||
              index === 0
            }
          />

          <ActionButton
            label={copy.moveDown}
            onClick={() =>
              onMove(1)
            }
            icon={ArrowDown}
            disabled={
              reordering ||
              index === total - 1
            }
          />

          <button
            type="button"
            className="grid h-11 w-full min-w-11 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 lg:w-11"
            onClick={onDelete}
            title={copy.delete}
            aria-label={copy.delete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function ActionButton({
  label,
  onClick,
  icon: Icon,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className="admin-icon-button w-full rounded-xl lg:w-11"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      <Icon size={16} />
    </button>
  );
}
