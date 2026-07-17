
import {
  AlertTriangle,
  Check,
  Loader2,
  X,
} from "lucide-react";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useI18n } from "../../../i18n/I18nProvider.jsx";
import { EMPTY_SHIFT_FORM } from "./constants.js";
import { getWorkScheduleCopy } from "./copy.js";
import EmployeeFilters from "./components/EmployeeFilters.jsx";
import ScheduleGrid from "./components/ScheduleGrid.jsx";
import ScheduleHeader from "./components/ScheduleHeader.jsx";
import ShiftEditorSheet from "./components/ShiftEditorSheet.jsx";
import { useMediaQuery } from "./hooks/useMediaQuery.js";
import { useShiftDrag } from "./hooks/useShiftDrag.js";
import { useWorkSchedule } from "./hooks/useWorkSchedule.js";
import {
  addDays,
  formatDateKey,
  minutesToTime,
  parseDateKey,
  startOfWeek,
  timeToMinutes,
} from "./utils/dateTime.js";
import {
  buildShiftPayload,
  buildStats,
  getShiftEmployeeIds,
  layoutDayShifts,
  validateShiftPayload,
} from "./utils/schedule.js";
import "./workSchedule.css";

export default function WorkSchedulePage() {
  const { language } = useI18n();
  const copy = getWorkScheduleCopy(language);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [anchorDate, setAnchorDate] = useState(() => startOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDateKey(new Date())
  );
  const [viewMode, setViewMode] = useState("week");
  const [query, setQuery] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_SHIFT_FORM);
  const [saving, setSaving] = useState(false);

  const scrollRef = useRef(null);
  const gridRef = useRef(null);
  const swipeRef = useRef(null);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(anchorDate, index)),
    [anchorDate]
  );

  const visibleDays = useMemo(() => {
    if (isMobile || viewMode === "day") {
      return [parseDateKey(selectedDate)];
    }

    return weekDays;
  }, [isMobile, selectedDate, viewMode, weekDays]);

  const rangeStart = formatDateKey(visibleDays[0]);
  const rangeEnd = formatDateKey(visibleDays[visibleDays.length - 1]);

  const schedule = useWorkSchedule({
    from: rangeStart,
    to: rangeEnd,
    copy,
  });

  const filteredShifts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return schedule.shifts.filter((shift) => {
      const ids = getShiftEmployeeIds(shift);

      const matchesEmployee =
        !employeeFilter.length ||
        employeeFilter.some((id) => ids.includes(id));

      const text = [
        shift.title,
        shift.position,
        shift.note,
        ...schedule.employees
          .filter((employee) => ids.includes(employee.id))
          .map((employee) => employee.fullName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesEmployee && (!keyword || text.includes(keyword));
    });
  }, [employeeFilter, query, schedule.employees, schedule.shifts]);

  const stats = useMemo(
    () =>
      buildStats(
        filteredShifts,
        schedule.employees,
        rangeStart,
        rangeEnd
      ),
    [
      filteredShifts,
      rangeEnd,
      rangeStart,
      schedule.employees,
    ]
  );

  const commitMove = useCallback(
    async (id, payload) => {
      const moved = await schedule.move(id, payload);

      if (moved && isMobile && payload.date !== selectedDate) {
        setSelectedDate(payload.date);
        setAnchorDate(startOfWeek(parseDateKey(payload.date)));
      }

      return moved;
    },
    [isMobile, schedule, selectedDate]
  );

  const drag = useShiftDrag({
    isMobile,
    dayCount: visibleDays.length,
    gridRef,
    scrollRef,
    onCommit: commitMove,
  });

  const dayLayouts = useMemo(() => {
    const map = new Map();

    visibleDays.forEach((day) => {
      const key = formatDateKey(day);

      const shifts = filteredShifts
        .filter((shift) => shift.date === key)
        .map((shift) =>
          drag.preview?.id === shift.id
            ? { ...shift, ...drag.preview }
            : shift
        );

      map.set(key, layoutDayShifts(shifts));
    });

    return map;
  }, [drag.preview, filteredShifts, visibleDays]);

  function openCreate({ date = selectedDate, startTime = "09:00" } = {}) {
    const endMinutes = Math.min(timeToMinutes(startTime) + 240, 23 * 60);

    setForm({
      ...EMPTY_SHIFT_FORM,
      date,
      startTime,
      endTime: minutesToTime(endMinutes),
    });

    setEditorOpen(true);
  }

  function openEdit(shift) {
    setForm({
      id: shift.id,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      title: shift.title || "Store shift",
      position: shift.position || "General",
      employeeIds: getShiftEmployeeIds(shift),
      requiredStaff: Number(shift.requiredStaff || 1),
      status: shift.status || "published",
      note: shift.note || "",
    });

    setEditorOpen(true);
  }

  async function saveForm(event) {
    event.preventDefault();

    const payload = buildShiftPayload(form);
    const validation = validateShiftPayload(payload, copy);

    if (validation) {
      schedule.setNotice({ type: "error", text: validation });
      return;
    }

    setSaving(true);
    const saved = await schedule.save({ id: form.id, payload });
    setSaving(false);

    if (saved) setEditorOpen(false);
  }

  async function deleteShift() {
    if (!form.id || !window.confirm(copy.confirmDelete)) return;

    setSaving(true);
    const removed = await schedule.remove(form.id);
    setSaving(false);

    if (removed) setEditorOpen(false);
  }

  function navigate(direction) {
    if (isMobile || viewMode === "day") {
      const next = addDays(parseDateKey(selectedDate), direction);
      setSelectedDate(formatDateKey(next));
      setAnchorDate(startOfWeek(next));
      return;
    }

    setAnchorDate((current) => addDays(current, direction * 7));
  }

  function goToday() {
    const today = new Date();
    setAnchorDate(startOfWeek(today));
    setSelectedDate(formatDateKey(today));
  }

  function selectDay(day) {
    setSelectedDate(formatDateKey(day));

    if (isMobile) {
      setViewMode("day");
    }
  }

  function toggleEmployee(id) {
    setEmployeeFilter((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function handleSwipeStart(event) {
    if (!isMobile || event.target.closest("[data-schedule-shift]")) return;

    swipeRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }

  function handleSwipeEnd(event) {
    const session = swipeRef.current;
    swipeRef.current = null;

    if (!session || session.pointerId !== event.pointerId || drag.draggingId) {
      return;
    }

    const dx = event.clientX - session.x;
    const dy = event.clientY - session.y;

    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      navigate(dx < 0 ? 1 : -1);
    }
  }

  if (schedule.loading) {
    return (
      <div className="ws-loading">
        <span>
          <Loader2 className="animate-spin" size={27} />
        </span>
        <p>{copy.loading}</p>
      </div>
    );
  }

  return (
    <main className="work-schedule-page" data-work-schedule-page="true">
      <ScheduleHeader
        copy={copy}
        language={language}
        visibleDays={visibleDays}
        viewMode={isMobile ? "day" : viewMode}
        isMobile={isMobile}
        refreshing={schedule.refreshing}
        stats={stats}
        onRefresh={() => schedule.load({ silent: true })}
        onCreate={() => openCreate()}
        onPrevious={() => navigate(-1)}
        onNext={() => navigate(1)}
        onToday={goToday}
        onViewChange={setViewMode}
      />

      {schedule.notice.text && (
        <div
          className={[
            "ws-notice",
            schedule.notice.type === "success" ? "is-success" : "is-error",
          ].join(" ")}
        >
          {schedule.notice.type === "success" ? (
            <Check size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}

          <p>{schedule.notice.text}</p>

          <button
            type="button"
            onClick={() => schedule.setNotice({ type: "", text: "" })}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <EmployeeFilters
        copy={copy}
        employees={schedule.employees}
        selectedIds={employeeFilter}
        query={query}
        onQueryChange={setQuery}
        onToggle={toggleEmployee}
        onClear={() => setEmployeeFilter([])}
      />

      <ScheduleGrid
        copy={copy}
        language={language}
        days={visibleDays}
        dayLayouts={dayLayouts}
        employees={schedule.employees}
        selectedDate={selectedDate}
        scrollRef={scrollRef}
        gridRef={gridRef}
        drag={{ ...drag, onOpen: openEdit }}
        onSelectDay={selectDay}
        onCreate={openCreate}
        onSwipeStart={handleSwipeStart}
        onSwipeEnd={handleSwipeEnd}
      />

      <ShiftEditorSheet
        open={editorOpen}
        form={form}
        employees={schedule.employees}
        copy={copy}
        saving={saving}
        onChange={setForm}
        onClose={() => setEditorOpen(false)}
        onSave={saveForm}
        onDelete={deleteShift}
        onDuplicate={() =>
          setForm((current) => ({
            ...current,
            id: "",
            title: `${current.title} ${copy.copySuffix}`,
          }))
        }
      />
    </main>
  );
}
