
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Plus,
  RefreshCw,
  Rows3,
} from "lucide-react";
import { formatRangeTitle } from "../utils/dateTime.js";

export default function ScheduleHeader({
  copy,
  language,
  visibleDays,
  viewMode,
  isMobile,
  refreshing,
  stats,
  onRefresh,
  onCreate,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
}) {
  return (
    <section className="ws-calendar-topbar">
      <div className="ws-calendar-heading">
        <div>
          <p>{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <span>{copy.description}</span>
        </div>

        <div className="ws-calendar-heading__actions">
          <button
            type="button"
            className="ws-action-button is-light"
            disabled={refreshing}
            onClick={onRefresh}
          >
            <RefreshCw
              className={refreshing ? "animate-spin" : ""}
              size={16}
            />
            {copy.refresh}
          </button>

          <button
            type="button"
            className="ws-action-button is-primary"
            onClick={onCreate}
          >
            <Plus size={17} />
            {copy.newShift}
          </button>
        </div>
      </div>

      <div className="ws-calendar-controls">
        <div className="ws-calendar-navigation">
          <button
            type="button"
            aria-label={copy.previous}
            onClick={onPrevious}
          >
            <ChevronLeft size={19} />
          </button>

          <button
            type="button"
            className="ws-calendar-today"
            onClick={onToday}
          >
            {copy.today}
          </button>

          <button
            type="button"
            aria-label={copy.next}
            onClick={onNext}
          >
            <ChevronRight size={19} />
          </button>

          <h2>{formatRangeTitle(visibleDays, language)}</h2>
        </div>

        <div className="ws-calendar-summary">
          <SummaryItem value={stats.shifts} label={copy.shifts} />
          <SummaryItem value={stats.staff} label={copy.staff} />
          <SummaryItem
            value={`${Math.round(stats.hours * 10) / 10}h`}
            label={copy.hours}
          />
          <SummaryItem value={stats.shortStaffed} label={copy.shortStaffed} />
        </div>

        <div className="ws-calendar-view-switch">
          <button
            type="button"
            className={viewMode === "day" ? "is-active" : ""}
            onClick={() => onViewChange("day")}
          >
            <Rows3 size={15} />
            {copy.day}
          </button>

          <button
            type="button"
            className={viewMode === "week" ? "is-active" : ""}
            disabled={isMobile}
            onClick={() => onViewChange("week")}
          >
            <LayoutGrid size={15} />
            {copy.week}
          </button>
        </div>
      </div>
    </section>
  );
}

function SummaryItem({ value, label }) {
  return (
    <span className="ws-calendar-summary__item">
      <strong>{value}</strong>
      <small>{label}</small>
    </span>
  );
}
