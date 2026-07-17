
import { AlertTriangle } from "lucide-react";
import {
  CALENDAR_START_HOUR,
  MINUTE_HEIGHT,
} from "../constants.js";
import { timeToMinutes } from "../utils/dateTime.js";
import {
  getInitials,
  getShiftColor,
  getShiftEmployees,
} from "../utils/schedule.js";

export default function ShiftCard({
  layout,
  employees,
  copy,
  dragging,
  onOpen,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}) {
  const { shift, column, columns } = layout;
  const start = timeToMinutes(shift.startTime);
  const end = timeToMinutes(shift.endTime);

  const top = (start - CALENDAR_START_HOUR * 60) * MINUTE_HEIGHT;
  const height = Math.max((end - start) * MINUTE_HEIGHT, 36);

  const assigned = getShiftEmployees(shift, employees);
  const shortage = Math.max(
    Number(shift.requiredStaff || 1) - assigned.length,
    0
  );

  const color = getShiftColor(shift, assigned);

  return (
    <article
      data-schedule-shift
      className={[
        "ws-shift",
        dragging ? "is-dragging" : "",
        shortage ? "is-short" : "",
        `is-${shift.status || "published"}`,
      ].join(" ")}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `calc(${(column / columns) * 100}% + 3px)`,
        width: `calc(${100 / columns}% - 6px)`,
        "--shift-color": color,
      }}
      role="button"
      tabIndex={0}
      onPointerDown={(event) => onPointerDown(event, shift, "move")}
      onPointerMove={onPointerMove}
      onPointerUp={async (event) => {
        const result = await onPointerUp(event);
        if (result?.action === "open") onOpen(result.shift);
      }}
      onPointerCancel={onPointerCancel}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(shift);
        }
      }}
    >
      <div className="ws-shift__time">
        <span>{shift.startTime}–{shift.endTime}</span>

        {shortage > 0 && (
          <em title={copy.shortStaffed}>
            <AlertTriangle size={12} />
            {shortage}
          </em>
        )}
      </div>

      <h3>{shift.title}</h3>

      {height >= 66 && <p>{shift.position}</p>}

      {height >= 92 && (
        <div className="ws-shift__staff">
          {assigned.slice(0, 3).map((employee) => (
            <span
              key={employee.id}
              title={employee.fullName}
              style={{ "--employee-color": employee.color }}
            >
              {getInitials(employee.fullName)}
            </span>
          ))}

          {assigned.length > 3 && <span>+{assigned.length - 3}</span>}
          {!assigned.length && <small>{copy.unassigned}</small>}
        </div>
      )}

      <button
        type="button"
        className="ws-shift__resize"
        aria-label={copy.resize}
        onPointerDown={(event) => {
          event.stopPropagation();
          onPointerDown(event, shift, "resize");
        }}
      >
        <span />
      </button>
    </article>
  );
}
