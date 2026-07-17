
import { ArrowRight, Clock3, MapPin } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import ClientPageHero from "../components/ui/ClientPageHero.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";
import { api } from "../lib/api.js";

const initialForm = {
  customerName: "",
  phone: "",
  date: "",
  time: "",
  guestCount: 2,
  note: "",
};

export default function ReservationPage() {
  const { store } = useOutletContext();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      await api.reservations.create(form);
      toast.show("TRAP Room received your booking request.");
      setForm(initialForm);
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="client-page">
      <ClientPageHero
        eyebrow="Reservation"
        title="save a seat at trap."
        description="Send a request and our team will contact you to confirm the booking."
        accent="orange"
      />

      <section className="client-section bg-white">
        <div className="client-shell grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <aside>
            <p className="client-eyebrow">Before you book</p>

            <h2 className="client-title mt-5">
              a few useful details before you stop by.
            </h2>

            <div className="mt-9 grid gap-6 border-t border-trap-blue/10 pt-7">
              <p className="flex gap-3 text-sm font-medium leading-6 text-trap-ink/65">
                <MapPin
                  className="mt-0.5 shrink-0 text-trap-orange"
                  size={18}
                />
                {store.shop.address}
              </p>

              <p className="flex gap-3 text-sm font-medium leading-6 text-trap-ink/65">
                <Clock3
                  className="mt-0.5 shrink-0 text-trap-orange"
                  size={18}
                />
                {store.shop.openingHours}
              </p>
            </div>
          </aside>

          <form
            onSubmit={submit}
            className="grid gap-x-8 gap-y-6 border border-trap-blue/10 bg-[#eef1ff] p-6 sm:grid-cols-2 sm:p-10"
          >
            <Field
              label="Your name"
              value={form.customerName}
              onChange={(value) => update("customerName", value)}
              required
            />

            <Field
              label="Phone number"
              value={form.phone}
              onChange={(value) => update("phone", value)}
              required
            />

            <Field
              type="date"
              label="Date"
              value={form.date}
              onChange={(value) => update("date", value)}
              required
            />

            <Field
              type="time"
              label="Time"
              value={form.time}
              onChange={(value) => update("time", value)}
              required
            />

            <Field
              type="number"
              min="1"
              max="30"
              label="Guests"
              value={form.guestCount}
              onChange={(value) => update("guestCount", Number(value))}
              required
            />

            <label className="sm:col-span-2">
              <span className="mb-2 block text-[9px] font-extrabold uppercase tracking-[0.16em] text-trap-blue">
                Notes
              </span>

              <textarea
                className="min-h-32 w-full border-0 border-b border-trap-blue/20 bg-white/70 p-4 text-sm font-semibold outline-none focus:border-trap-blue"
                value={form.note}
                onChange={(event) => update("note", event.target.value)}
                placeholder="Window seat, birthday, accessibility needs..."
              />
            </label>

            <div className="sm:col-span-2">
              <button
                disabled={saving}
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-trap-blue px-6 text-[10px] font-extrabold uppercase tracking-[0.14em] text-trap-yellow sm:w-auto"
              >
                {saving ? "Sending..." : "Send booking request"}
                {!saving && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  min,
  max,
}) {
  return (
    <label>
      <span className="mb-2 block text-[9px] font-extrabold uppercase tracking-[0.16em] text-trap-blue">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[52px] w-full border-0 border-b border-trap-blue/20 bg-white/70 px-4 text-sm font-semibold outline-none focus:border-trap-blue"
      />
    </label>
  );
}
