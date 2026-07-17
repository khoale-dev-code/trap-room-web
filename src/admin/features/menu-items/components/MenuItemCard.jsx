
import {
  Edit3,
  Eye,
  EyeOff,
  ImagePlus,
  Sparkles,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { formatVndCurrency } from "../utils/currency.js";
import {
  getResourceType,
  normalizeMedia,
} from "../utils/menuItem.js";

export default function MenuItemCard({
  product,
  copy,
  language,
  onEdit,
  onDelete,
  onToggleAvailable,
  onToggleFeatured,
}) {
  const media = normalizeMedia(product);
  const cover =
    media.find((item) => getResourceType(item) !== "video") ||
    media[0];

  const categoryName =
    product.categoryId?.name ||
    product.category ||
    copy.noCategory;

  return (
    <article className="admin-card-flat grid gap-4 p-4 md:grid-cols-[140px_minmax(0,1fr)_auto] md:items-center">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#eef1ff]">
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
              alt={product.name}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="grid h-full place-items-center text-center text-trap-blue/55">
            <div>
              <ImagePlus className="mx-auto" size={28} />
              <p className="mt-2 text-[8px] font-extrabold uppercase tracking-[0.1em]">
                {copy.noImage}
              </p>
            </div>
          </div>
        )}

        {product.isFeatured && (
          <span className="absolute left-2 top-2 admin-badge bg-trap-yellow text-trap-blue">
            <Sparkles size={11} />
            {copy.featured}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-xl font-extrabold text-trap-blue">
            {product.name}
          </h2>

          <span
            className={[
              "admin-badge",
              product.isAvailable !== false
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600",
            ].join(" ")}
          >
            {product.isAvailable !== false
              ? copy.available
              : copy.unavailable}
          </span>
        </div>

        <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.11em] text-trap-orange">
          {categoryName}
        </p>

        <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-trap-ink/52">
          {product.description || copy.noDescription}
        </p>

        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <strong className="text-xl font-extrabold text-trap-blue">
            {formatVndCurrency(product.price, language)}
          </strong>

          {Number(product.oldPrice || 0) >
            Number(product.price || 0) && (
            <del className="text-sm font-semibold text-trap-ink/35">
              {formatVndCurrency(product.oldPrice, language)}
            </del>
          )}
        </div>

        {Array.isArray(product.tags) &&
          product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tagValue) => (
                <span
                  key={tagValue}
                  className="inline-flex min-h-7 items-center rounded-full bg-[#eef1ff] px-3 text-[8px] font-extrabold uppercase tracking-[0.08em] text-trap-blue"
                >
                  #{tagValue}
                </span>
              ))}
            </div>
          )}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[9px] font-extrabold uppercase tracking-[0.1em] text-trap-ink/38">
          <span>{copy.orderText(product.sortOrder || 999)}</span>
          <span>{copy.tagsCount(product.tags?.length || 0)}</span>
          <span>{copy.sizesCount(product.sizes?.length || 0)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:flex-col">
        <ActionButton
          label={
            product.isAvailable !== false
              ? copy.hide
              : copy.show
          }
          onClick={onToggleAvailable}
          icon={
            product.isAvailable !== false ? EyeOff : Eye
          }
        />

        <ActionButton
          label={
            product.isFeatured
              ? copy.unfeature
              : copy.feature
          }
          onClick={onToggleFeatured}
          icon={product.isFeatured ? StarOff : Star}
        />

        <ActionButton
          label={copy.edit}
          onClick={onEdit}
          icon={Edit3}
        />

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-red-200 bg-red-50 text-red-700"
          onClick={onDelete}
          title={copy.delete}
          aria-label={copy.delete}
        >
          <Trash2 size={16} />
        </button>
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
      className="admin-icon-button"
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      <Icon size={16} />
    </button>
  );
}
