
import {
  CALENDAR_END_HOUR,
  CALENDAR_HEIGHT,
  CALENDAR_START_HOUR,
  MINUTE_HEIGHT,
  SLOT_MINUTES,
} from "../constants.js";
import {
  clamp,
  formatDateKey,
  formatHour,
  formatWeekday,
  isSameDay,
  minutesToTime,
} from "../utils/dateTime.js";
import ShiftCard from "./ShiftCard.jsx";

export default function ScheduleGrid({
  copy,
  language,
  days,
  dayLayouts,
  employees,
  selectedDate,
  scrollRef,
  gridRef,
  drag,
  onSelectDay,
  onCreate,
  onSwipeStart,
  onSwipeEnd,
}) {
  return (
    <section className="ws-calendar-panel">
      <div className="ws-gesture-help">
        {days.length === 1 ? copy.mobileHint : copy.desktopHint}
      </div>

      <div
        className="ws-calendar-board"
        onPointerDown={onSwipeStart}
        onPointerUp={onSwipeEnd}
        onPointerCancel={onSwipeEnd}
      >
        <div
          className="ws-calendar-day-header"
          style={{ "--visible-days": days.length }}
        >
          <div className="ws-calendar-time-corner">GMT+7</div>

          {days.map((day) => {
            const key = formatDateKey(day);

            return (
              <button
                key={key}
                type="button"
                className={[
                  "ws-calendar-day",
                  isSameDay(day, new Date()) ? "is-today" : "",
                  key === selectedDate ? "is-selected" : "",
                ].join(" ")}
                onClick={() => onSelectDay(day)}
              >
                <span>{formatWeekday(day, language)}</span>
                <strong>{day.getDate()}</strong>
              </button>
            );
          })}
        </div>

        <div ref={scrollRef} className="ws-calendar-scroll">
          <div
            className="ws-calendar-grid"
            style={{
              "--visible-days": days.length,
              "--calendar-height": `${CALENDAR_HEIGHT}px`,
            }}
          >
            <TimeAxis language={language} />

            <div ref={gridRef} className="ws-calendar-days">
              {days.map((day) => {
                const key = formatDateKey(day);
                const layouts = dayLayouts.get(key) || [];

                return (
                  <div
                    key={key}
                    className={[
                      "ws-calendar-day-column",
                      isSameDay(day, new Date()) ? "is-today" : "",
                    ].join(" ")}
                    onClick={(event) => {
                      if (event.target.closest("[data-schedule-shift]")) return;

                      const rect =
                        event.currentTarget.getBoundingClientRect();

                      const minutes = clamp(
                        Math.round(
                          (event.clientY - rect.top) /
                            (SLOT_MINUTES * MINUTE_HEIGHT)
                        ) *
                          SLOT_MINUTES +
                          CALENDAR_START_HOUR * 60,
                        CALENDAR_START_HOUR * 60,
                        CALENDAR_END_HOUR * 60 - SLOT_MINUTES
                      );

                      onCreate({
                        date: key,
                        startTime: minutesToTime(minutes),
                      });
                    }}
                  >
                    <HourLines />

                    {layouts.map((layout) => (
                      <ShiftCard
                        key={layout.shift.id}
                        layout={layout}
                        employees={employees}
                        copy={copy}
                        dragging={drag.draggingId === layout.shift.id}
                        onOpen={drag.onOpen}
                        onPointerDown={drag.begin}
                        onPointerMove={drag.movePointer}
                        onPointerUp={drag.end}
                        onPointerCancel={drag.cancel}
                      />
                    ))}
                  </div>
                );
              })}

              <NowLine days={days} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimeAxis({ language }) {
  return (
    <div className="ws-calendar-time-axis">
      {Array.from(
        { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR + 1 },
        (_, index) => {
          const hour = CALENDAR_START_HOUR + index;

          return (
            <span
              key={hour}
              style={{
                top: `${(hour - CALENDAR_START_HOUR) * 60 * MINUTE_HEIGHT}px`,
              }}
            >
              {formatHour(hour, language)}
            </span>
          );
        }
      )}
    </div>
  );
}

function HourLines() {
  return (
    <div className="ws-calendar-hour-lines" aria-hidden="true">
      {Array.from(
        { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR },
        (_, index) => (
          <span
            key={index}
            style={{
              top: `${index * 60 * MINUTE_HEIGHT}px`,
            }}
          />
        )
      )}
    </div>
  );
}

function NowLine({ days }) {
  const now = new Date();
  const index = days.findIndex((day) => isSameDay(day, now));

  if (index < 0) return null;

  const minutes = now.getHours() * 60 + now.getMinutes();

  if (
    minutes < CALENDAR_START_HOUR * 60 ||
    minutes > CALENDAR_END_HOUR * 60
  ) {
    return null;
  }

  return (
    <div
      className="ws-calendar-now"
      style={{
        top: `${(minutes - CALENDAR_START_HOUR * 60) * MINUTE_HEIGHT}px`,
        left: `calc(${(index / days.length) * 100}% + 2px)`,
        width: `calc(${100 / days.length}% - 4px)`,
      }}
      aria-hidden="true"
    >
      <span />
    </div>
  );
}
