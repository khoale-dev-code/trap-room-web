
import { Search } from "lucide-react";

export default function MenuFilters({
  query,
  setQuery,
  category,
  setCategory,
  categories,
}) {
  return (
    <div className="grid gap-6 border-b border-trap-blue/10 pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <label className="relative block">
        <span className="mb-2 block text-[9px] font-extrabold uppercase tracking-[0.17em] text-trap-orange">
          Search the menu
        </span>

        <Search
          className="pointer-events-none absolute bottom-4 left-0 text-trap-blue"
          size={19}
        />

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Coffee, matcha, cake..."
          className="w-full border-0 border-b border-trap-blue/20 bg-transparent py-4 pl-8 pr-2 text-sm font-semibold text-trap-ink outline-none transition placeholder:text-trap-ink/35 focus:border-trap-blue"
        />
      </label>

      <div className="client-scroll pb-1">
        <FilterButton
          active={category === "all"}
          onClick={() => setCategory("all")}
        >
          All
        </FilterButton>

        {categories.map((item) => {
          const value = String(item._id || item.name);

          return (
            <FilterButton
              key={value}
              active={category === value}
              onClick={() => setCategory(value)}
            >
              {item.name}
            </FilterButton>
          );
        })}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "client-touch shrink-0 rounded-full border px-5",
        "text-[9px] font-extrabold uppercase tracking-[0.13em]",
        "transition",
        active
          ? "border-trap-blue bg-trap-blue text-trap-yellow"
          : "border-trap-blue/15 bg-white text-trap-blue hover:border-trap-blue",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
