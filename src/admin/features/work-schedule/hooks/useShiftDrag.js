
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
  MINUTE_HEIGHT,
  SLOT_MINUTES,
} from "../constants.js";
import {
  addDays,
  clamp,
  formatDateKey,
  minutesToTime,
  parseDateKey,
  timeToMinutes,
} from "../utils/dateTime.js";

export function useShiftDrag({
  isMobile,
  dayCount,
  gridRef,
  scrollRef,
  onCommit,
}) {
  const sessionRef = useRef(null);
  const longPressTimerRef = useRef(0);
  const [preview, setPreview] = useState(null);
  const [draggingId, setDraggingId] = useState("");

  const clearSession = useCallback(() => {
    window.clearTimeout(longPressTimerRef.current);
    sessionRef.current = null;
    setPreview(null);
    setDraggingId("");
    document.body.classList.remove("work-schedule-is-dragging");
  }, []);

  useEffect(() => clearSession, [clearSession]);

  const begin = useCallback(
    (event, shift, mode = "move") => {
      if (event.button !== 0) return;

      event.stopPropagation();

      const activate = () => {
        const gridWidth = gridRef.current?.clientWidth || 1;

        sessionRef.current = {
          pointerId: event.pointerId,
          shift,
          mode,
          startX: event.clientX,
          startY: event.clientY,
          initialDate: shift.date,
          initialStart: timeToMinutes(shift.startTime),
          initialEnd: timeToMinutes(shift.endTime),
          dayWidth: gridWidth / Math.max(dayCount, 1),
          active: true,
          moved: false,
        };

        setPreview({
          id: shift.id,
          date: shift.date,
          startTime: shift.startTime,
          endTime: shift.endTime,
        });

        setDraggingId(shift.id);
        document.body.classList.add("work-schedule-is-dragging");

        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Safari can ignore pointer capture for some nested buttons.
        }

        if (event.pointerType === "touch" && navigator.vibrate) {
          navigator.vibrate(16);
        }
      };

      sessionRef.current = {
        pointerId: event.pointerId,
        shift,
        mode,
        startX: event.clientX,
        startY: event.clientY,
        active: false,
        moved: false,
      };

      if (event.pointerType === "touch") {
        longPressTimerRef.current = window.setTimeout(activate, 220);
      } else {
        activate();
      }
    },
    [dayCount, gridRef]
  );

  const movePointer = useCallback(
    (event) => {
      const session = sessionRef.current;

      if (!session || session.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - session.startX;
      const deltaY = event.clientY - session.startY;

      if (!session.active) {
        if (Math.hypot(deltaX, deltaY) > 10) {
          clearSession();
        }
        return;
      }

      event.preventDefault();
      session.moved ||= Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3;

      const snappedMinutes =
        Math.round(deltaY / (SLOT_MINUTES * MINUTE_HEIGHT)) * SLOT_MINUTES;

      if (session.mode === "resize") {
        const nextEnd = clamp(
          session.initialEnd + snappedMinutes,
          session.initialStart + SLOT_MINUTES,
          CALENDAR_END_HOUR * 60
        );

        setPreview({
          id: session.shift.id,
          date: session.initialDate,
          startTime: minutesToTime(session.initialStart),
          endTime: minutesToTime(nextEnd),
        });
      } else {
        const duration = session.initialEnd - session.initialStart;

        const nextStart = clamp(
          session.initialStart + snappedMinutes,
          CALENDAR_START_HOUR * 60,
          CALENDAR_END_HOUR * 60 - duration
        );

        const dayDelta = isMobile
          ? Math.abs(deltaX) > 72
            ? deltaX > 0
              ? 1
              : -1
            : 0
          : Math.round(deltaX / Math.max(session.dayWidth, 1));

        setPreview({
          id: session.shift.id,
          date: formatDateKey(
            addDays(parseDateKey(session.initialDate), dayDelta)
          ),
          startTime: minutesToTime(nextStart),
          endTime: minutesToTime(nextStart + duration),
        });
      }

      autoScroll(scrollRef.current, event.clientY);
    },
    [clearSession, isMobile, scrollRef]
  );

  const end = useCallback(
    async (event) => {
      const session = sessionRef.current;

      if (!session || session.pointerId !== event.pointerId) return;

      window.clearTimeout(longPressTimerRef.current);

      if (!session.active) {
        clearSession();
        return { action: "open", shift: session.shift };
      }

      const next = preview;
      const moved = session.moved;
      const shift = session.shift;

      clearSession();

      if (!moved || !next) {
        return { action: "open", shift };
      }

      await onCommit(shift.id, {
        date: next.date,
        startTime: next.startTime,
        endTime: next.endTime,
      });

      return { action: "moved", shift, next };
    },
    [clearSession, onCommit, preview]
  );

  return {
    preview,
    draggingId,
    begin,
    movePointer,
    end,
    cancel: clearSession,
  };
}

function autoScroll(container, clientY) {
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const threshold = 72;

  if (clientY < rect.top + threshold) {
    container.scrollTop -= 18;
  } else if (clientY > rect.bottom - threshold) {
    container.scrollTop += 18;
  }
}
