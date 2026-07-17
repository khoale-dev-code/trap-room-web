
import { Search } from "lucide-react";

export default function ResourceFilters({
  copy,
  query,
  filter,
  filterOptions,
  visibleCount,
  totalCount,
  onQueryChange,
  onFilterChange,
}) {
  return (
    <section className="admin-card mb-5 p-4 sm:p-5">
      <label className="relative block">
        <span className="admin-label">
          {copy.searchLabel}
        </span>

        <Search
          className="admin-search-icon pointer-events-none absolute"
          size={17}
        />

        <input
          className="admin-input admin-search-control text-base sm:text-sm"
          placeholder={copy.searchPlaceholder}
          value={query}
          onChange={(event) =>
            onQueryChange(event.target.value)
          }
        />
      </label>

      <div className="admin-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {filterOptions.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onFilterChange(value)}
            className={[
              "min-h-11 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.1em] transition",
              filter === value
                ? "border-trap-blue bg-trap-blue text-trap-yellow shadow-[0_8px_18px_rgb(1_30_160_/_14%)]"
                : "border-trap-blue/12 bg-white text-trap-blue hover:bg-[#eef1ff]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold text-trap-ink/40">
        {copy.showing(visibleCount, totalCount)}
      </p>
    </section>
  );
}
