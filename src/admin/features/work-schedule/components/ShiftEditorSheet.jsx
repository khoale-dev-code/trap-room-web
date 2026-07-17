
import {
  Check,
  Copy,
  Loader2,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { getInitials } from "../utils/schedule.js";

export default function ShiftEditorSheet({
  open,
  form,
  employees,
  copy,
  saving,
  onChange,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
}) {
  if (!open) return null;

  function update(field, value) {
    onChange((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleEmployee(employeeId) {
    onChange((current) => ({
      ...current,
      employeeIds: current.employeeIds.includes(employeeId)
        ? current.employeeIds.filter((id) => id !== employeeId)
        : [...current.employeeIds, employeeId],
    }));
  }

  return createPortal(
    <div
      className="ws-sheet-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="ws-sheet" role="dialog" aria-modal="true">
        <header>
          <div>
            <p>{form.id ? copy.editShiftTitle : copy.newShiftTitle}</p>
            <h2>{form.title || copy.newShift}</h2>
          </div>

          <button type="button" aria-label={copy.close} onClick={onClose}>
            <X size={19} />
          </button>
        </header>

        <form className="ws-sheet__body" onSubmit={onSave}>
          <Field label={copy.shiftTitle} wide>
            <input
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              required
            />
          </Field>

          <Field label={copy.date}>
            <input
              type="date"
              value={form.date}
              onChange={(event) => update("date", event.target.value)}
              required
            />
          </Field>

          <Field label={copy.position}>
            <input
              value={form.position}
              onChange={(event) => update("position", event.target.value)}
            />
          </Field>

          <Field label={copy.start}>
            <input
              type="time"
              step="900"
              value={form.startTime}
              onChange={(event) => update("startTime", event.target.value)}
              required
            />
          </Field>

          <Field label={copy.end}>
            <input
              type="time"
              step="900"
              value={form.endTime}
              onChange={(event) => update("endTime", event.target.value)}
              required
            />
          </Field>

          <Field label={copy.requiredStaff}>
            <input
              type="number"
              min="1"
              max="20"
              value={form.requiredStaff}
              onChange={(event) =>
                update("requiredStaff", Number(event.target.value))
              }
              required
            />
          </Field>

          <Field label={copy.status}>
            <select
              value={form.status}
              onChange={(event) => update("status", event.target.value)}
            >
              <option value="published">{copy.published}</option>
              <option value="draft">{copy.draft}</option>
              <option value="completed">{copy.completed}</option>
              <option value="cancelled">{copy.cancelled}</option>
            </select>
          </Field>

          <fieldset className="ws-sheet__employees">
            <legend>{copy.assignEmployees}</legend>

            <div>
              {employees.map((employee) => {
                const selected = form.employeeIds.includes(employee.id);

                return (
                  <button
                    key={employee.id}
                    type="button"
                    className={selected ? "is-selected" : ""}
                    onClick={() => toggleEmployee(employee.id)}
                  >
                    <span style={{ "--employee-color": employee.color }}>
                      {getInitials(employee.fullName)}
                    </span>

                    <div>
                      <strong>{employee.fullName}</strong>
                      <small>
                        {employee.position || employee.role || copy.staffMember}
                      </small>
                    </div>

                    {selected && <Check size={15} />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label={copy.note} wide>
            <textarea
              rows="4"
              value={form.note}
              onChange={(event) => update("note", event.target.value)}
            />
          </Field>

          <footer className="ws-sheet__footer">
            <div>
              {form.id && (
                <>
                  <button
                    type="button"
                    className="ws-sheet-btn ws-sheet-btn--danger"
                    disabled={saving}
                    onClick={onDelete}
                  >
                    <Trash2 size={16} />
                    {copy.delete}
                  </button>

                  <button
                    type="button"
                    className="ws-sheet-btn ws-sheet-btn--light"
                    disabled={saving}
                    onClick={onDuplicate}
                  >
                    <Copy size={16} />
                    {copy.duplicate}
                  </button>
                </>
              )}
            </div>

            <div>
              <button
                type="button"
                className="ws-sheet-btn ws-sheet-btn--light"
                disabled={saving}
                onClick={onClose}
              >
                {copy.cancel}
              </button>

              <button
                type="submit"
                className="ws-sheet-btn ws-sheet-btn--primary"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saving ? copy.pending : copy.save}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>,
    document.body
  );
}

function Field({ label, wide = false, children }) {
  return (
    <label className={wide ? "ws-field is-wide" : "ws-field"}>
      <span>{label}</span>
      {children}
    </label>
  );
}
