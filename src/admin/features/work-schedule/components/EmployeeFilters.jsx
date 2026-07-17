
import { Search, UsersRound, X } from "lucide-react";

export default function EmployeeFilters({
  copy,
  employees,
  selectedIds,
  query,
  onQueryChange,
  onToggle,
  onClear,
}) {
  return (
    <section className="ws-filter-row">
      <label className="ws-filter-search">
        <Search size={16} />
        <input
          value={query}
          placeholder={copy.searchPlaceholder}
          onChange={(event) => onQueryChange(event.target.value)}
        />

        {query && (
          <button
            type="button"
            aria-label={copy.close}
            onClick={() => onQueryChange("")}
          >
            <X size={14} />
          </button>
        )}
      </label>

      <div className="ws-filter-chips">
        <button
          type="button"
          className={!selectedIds.length ? "is-active" : ""}
          onClick={onClear}
        >
          <span className="ws-filter-dot is-all">
            <UsersRound size={13} />
          </span>
          {copy.allEmployees}
        </button>

        {employees.map((employee) => (
          <button
            key={employee.id}
            type="button"
            className={selectedIds.includes(employee.id) ? "is-active" : ""}
            onClick={() => onToggle(employee.id)}
          >
            <span
              className="ws-filter-dot"
              style={{ "--employee-color": employee.color }}
            />
            {employee.fullName}
          </button>
        ))}
      </div>
    </section>
  );
}
