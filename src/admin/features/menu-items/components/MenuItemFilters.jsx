
import { Search } from "lucide-react";

export default function MenuItemFilters({
  copy,
  categories,
  query,
  categoryFilter,
  statusFilter,
  visibleCount,
  totalCount,
  onQueryChange,
  onCategoryChange,
  onStatusChange,
}) {
  return (
    <div className="admin-card mb-5 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative block">
          <span className="admin-label">{copy.search}</span>
          <Search
            className="admin-search-icon pointer-events-none absolute"
            size={17}
          />
          <input
            className="admin-input admin-search-control"
            placeholder={copy.searchPlaceholder}
            value={query}
            onChange={(event) =>
              onQueryChange(event.target.value)
            }
          />
        </label>

        <label>
          <span className="admin-label">{copy.category}</span>
          <select
            className="admin-select"
            value={categoryFilter}
            onChange={(event) =>
              onCategoryChange(event.target.value)
            }
          >
            <option value="all">{copy.allCategories}</option>
            {categories.map((category) => (
              <option
                key={category._id}
                value={category._id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {[
          ["all", copy.all],
          ["available", copy.available],
          ["unavailable", copy.unavailable],
          ["featured", copy.featured],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onStatusChange(value)}
            className={[
              "min-h-11 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.1em] transition",
              statusFilter === value
                ? "border-trap-blue bg-trap-blue text-trap-yellow"
                : "border-trap-blue/12 bg-white text-trap-blue",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold text-trap-ink/40">
        {copy.showing(visibleCount, totalCount)}
      </p>
    </div>
  );
}
