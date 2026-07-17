import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  GripVertical,
  LayoutGrid,
  ListFilter,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "__API_IMPORT__";
import { useI18n } from "__I18N_IMPORT__";
import "__CSS_IMPORT__";

const START_HOUR = 7;
const END_HOUR = 23;
const SLOT = 15;
const PX_PER_MINUTE = 1;
const EMPTY_FORM = {
  id: "",
  date: "",
  startTime: "09:00",
  endTime: "13:00",
  title: "Store shift",
  position: "General",
  employeeIds: [],
  requiredStaff: 1,
  status: "published",
  note: "",
};

export default function WorkScheduleManager() {
  const { language } = useI18n();
  const vi = language === "vi";
  const copy = getCopy(vi);
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [view, setView] = useState("week");
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false
  );
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [dragPreview, setDragPreview] = useState(null);
  const scrollRef = useRef(null);
  const dragRef = useRef(null);
  const longPressRef = useRef(0);
  const swipeRef = useRef(null);
  const suppressClickRef = useRef(false);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(anchor, index)),
    [anchor]
  );
  const visibleDays = useMemo(
    () => (mobile || view === "day" ? [parseDate(selectedDate)] : weekDays),
    [mobile, selectedDate, view, weekDays]
  );
  const rangeStart = dateKey(visibleDays[0]);
  const rangeEnd = dateKey(visibleDays[visibleDays.length - 1]);

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      silent ? setRefreshing(true) : setLoading(true);
      try {
        const [employeeResult, shiftResult] = await Promise.all([
          api.request(`/employees?t=${Date.now()}`),
          requestShifts(rangeStart, rangeEnd),
        ]);
        setEmployees(normalizeEmployees(employeeResult));
        setShifts(normalizeShifts(shiftResult));
        setNotice({ type: "", text: "" });
      } catch (error) {
        setNotice({ type: "error", text: error?.message || copy.loadError });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [copy.loadError, rangeEnd, rangeStart]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setMobile(media.matches);
      if (media.matches) setView("day");
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => () => {
    clearTimeout(longPressRef.current);
    document.body.classList.remove("admin-schedule-dragging");
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return shifts.filter((shift) => {
      const ids = shiftEmployeeIds(shift);
      const matchEmployee = !employeeFilter.length || employeeFilter.some((id) => ids.includes(id));
      const text = [
        shift.title,
        shift.position,
        shift.note,
        ...shiftEmployees(shift, employees).map((employee) => employee.fullName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchEmployee && (!keyword || text.includes(keyword));
    });
  }, [employeeFilter, employees, query, shifts]);

  const stats = useMemo(
    () => buildStats(filtered, rangeStart, rangeEnd),
    [filtered, rangeEnd, rangeStart]
  );

  function navigate(direction) {
    if (mobile || view === "day") {
      const next = addDays(parseDate(selectedDate), direction);
      setSelectedDate(dateKey(next));
      setAnchor(startOfWeek(next));
    } else {
      setAnchor((current) => addDays(current, direction * 7));
    }
  }

  function goToday() {
    const today = new Date();
    setAnchor(startOfWeek(today));
    setSelectedDate(dateKey(today));
  }

  function openCreate(date = selectedDate, startTime = "09:00") {
    const end = minutesToTime(Math.min(timeToMinutes(startTime) + 240, END_HOUR * 60));
    setForm({ ...EMPTY_FORM, date, startTime, endTime: end });
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
      employeeIds: shiftEmployeeIds(shift),
      requiredStaff: Number(shift.requiredStaff || 1),
      status: shift.status || "published",
      note: shift.note || "",
    });
    setEditorOpen(true);
  }

  async function saveForm(event) {
    event.preventDefault();
    const payload = buildPayload(form);
    const error = validatePayload(payload, copy);
    if (error) {
      setNotice({ type: "error", text: error });
      return;
    }
    try {
      setSaving(true);
      await api.request(form.id ? `/work-shifts/${form.id}` : "/work-shifts", {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setEditorOpen(false);
      setNotice({ type: "success", text: form.id ? copy.updated : copy.created });
      notifyChange();
      await loadData({ silent: true });
    } catch (err) {
      setNotice({ type: "error", text: err?.message || copy.saveError });
    } finally {
      setSaving(false);
    }
  }

  async function removeShift() {
    if (!form.id || !window.confirm(copy.confirmDelete)) return;
    try {
      setSaving(true);
      await api.request(`/work-shifts/${form.id}`, { method: "DELETE" });
      setEditorOpen(false);
      setNotice({ type: "success", text: copy.deleted });
      notifyChange();
      await loadData({ silent: true });
    } catch (err) {
      setNotice({ type: "error", text: err?.message || copy.deleteError });
    } finally {
      setSaving(false);
    }
  }

  function emptyGridClick(event, day) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (event.target.closest("[data-schedule-shift]")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const minutes = clamp(
      Math.round((event.clientY - rect.top) / (SLOT * PX_PER_MINUTE)) * SLOT + START_HOUR * 60,
      START_HOUR * 60,
      END_HOUR * 60 - SLOT
    );
    openCreate(dateKey(day), minutesToTime(minutes));
  }

  function pointerDown(event, shift, mode = "move") {
    if (event.button !== 0) return;
    event.stopPropagation();
    const activate = () => {
      dragRef.current = {
        pointerId: event.pointerId,
        shift,
        mode,
        startX: event.clientX,
        startY: event.clientY,
        startMinutes: timeToMinutes(shift.startTime),
        endMinutes: timeToMinutes(shift.endTime),
        moved: false,
        active: true,
      };
      setDragPreview({
        id: shift.id,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
      });
      document.body.classList.add("admin-schedule-dragging");
      if (event.pointerType === "touch" && navigator.vibrate) navigator.vibrate(16);
    };

    if (event.pointerType === "touch") {
      dragRef.current = {
        pointerId: event.pointerId,
        shift,
        mode,
        startX: event.clientX,
        startY: event.clientY,
        active: false,
        moved: false,
      };
      longPressRef.current = window.setTimeout(activate, 220);
    } else {
      activate();
    }
  }

  function pointerMove(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.active) {
      if (Math.hypot(dx, dy) > 10) {
        clearTimeout(longPressRef.current);
        dragRef.current = null;
      }
      return;
    }
    event.preventDefault();
    drag.moved = drag.moved || Math.abs(dx) > 3 || Math.abs(dy) > 3;
    const deltaMinutes = Math.round(dy / (SLOT * PX_PER_MINUTE)) * SLOT;
    if (drag.mode === "resize") {
      const end = clamp(drag.endMinutes + deltaMinutes, drag.startMinutes + SLOT, END_HOUR * 60);
      setDragPreview({
        id: drag.shift.id,
        date: drag.shift.date,
        startTime: minutesToTime(drag.startMinutes),
        endTime: minutesToTime(end),
      });
    } else {
      const duration = drag.endMinutes - drag.startMinutes;
      const start = clamp(drag.startMinutes + deltaMinutes, START_HOUR * 60, END_HOUR * 60 - duration);
      const dayWidth = mobile
        ? 72
        : Math.max(1, (event.currentTarget.closest(".work-calendar-days")?.clientWidth || 1) / visibleDays.length);
      const dayDelta = mobile
        ? Math.abs(dx) > 72
          ? dx > 0
            ? 1
            : -1
          : 0
        : Math.round(dx / dayWidth);
      setDragPreview({
        id: drag.shift.id,
        date: dateKey(addDays(parseDate(drag.shift.date), dayDelta)),
        startTime: minutesToTime(start),
        endTime: minutesToTime(start + duration),
      });
    }
    const container = scrollRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      if (event.clientY < rect.top + 70) container.scrollTop -= 18;
      if (event.clientY > rect.bottom - 70) container.scrollTop += 18;
    }
  }

  async function pointerUp(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    clearTimeout(longPressRef.current);
    dragRef.current = null;
    document.body.classList.remove("admin-schedule-dragging");
    if (!drag.active || !drag.moved || !dragPreview) {
      setDragPreview(null);
      openEdit(drag.shift);
      return;
    }
    const preview = dragPreview;
    setDragPreview(null);
    try {
      setRefreshing(true);
      await api.request(`/work-shifts/${drag.shift.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          date: preview.date,
          startTime: preview.startTime,
          endTime: preview.endTime,
        }),
      });
      setNotice({ type: "success", text: copy.dragSaved });
      if (mobile) {
        setSelectedDate(preview.date);
        setAnchor(startOfWeek(parseDate(preview.date)));
      }
      notifyChange();
      await loadData({ silent: true });
    } catch (err) {
      setNotice({ type: "error", text: err?.message || copy.dragError });
      await loadData({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }

  function pointerCancel(event) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    clearTimeout(longPressRef.current);
    dragRef.current = null;
    setDragPreview(null);
    document.body.classList.remove("admin-schedule-dragging");
  }

  function swipeStart(event) {
    if (!mobile || event.target.closest("[data-schedule-shift]")) return;
    swipeRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function swipeEnd(event) {
    const swipe = swipeRef.current;
    swipeRef.current = null;
    if (!swipe || swipe.id !== event.pointerId || dragRef.current) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      suppressClickRef.current = true;
      navigate(dx < 0 ? 1 : -1);
      window.setTimeout(() => { suppressClickRef.current = false; }, 320);
    }
  }

  if (loading) {
    return (
      <div className="work-calendar-loading">
        <span><Loader2 className="animate-spin" size={28} /></span>
        <p>{copy.loading}</p>
      </div>
    );
  }

  return (
    <main className="work-calendar" data-work-calendar="true">
      <header className="work-calendar-hero">
        <div>
          <p className="work-calendar-eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="work-calendar-description">{copy.description}</p>
        </div>
        <div className="work-calendar-hero__actions">
          <button className="work-calendar-button work-calendar-button--light" disabled={refreshing} onClick={() => loadData({ silent: true })}>
            {refreshing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            {copy.refresh}
          </button>
          <button className="work-calendar-button work-calendar-button--primary" onClick={() => openCreate()}>
            <Plus size={17} />{copy.newShift}
          </button>
        </div>
      </header>

      {notice.text && (
        <div className={`work-calendar-notice ${notice.type === "success" ? "is-success" : "is-error"}`}>
          {notice.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}
          <p>{notice.text}</p>
          <button onClick={() => setNotice({ type: "", text: "" })}><X size={15} /></button>
        </div>
      )}

      <section className="work-calendar-stats">
        <MiniStat label={copy.shifts} value={stats.count} tone="blue" />
        <MiniStat label={copy.staff} value={stats.staff} tone="yellow" />
        <MiniStat label={copy.hours} value={`${Math.round(stats.hours * 10) / 10}h`} tone="orange" />
        <MiniStat label={copy.shortStaffed} value={stats.shortStaffed} tone="ink" />
      </section>

      <section className="work-calendar-shell">
        <aside className="work-calendar-sidebar">
          <div className="work-calendar-sidebar__heading">
            <ListFilter size={17} />
            <div><h2>{copy.filters}</h2><p>{copy.filtersHelp}</p></div>
          </div>
          <label className="work-calendar-search">
            <Search size={16} />
            <input value={query} placeholder={copy.searchPlaceholder} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <div className="work-calendar-employee-list">
            <button className={`work-calendar-employee-filter ${!employeeFilter.length ? "is-active" : ""}`} onClick={() => setEmployeeFilter([])}>
              <span className="work-calendar-avatar is-all"><UsersRound size={16} /></span>
              <div><strong>{copy.allEmployees}</strong><small>{employees.length} {copy.people}</small></div>
            </button>
            {employees.map((employee) => (
              <button key={employee.id} className={`work-calendar-employee-filter ${employeeFilter.includes(employee.id) ? "is-active" : ""}`} onClick={() => setEmployeeFilter((current) => current.includes(employee.id) ? current.filter((id) => id !== employee.id) : [...current, employee.id])}>
                <span className="work-calendar-avatar" style={{ "--employee-color": employee.color }}>{initials(employee.fullName)}</span>
                <div><strong>{employee.fullName}</strong><small>{employee.position || employee.role || copy.staffMember}</small></div>
              </button>
            ))}
          </div>
          <div className="work-calendar-help"><GripVertical size={17} /><p>{mobile ? copy.mobileDragHelp : copy.desktopDragHelp}</p></div>
        </aside>

        <div className="work-calendar-main">
          <div className="work-calendar-toolbar">
            <div className="work-calendar-navigation">
              <button className="work-calendar-icon-button" onClick={() => navigate(-1)}><ChevronLeft size={19} /></button>
              <button className="work-calendar-today" onClick={goToday}>{copy.today}</button>
              <button className="work-calendar-icon-button" onClick={() => navigate(1)}><ChevronRight size={19} /></button>
              <h2>{rangeTitle(visibleDays, language)}</h2>
            </div>
            <div className="work-calendar-view-switch">
              <button className={view === "day" ? "is-active" : ""} onClick={() => setView("day")}><CalendarDays size={15} />{copy.day}</button>
              <button className={view === "week" ? "is-active" : ""} disabled={mobile} onClick={() => setView("week")}><LayoutGrid size={15} />{copy.week}</button>
            </div>
          </div>

          <div className="work-calendar-mobile-filters">
            <button className={!employeeFilter.length ? "is-active" : ""} onClick={() => setEmployeeFilter([])}>{copy.all}</button>
            {employees.map((employee) => (
              <button key={employee.id} className={employeeFilter.includes(employee.id) ? "is-active" : ""} onClick={() => setEmployeeFilter((current) => current.includes(employee.id) ? current.filter((id) => id !== employee.id) : [...current, employee.id])}>
                <span style={{ "--employee-color": employee.color }} />{employee.fullName}
              </button>
            ))}
          </div>

          <div className="work-calendar-board" onPointerDown={swipeStart} onPointerUp={swipeEnd}>
            <div className="work-calendar-day-header" style={{ "--days": visibleDays.length }}>
              <div className="work-calendar-time-corner">GMT+7</div>
              {visibleDays.map((day) => (
                <button key={dateKey(day)} className={`work-calendar-day-button ${sameDay(day, new Date()) ? "is-today" : ""}`} onClick={() => setSelectedDate(dateKey(day))}>
                  <span>{weekday(day, language)}</span><strong>{day.getDate()}</strong>
                </button>
              ))}
            </div>
            <div ref={scrollRef} className="work-calendar-scroll">
              <div className="work-calendar-grid" style={{ "--days": visibleDays.length, "--height": `${(END_HOUR - START_HOUR) * 60 * PX_PER_MINUTE}px` }}>
                <TimeAxis language={language} />
                <div className="work-calendar-days">
                  {visibleDays.map((day) => (
                    <DayColumn
                      key={dateKey(day)}
                      day={day}
                      shifts={filtered.filter((shift) => (dragPreview?.id === shift.id ? dragPreview.date : shift.date) === dateKey(day))}
                      dragPreview={dragPreview}
                      employees={employees}
                      copy={copy}
                      onEmptyClick={emptyGridClick}
                      onEdit={openEdit}
                      onPointerDown={pointerDown}
                      onPointerMove={pointerMove}
                      onPointerUp={pointerUp}
                      onPointerCancel={pointerCancel}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {editorOpen && createPortal(
        <ShiftEditor
          form={form}
          setForm={setForm}
          employees={employees}
          copy={copy}
          saving={saving}
          onClose={() => setEditorOpen(false)}
          onSave={saveForm}
          onDelete={removeShift}
          onCopy={() => setForm((current) => ({ ...current, id: "", title: `${current.title} ${copy.copySuffix}` }))}
        />,
        document.body
      )}
    </main>
  );
}

function MiniStat({ label, value, tone }) {
  return <article className={`work-calendar-stat is-${tone}`}><strong>{value}</strong><span>{label}</span></article>;
}

function TimeAxis({ language }) {
  return (
    <div className="work-calendar-time-axis">
      {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => {
        const hour = START_HOUR + index;
        return <span key={hour} style={{ top: `${(hour - START_HOUR) * 60 * PX_PER_MINUTE}px` }}>{hourLabel(hour, language)}</span>;
      })}
    </div>
  );
}

function DayColumn({ day, shifts, dragPreview, employees, copy, onEmptyClick, onEdit, onPointerDown, onPointerMove, onPointerUp, onPointerCancel }) {
  const shown = shifts
    .map((shift) => dragPreview?.id === shift.id ? { ...shift, ...dragPreview } : shift)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  return (
    <div className={`work-calendar-day-column ${sameDay(day, new Date()) ? "is-today" : ""}`} onDoubleClick={(event) => onEmptyClick(event, day)} onClick={(event) => {
      if (window.matchMedia("(max-width: 767px)").matches && event.detail === 1) onEmptyClick(event, day);
    }}>
      <div className="work-calendar-hour-lines">
        {Array.from({ length: END_HOUR - START_HOUR }, (_, index) => <span key={index} style={{ top: `${index * 60 * PX_PER_MINUTE}px` }} />)}
      </div>
      {shown.map((shift, index) => (
        <ShiftCard
          key={shift.id}
          shift={shift}
          overlapIndex={index}
          employees={employees}
          copy={copy}
          onEdit={onEdit}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        />
      ))}
    </div>
  );
}

function ShiftCard({ shift, overlapIndex, employees, copy, onEdit, onPointerDown, onPointerMove, onPointerUp, onPointerCancel }) {
  const start = timeToMinutes(shift.startTime);
  const end = timeToMinutes(shift.endTime);
  const assigned = shiftEmployees(shift, employees);
  const shortage = Math.max(Number(shift.requiredStaff || 1) - assigned.length, 0);
  const color = assigned[0]?.color || colorFor(shift.position || shift.title);
  return (
    <article
      data-schedule-shift
      className={`work-calendar-shift is-${shift.status || "published"} ${shortage ? "is-short" : ""}`}
      style={{
        top: `${(start - START_HOUR * 60) * PX_PER_MINUTE}px`,
        height: `${Math.max((end - start) * PX_PER_MINUTE, 36)}px`,
        left: `${4 + (overlapIndex % 3) * 3}%`,
        right: `${4 + (2 - (overlapIndex % 3)) * 2}%`,
        "--shift-color": color,
      }}
      onPointerDown={(event) => onPointerDown(event, shift, "move")}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit(shift);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="work-calendar-shift__top"><span>{shift.startTime}–{shift.endTime}</span>{shortage > 0 && <em><AlertTriangle size={12} />{shortage}</em>}</div>
      <h3>{shift.title}</h3>
      <p>{shift.position}</p>
      <div className="work-calendar-shift__people">
        {assigned.slice(0, 3).map((employee) => <span key={employee.id} style={{ "--employee-color": employee.color }}>{initials(employee.fullName)}</span>)}
        {!assigned.length && <small>{copy.unassigned}</small>}
      </div>
      <button className="work-calendar-shift__resize" aria-label={copy.resize} onPointerDown={(event) => {
        event.stopPropagation();
        onPointerDown(event, shift, "resize");
      }}><span /></button>
    </article>
  );
}

function ShiftEditor({ form, setForm, employees, copy, saving, onClose, onSave, onDelete, onCopy }) {
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const toggle = (id) => setForm((current) => ({
    ...current,
    employeeIds: current.employeeIds.includes(id)
      ? current.employeeIds.filter((value) => value !== id)
      : [...current.employeeIds, id],
  }));
  return (
    <div className="work-calendar-editor-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="work-calendar-editor" role="dialog" aria-modal="true">
        <header><div><p>{form.id ? copy.editShift : copy.newShift}</p><h2>{form.title || copy.shift}</h2></div><button onClick={onClose}><X size={19} /></button></header>
        <form className="work-calendar-editor__body" onSubmit={onSave}>
          <Field label={copy.shiftTitle} wide><input value={form.title} onChange={(event) => update("title", event.target.value)} required /></Field>
          <Field label={copy.date}><input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} required /></Field>
          <Field label={copy.position}><input value={form.position} onChange={(event) => update("position", event.target.value)} /></Field>
          <Field label={copy.start}><input type="time" step="900" value={form.startTime} onChange={(event) => update("startTime", event.target.value)} required /></Field>
          <Field label={copy.end}><input type="time" step="900" value={form.endTime} onChange={(event) => update("endTime", event.target.value)} required /></Field>
          <Field label={copy.requiredStaff}><input type="number" min="1" max="20" value={form.requiredStaff} onChange={(event) => update("requiredStaff", Number(event.target.value))} required /></Field>
          <Field label={copy.status}><select value={form.status} onChange={(event) => update("status", event.target.value)}><option value="published">{copy.published}</option><option value="draft">{copy.draft}</option><option value="completed">{copy.completed}</option><option value="cancelled">{copy.cancelled}</option></select></Field>
          <fieldset className="work-calendar-employees is-wide"><legend>{copy.assignEmployees}</legend><div>{employees.map((employee) => (
            <button key={employee.id} type="button" className={form.employeeIds.includes(employee.id) ? "is-selected" : ""} onClick={() => toggle(employee.id)}>
              <span style={{ "--employee-color": employee.color }}>{initials(employee.fullName)}</span><div><strong>{employee.fullName}</strong><small>{employee.position || employee.role || copy.staffMember}</small></div>{form.employeeIds.includes(employee.id) && <Check size={15} />}
            </button>
          ))}</div></fieldset>
          <Field label={copy.note} wide><textarea rows="4" value={form.note} onChange={(event) => update("note", event.target.value)} /></Field>
          <footer className="work-calendar-editor__footer is-wide">
            <div>{form.id && <><button type="button" className="work-calendar-editor-button is-danger" onClick={onDelete} disabled={saving}><Trash2 size={16} />{copy.delete}</button><button type="button" className="work-calendar-editor-button is-light" onClick={onCopy} disabled={saving}><Copy size={16} />{copy.copy}</button></>}</div>
            <div><button type="button" className="work-calendar-editor-button is-light" onClick={onClose} disabled={saving}>{copy.cancel}</button><button type="submit" className="work-calendar-editor-button is-primary" disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}{copy.save}</button></div>
          </footer>
        </form>
      </section>
    </div>
  );
}

function Field({ label, wide = false, children }) {
  return <label className={`work-calendar-field ${wide ? "is-wide" : ""}`}><span>{label}</span>{children}</label>;
}

async function requestShifts(from, to) {
  try {
    return await api.request(`/work-shifts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&t=${Date.now()}`);
  } catch {
    return api.request(`/work-shifts?t=${Date.now()}`);
  }
}

function extractList(response, aliases) {
  if (Array.isArray(response)) return response;
  for (const alias of aliases) {
    const value = response?.[alias];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const nested = extractList(value, aliases);
      if (nested.length) return nested;
    }
  }
  return [];
}

function normalizeEmployees(response) {
  return extractList(response, ["employees", "items", "data", "results"])
    .map((employee, index) => ({
      ...employee,
      id: getId(employee),
      fullName: employee.fullName || employee.name || employee.displayName || employee.username || `Staff ${index + 1}`,
      color: employee.color || colorFor(getId(employee) || index),
    }))
    .filter((employee) => employee.id && employee.isActive !== false);
}

function normalizeShifts(response) {
  return extractList(response, ["shifts", "workShifts", "items", "data", "results"])
    .map((shift) => ({
      ...shift,
      id: getId(shift),
      date: String(shift.date || ""),
      startTime: String(shift.startTime || "09:00"),
      endTime: String(shift.endTime || "13:00"),
      title: shift.title || "Store shift",
      position: shift.position || "General",
      employeeIds: Array.isArray(shift.employeeIds) ? shift.employeeIds : [],
      requiredStaff: Number(shift.requiredStaff || 1),
      status: shift.status || "published",
      note: shift.note || "",
    }))
    .filter((shift) => shift.id && /^\d{4}-\d{2}-\d{2}$/.test(shift.date));
}

function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.id || "");
}

function shiftEmployeeIds(shift) {
  return (Array.isArray(shift.employeeIds) ? shift.employeeIds : []).map(getId).filter(Boolean);
}

function shiftEmployees(shift, employees) {
  const populated = (Array.isArray(shift.employeeIds) ? shift.employeeIds : [])
    .filter((value) => value && typeof value === "object")
    .map((employee) => ({ ...employee, id: getId(employee), fullName: employee.fullName || employee.name || employee.username || "Staff", color: employee.color || colorFor(getId(employee)) }));
  const map = new Map([...employees, ...populated].map((employee) => [employee.id, employee]));
  return shiftEmployeeIds(shift).map((id) => map.get(id)).filter(Boolean);
}

function buildPayload(form) {
  return {
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
    title: String(form.title || "Store shift").trim(),
    position: String(form.position || "General").trim(),
    employeeIds: form.employeeIds,
    requiredStaff: Number(form.requiredStaff || 1),
    status: form.status || "published",
    note: String(form.note || "").trim(),
  };
}

function validatePayload(payload, copy) {
  if (!payload.date) return copy.dateRequired;
  if (!payload.startTime || !payload.endTime) return copy.timeRequired;
  if (timeToMinutes(payload.endTime) <= timeToMinutes(payload.startTime)) return copy.endAfterStart;
  if (payload.requiredStaff < 1) return copy.requiredStaffInvalid;
  return "";
}

function buildStats(shifts, from, to) {
  const list = shifts.filter((shift) => shift.date >= from && shift.date <= to && shift.status !== "cancelled");
  const staff = new Set(list.flatMap(shiftEmployeeIds)).size;
  const hours = list.reduce((total, shift) => total + Math.max(0, timeToMinutes(shift.endTime) - timeToMinutes(shift.startTime)) / 60, 0);
  const shortStaffed = list.filter((shift) => shiftEmployeeIds(shift).length < Number(shift.requiredStaff || 1)).length;
  return { count: list.length, staff, hours, shortStaffed };
}

function colorFor(value) {
  const colors = ["#011ea0", "#ef4d05", "#7c3aed", "#0891b2", "#059669", "#db2777", "#b45309"];
  const text = String(value || "");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

function initials(value) {
  return String(value || "").trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function startOfWeek(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  return date;
}

function addDays(value, amount) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function parseDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function timeToMinutes(value) {
  const [hour, minute] = String(value || "00:00").split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(value) {
  const safe = clamp(Math.round(value), 0, 24 * 60);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function weekday(date, language) {
  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", { weekday: "short" }).format(date).replace(".", "");
}

function rangeTitle(days, language) {
  const locale = language === "vi" ? "vi-VN" : "en-US";
  if (days.length === 1) return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(days[0]);
  const first = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(days[0]);
  const last = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(days[days.length - 1]);
  return `${first} – ${last}`;
}

function hourLabel(hour, language) {
  const date = new Date(2026, 0, 1, hour, 0);
  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", { hour: "numeric", minute: "2-digit", hour12: language !== "vi" }).format(date);
}

function notifyChange() {
  const version = String(Date.now());
  try { localStorage.setItem("trap:data-version", version); } catch {}
  window.dispatchEvent(new CustomEvent("trap:data-changed", { detail: { resource: "work-shifts", version } }));
}

function getCopy(vi) {
  return vi
    ? {
        eyebrow: "Vận hành đội ngũ",
        title: "work schedule.",
        description: "Lịch làm việc theo tuần giống Google Calendar. Kéo ca sang ngày hoặc giờ khác và kéo cạnh dưới để đổi thời lượng.",
        refresh: "Làm mới",
        newShift: "Tạo ca làm",
        loading: "Đang tải lịch làm việc",
        loadError: "Không tải được lịch làm việc.",
        saveError: "Không lưu được ca làm.",
        deleteError: "Không xóa được ca làm.",
        dragError: "Không thể cập nhật vị trí ca làm.",
        dragSaved: "Đã cập nhật ngày và giờ của ca làm.",
        created: "Đã tạo ca làm.",
        updated: "Đã cập nhật ca làm.",
        deleted: "Đã xóa ca làm.",
        shifts: "Ca làm",
        staff: "Nhân viên",
        hours: "Tổng giờ",
        shortStaffed: "Thiếu người",
        filters: "Bộ lọc lịch",
        filtersHelp: "Chọn nhân viên để chỉ xem các ca liên quan.",
        searchPlaceholder: "Tìm ca, vị trí hoặc nhân viên...",
        allEmployees: "Tất cả nhân viên",
        all: "Tất cả",
        people: "người",
        staffMember: "Nhân viên",
        mobileDragHelp: "Nhấn giữ ca khoảng 0,2 giây rồi kéo. Vuốt vùng trống sang trái hoặc phải để đổi ngày.",
        desktopDragHelp: "Kéo ca để đổi ngày hoặc giờ. Kéo thanh nhỏ dưới cùng để đổi thời lượng.",
        today: "Hôm nay",
        day: "Ngày",
        week: "Tuần",
        unassigned: "Chưa phân công",
        resize: "Thay đổi thời lượng",
        editShift: "Chỉnh sửa ca làm",
        shift: "Ca làm",
        shiftTitle: "Tên ca",
        date: "Ngày",
        position: "Vị trí làm việc",
        start: "Bắt đầu",
        end: "Kết thúc",
        requiredStaff: "Số người cần",
        status: "Trạng thái",
        published: "Đã xuất bản",
        draft: "Bản nháp",
        completed: "Hoàn thành",
        cancelled: "Đã hủy",
        assignEmployees: "Phân công nhân viên",
        note: "Ghi chú",
        delete: "Xóa",
        copy: "Nhân bản",
        copySuffix: "(bản sao)",
        cancel: "Hủy",
        save: "Lưu ca làm",
        confirmDelete: "Bạn chắc chắn muốn xóa ca làm này?",
        dateRequired: "Vui lòng chọn ngày làm việc.",
        timeRequired: "Vui lòng chọn giờ bắt đầu và kết thúc.",
        endAfterStart: "Giờ kết thúc phải sau giờ bắt đầu.",
        requiredStaffInvalid: "Số nhân viên cần phải từ 1 trở lên.",
      }
    : {
        eyebrow: "Team operations",
        title: "work schedule.",
        description: "A Google Calendar-style weekly schedule. Drag shifts to another day or time and resize from the bottom edge.",
        refresh: "Refresh",
        newShift: "New shift",
        loading: "Loading work schedule",
        loadError: "Could not load the work schedule.",
        saveError: "Could not save the shift.",
        deleteError: "Could not delete the shift.",
        dragError: "Could not move the shift.",
        dragSaved: "Shift date and time updated.",
        created: "Shift created.",
        updated: "Shift updated.",
        deleted: "Shift deleted.",
        shifts: "Shifts",
        staff: "Staff",
        hours: "Total hours",
        shortStaffed: "Short staffed",
        filters: "Calendar filters",
        filtersHelp: "Select employees to show only their shifts.",
        searchPlaceholder: "Search shift, position or employee...",
        allEmployees: "All employees",
        all: "All",
        people: "people",
        staffMember: "Staff member",
        mobileDragHelp: "Press and hold a shift for about 0.2 seconds, then drag. Swipe empty space to change day.",
        desktopDragHelp: "Drag a shift to change its day or time. Drag the bottom handle to resize.",
        today: "Today",
        day: "Day",
        week: "Week",
        unassigned: "Unassigned",
        resize: "Resize shift",
        editShift: "Edit shift",
        shift: "Shift",
        shiftTitle: "Shift title",
        date: "Date",
        position: "Position",
        start: "Starts",
        end: "Ends",
        requiredStaff: "Required staff",
        status: "Status",
        published: "Published",
        draft: "Draft",
        completed: "Completed",
        cancelled: "Cancelled",
        assignEmployees: "Assign employees",
        note: "Note",
        delete: "Delete",
        copy: "Duplicate",
        copySuffix: "(copy)",
        cancel: "Cancel",
        save: "Save shift",
        confirmDelete: "Delete this shift?",
        dateRequired: "Select a work date.",
        timeRequired: "Select a start and end time.",
        endAfterStart: "End time must be after start time.",
        requiredStaffInvalid: "Required staff must be at least 1.",
      };
}
