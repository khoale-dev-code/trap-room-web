import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api.js";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import AdminConfirmDialog from "../../components/AdminConfirmDialog.jsx";
import AdminEmptyState from "../../components/AdminEmptyState.jsx";
import AdminPageHeader from "../../components/AdminPageHeader.jsx";

const statuses = ["pending", "confirmed", "completed", "cancelled"];

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-100 text-slate-600",
};

function today() {
  const value = new Date();
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function emptyBooking() {
  return {
    customerName: "",
    phone: "",
    date: today(),
    time: "12:00",
    guestCount: 2,
    note: "",
    status: "confirmed",
  };
}

export default function ReservationsManager({ refreshToken }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(emptyBooking);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function load() {
    try {
      setLoading(true);
      const data = await api.reservations.list();
      setItems(Array.isArray(data.reservations) ? data.reservations : []);
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshToken]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus = status === "all" || item.status === status;
      const searchable = [
        item.customerName,
        item.phone,
        item.date,
        item.time,
        item.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!keyword || searchable.includes(keyword));
    });
  }, [items, query, status]);

  async function updateStatus(id, nextStatus) {
    try {
      const data = await api.reservations.update(id, { status: nextStatus });

      setItems((current) =>
        current.map((item) =>
          item._id === id ? data.reservation || { ...item, status: nextStatus } : item
        )
      );

      toast.show("Booking status updated.");
    } catch (error) {
      toast.show(error.message, "error");
    }
  }

  async function createBooking(event) {
    event.preventDefault();

    if (!form.customerName.trim() || !form.phone.trim()) {
      toast.show("Customer name and phone number are required.", "error");
      return;
    }

    try {
      setSaving(true);
      const data = await api.reservations.createAdmin({
        ...form,
        guestCount: Number(form.guestCount || 1),
      });

      setItems((current) => [data.reservation, ...current]);
      setForm(emptyBooking());
      setEditorOpen(false);
      toast.show("Manual booking created.");
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await api.reservations.remove(deleteTarget._id);
      setItems((current) => current.filter((item) => item._id !== deleteTarget._id));
      setDeleteTarget(null);
      toast.show("Booking deleted.");
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div data-admin-responsive-page="ReservationsManager">
      <AdminPageHeader
        eyebrow="Table operations"
        title="bookings."
        description="Create phone bookings, search requests, contact customers and manage the full booking lifecycle."
        actions={
          <button
            type="button"
            className="admin-button-primary"
            onClick={() => setEditorOpen(true)}
          >
            <Plus size={16} />
            Manual booking
          </button>
        }
      />

      {editorOpen && (
        <form onSubmit={createBooking} className="admin-card mb-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-trap-blue/10 px-5 py-4">
            <div>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-trap-orange">
                Staff entry
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-trap-blue">
                Create a manual booking
              </h2>
            </div>

            <button
              type="button"
              className="admin-icon-button"
              onClick={() => setEditorOpen(false)}
              aria-label="Close manual booking form"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-4">
            <BookingField label="Customer name" required>
              <input
                className="admin-input"
                value={form.customerName}
                autoComplete="name"
                onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
                required
              />
            </BookingField>

            <BookingField label="Phone number" required>
              <input
                className="admin-input"
                type="tel"
                inputMode="tel"
                value={form.phone}
                autoComplete="tel"
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                required
              />
            </BookingField>

            <BookingField label="Date" required>
              <input
                className="admin-input"
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                required
              />
            </BookingField>

            <BookingField label="Time" required>
              <input
                className="admin-input"
                type="time"
                value={form.time}
                onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                required
              />
            </BookingField>

            <BookingField label="Guest count">
              <input
                className="admin-input"
                type="number"
                inputMode="numeric"
                min="1"
                max="30"
                value={form.guestCount}
                onChange={(event) => setForm((current) => ({ ...current, guestCount: event.target.value }))}
              />
            </BookingField>

            <BookingField label="Initial status">
              <select
                className="admin-select"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </BookingField>

            <label className="sm:col-span-2">
              <span className="admin-label">Internal / customer note</span>
              <textarea
                className="admin-textarea min-h-24"
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              />
            </label>
          </div>

          <div className="flex flex-col gap-2 border-t border-trap-blue/10 bg-[#f8f9fd] p-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="admin-button-secondary"
              onClick={() => setEditorOpen(false)}
            >
              Cancel
            </button>

            <button type="submit" className="admin-button-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              {saving ? "Creating..." : "Create booking"}
            </button>
          </div>
        </form>
      )}

      <section
        data-admin-filter-strip="bookings"
        className="admin-card p-4"
      >
        <div className="admin-scrollbar flex gap-2 overflow-x-auto pb-1">
          {["all", ...statuses].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              aria-pressed={status === item}
              className={[
                "min-h-11 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.1em] transition",
                status === item
                  ? "border-trap-blue bg-trap-blue text-trap-yellow"
                  : "border-trap-blue/12 bg-white text-trap-blue hover:bg-[#eef1ff]",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="admin-card mt-6 p-4">
        <label className="relative block">
          <span className="admin-label">Search bookings</span>
          <Search className="pointer-events-none absolute bottom-[15px] left-4 text-trap-blue/45" size={17} />
          <input
            className="admin-input pl-11"
            placeholder="Customer, phone, date or note..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <p className="mt-3 text-xs font-semibold text-trap-ink/40">
          Showing {filtered.length} of {items.length} bookings
        </p>
      </section>

      <section className="mt-5">
        {loading ? (
          <div className="admin-card grid min-h-72 place-items-center">
            <Loader2 className="animate-spin text-trap-blue" size={28} />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4">
            {filtered.map((item) => (
              <article key={item._id} className="admin-card-flat p-5">
                <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr_1fr_220px_auto] xl:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-extrabold text-trap-blue">{item.customerName}</h3>
                      <span className={`admin-badge ${statusStyles[item.status] || statusStyles.pending}`}>
                        {item.status}
                      </span>
                    </div>

                    <a href={`tel:${item.phone}`} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-trap-orange">
                      <Phone size={15} />
                      {item.phone}
                    </a>
                  </div>

                  <div className="grid gap-2 text-sm font-semibold text-trap-ink/60">
                    <p className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-trap-blue" />
                      {item.date}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock3 size={16} className="text-trap-blue" />
                      {item.time}
                    </p>
                  </div>

                  <p className="flex items-center gap-2 text-sm font-semibold text-trap-ink/60">
                    <Users size={16} className="text-trap-blue" />
                    {item.guestCount} guests
                  </p>

                  <label>
                    <span className="admin-label">Booking status</span>
                    <select
                      value={item.status}
                      onChange={(event) => updateStatus(item._id, event.target.value)}
                      className="admin-select"
                    >
                      {statuses.map((statusItem) => (
                        <option key={statusItem} value={statusItem}>{statusItem}</option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="grid h-11 w-11 place-items-center rounded-full border border-red-200 bg-red-50 text-red-700"
                    aria-label="Delete booking"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                {item.note && (
                  <div className="mt-5 rounded-xl bg-[#f8f9fd] p-4">
                    <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-trap-orange">Booking note</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-trap-ink/55">{item.note}</p>
                  </div>
                )}

                {item.status === "confirmed" && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={16} />
                    This booking is confirmed.
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState title="No matching bookings." description="Try another status or search term." />
        )}
      </section>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this booking?"
        description={`This permanently removes the booking for ${deleteTarget?.customerName || "this customer"}.`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function BookingField({ label, required, children }) {
  return (
    <label>
      <span className="admin-label">
        {label}{required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
