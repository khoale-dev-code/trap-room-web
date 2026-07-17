
import {
  Edit3,
  Eye,
  EyeOff,
  ImagePlus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  formatVnd,
  getItemDescription,
  getItemTitle,
  getResourceType,
  getStatusField,
  normalizeMedia,
} from "../utils/resource.js";

export default function ResourceCard({
  item,
  config,
  copy,
  language,
  onEdit,
  onDelete,
  onToggle,
}) {
  const media = normalizeMedia(item);
  const cover =
    media.find((mediaItem) => getResourceType(mediaItem) !== "video") ||
    media[0];

  const statusField = getStatusField(config);
  const isEnabled = statusField
    ? item?.[statusField] !== false
    : true;

  return (
    <article className="admin-card-flat overflow-hidden">
      <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[116px_minmax(0,1fr)_auto] md:items-center">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#eef1ff]">
          {cover ? (
            getResourceType(cover) === "video" ? (
              <video
                src={cover.url}
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={cover.url}
                alt={getItemTitle(item)}
                className="h-full w-full object-cover"
              />
            )
          ) : (
            <div className="grid h-full place-items-center text-center text-trap-blue/55">
              <div>
                <ImagePlus className="mx-auto" size={30} />
                <p className="mt-2 text-[8px] font-extrabold uppercase tracking-[0.1em]">
                  {copy.noMedia}
                </p>
              </div>
            </div>
          )}

          {(item.isFeatured === true || item.isPinned === true) && (
            <span className="absolute left-2 top-2 admin-badge bg-trap-yellow text-trap-blue">
              <Sparkles size={11} />
              {copy.featured}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 truncate text-lg font-extrabold text-trap-blue sm:text-xl">
              {getItemTitle(item)}
            </h3>

            {statusField && (
              <span
                className={[
                  "admin-badge",
                  isEnabled
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {isEnabled ? copy.visible : copy.hidden}
              </span>
            )}
          </div>

          <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-trap-ink/52">
            {getItemDescription(item, copy.noDescription)}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-extrabold uppercase tracking-[0.1em] text-trap-ink/40">
            {"price" in item && (
              <span>{formatVnd(item.price, language)}</span>
            )}

            {item.category && <span>{item.category}</span>}

            {"sortOrder" in item && (
              <span>{copy.orderText(item.sortOrder ?? 999)}</span>
            )}

            {Array.isArray(item.sizes) && item.sizes.length > 0 && (
              <span>{copy.sizesText(item.sizes.length)}</span>
            )}

            {Array.isArray(item.tags) && item.tags.length > 0 && (
              <span>{copy.tagsText(item.tags.length)}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
          {statusField && (
            <ActionButton
              label={isEnabled ? copy.hide : copy.show}
              onClick={() => onToggle(item, statusField)}
              icon={isEnabled ? EyeOff : Eye}
            />
          )}

          <ActionButton
            label={copy.edit}
            onClick={onEdit}
            icon={Edit3}
          />

          <button
            type="button"
            className="grid h-11 w-full min-w-11 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 md:w-11"
            onClick={onDelete}
            aria-label={copy.delete}
            title={copy.delete}
          >
            <Trash2 size={17} />
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
}) {
  return (
    <button
      type="button"
      className="admin-icon-button w-full rounded-xl md:w-11"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Icon size={17} />
    </button>
  );
}
