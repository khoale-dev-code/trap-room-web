import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  MessageSquareText,
  Minus,
  Phone,
  Plus,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import {
  useOutletContext,
} from "react-router-dom";
import ClientPageHero from "../components/ui/ClientPageHero.jsx";
import {
  useToast,
} from "../components/ui/ToastProvider.jsx";
import { api } from "../lib/api.js";
import "../styles/reservation-page-v28.css";

const initialForm = {
  customerName: "",
  phone: "",
  date: "",
  time: "",
  guestCount: 2,
  note: "",
};

function getTodayInputValue() {
  const current = new Date();

  current.setMinutes(
    current.getMinutes() -
      current.getTimezoneOffset()
  );

  return current
    .toISOString()
    .slice(0, 10);
}


function formatOpeningTime(value) {
  const source =
    String(value || "").trim();

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(source)) {
    return source;
  }

  const [hoursText, minutes] =
    source.split(":");

  const hours = Number(hoursText);
  const suffix =
    hours >= 12 ? "PM" : "AM";
  const displayHours =
    hours % 12 || 12;

  return `${displayHours}:${minutes} ${suffix}`;
}

function getOpeningHoursRows(shop) {
  const schedule =
    shop?.openingHoursSchedule;

  if (
    schedule &&
    typeof schedule === "object"
  ) {
    const rows = [
      schedule.weekdays,
      schedule.weekend,
    ]
      .filter(Boolean)
      .map((period, index) => ({
        label:
          String(
            period.label ||
            (
              index === 0
                ? "Mon - Fri"
                : "Sat - Sun"
            )
          ).trim(),
        value:
          period.closed === true
            ? "Closed"
            : [
                formatOpeningTime(
                  period.open
                ),
                formatOpeningTime(
                  period.close
                ),
              ]
                .filter(Boolean)
                .join(" – "),
      }))
      .filter(
        (item) =>
          item.label &&
          item.value
      );

    if (rows.length) {
      return rows;
    }
  }

  const legacy =
    String(
      shop?.openingHours || ""
    ).trim();

  if (legacy) {
    return legacy
      .split(/\r?\n/)
      .map((line) => {
        const separator =
          line.indexOf(":");

        if (separator < 0) {
          return {
            label:
              "Opening hours",
            value:
              line.trim(),
          };
        }

        return {
          label:
            line
              .slice(0, separator)
              .trim(),
          value:
            line
              .slice(separator + 1)
              .trim(),
        };
      })
      .filter(
        (item) =>
          item.label &&
          item.value
      );
  }

  return [
    {
      label: "Opening hours",
      value:
        "Opening hours are being updated.",
    },
  ];
}

export default function ReservationPage() {
  const context =
    useOutletContext();

  const store =
    context?.store || {};

  const shop =
    store?.shop || {};

  const [form, setForm] =
    useState(initialForm);

  const [saving, setSaving] =
    useState(false);

  const toast =
    useToast();

  const today =
    useMemo(
      () => getTodayInputValue(),
      []
    );

  const openingHoursRows =
    useMemo(
      () =>
        getOpeningHoursRows(shop),
      [
        shop.openingHoursSchedule,
        shop.openingHours,
      ]
    );

  function update(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function changeGuestCount(delta) {
    setForm((current) => ({
      ...current,
      guestCount: Math.min(
        30,
        Math.max(
          1,
          Number(
            current.guestCount || 1
          ) + delta
        )
      ),
    }));
  }

  async function submit(event) {
    event.preventDefault();

    if (
      Number(form.guestCount) < 1 ||
      Number(form.guestCount) > 30
    ) {
      toast.show(
        "Guest count must be between 1 and 30.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      await api.reservations.create({
        ...form,
        customerName:
          String(
            form.customerName || ""
          ).trim(),
        phone:
          String(
            form.phone || ""
          ).trim(),
        guestCount:
          Number(form.guestCount),
        note:
          String(
            form.note || ""
          ).trim(),
      });

      toast.show(
        "TRAP Room received your booking request."
      );

      setForm(initialForm);
    } catch (error) {
      toast.show(
        error.message,
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      data-reservation-page="v28"
      className="client-page reservation-page"
    >
      <ClientPageHero
        eyebrow="Reservation"
        title="save a seat at trap."
        description="Tell us when you are coming. Our team will contact you to confirm the table."
        accent="orange"
      />

      <section className="reservation-section">
        <div className="client-shell">
          <div className="reservation-layout">
            <aside className="reservation-story-card">
              <span className="reservation-story-kicker">
                <Sparkles size={15} />
                Plan your visit
              </span>

              <h2>
                Coffee tastes better when your seat is waiting.
              </h2>

              <p className="reservation-story-copy">
                Send a quick request and we will confirm availability with you by phone.
              </p>

              <div className="reservation-visit-list">
                <VisitItem
                  icon={MapPin}
                  label="Find us"
                  value={
                    shop.address ||
                    "Store address is being updated."
                  }
                />

                <OpeningHoursDetails
                  rows={openingHoursRows}
                />

                {shop.phone ? (
                  <VisitItem
                    icon={Phone}
                    label="Call the store"
                    value={shop.phone}
                    href={`tel:${shop.phone}`}
                  />
                ) : null}
              </div>

              <div className="reservation-process">
                <span>How it works</span>

                <ol>
                  <li>
                    <b>01</b>
                    <p>
                      Choose your preferred date, time and group size.
                    </p>
                  </li>

                  <li>
                    <b>02</b>
                    <p>
                      We check the space and contact you to confirm.
                    </p>
                  </li>

                  <li>
                    <b>03</b>
                    <p>
                      Come by, settle in and enjoy your TRAP moment.
                    </p>
                  </li>
                </ol>
              </div>
            </aside>

            <div className="reservation-form-shell">
              <div className="reservation-form-heading">
                <div>
                  <span className="client-eyebrow">
                    Booking request
                  </span>

                  <h2>
                    Tell us the details.
                  </h2>

                  <p>
                    Fields marked with an asterisk are required.
                  </p>
                </div>

                <span className="reservation-confirmation-pill">
                  <CheckCircle2 size={16} />
                  Confirmation by phone
                </span>
              </div>

              <form
                onSubmit={submit}
                className="reservation-form"
              >
                <div className="reservation-field-grid">
                  <Field
                    icon={UserRound}
                    label="Your name"
                    value={
                      form.customerName
                    }
                    onChange={(value) =>
                      update(
                        "customerName",
                        value
                      )
                    }
                    autoComplete="name"
                    placeholder="Your full name"
                    required
                  />

                  <Field
                    icon={Phone}
                    label="Phone number"
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(value) =>
                      update(
                        "phone",
                        value
                      )
                    }
                    autoComplete="tel"
                    placeholder="Your contact number"
                    required
                  />

                  <Field
                    icon={CalendarDays}
                    type="date"
                    label="Date"
                    value={form.date}
                    min={today}
                    onChange={(value) =>
                      update("date", value)
                    }
                    required
                  />

                  <Field
                    icon={Clock3}
                    type="time"
                    label="Time"
                    value={form.time}
                    onChange={(value) =>
                      update("time", value)
                    }
                    required
                  />
                </div>

                <GuestCounter
                  value={
                    Number(
                      form.guestCount || 1
                    )
                  }
                  onDecrease={() =>
                    changeGuestCount(-1)
                  }
                  onIncrease={() =>
                    changeGuestCount(1)
                  }
                  onChange={(value) =>
                    update(
                      "guestCount",
                      Math.min(
                        30,
                        Math.max(
                          1,
                          Number(value || 1)
                        )
                      )
                    )
                  }
                />

                <label className="reservation-note-field">
                  <span className="reservation-field-label">
                    <MessageSquareText
                      size={16}
                    />
                    Notes
                    <small>Optional</small>
                  </span>

                  <textarea
                    value={form.note}
                    maxLength={400}
                    onChange={(event) =>
                      update(
                        "note",
                        event.target.value
                      )
                    }
                    placeholder="Window seat, birthday, accessibility needs, or anything else we should know..."
                  />

                  <span className="reservation-note-count">
                    {form.note.length}/400
                  </span>
                </label>

                <div className="reservation-submit-row">
                  <p>
                    This is a booking request. Your table is confirmed only after our team contacts you.
                  </p>

                  <button
                    type="submit"
                    disabled={saving}
                    className="reservation-submit-button"
                  >
                    {saving ? (
                      <Loader2
                        className="animate-spin"
                        size={19}
                      />
                    ) : (
                      <ArrowRight size={19} />
                    )}

                    <span>
                      {saving
                        ? "Sending request..."
                        : "Send booking request"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


function OpeningHoursDetails({
  rows,
}) {
  return (
    <div className="reservation-opening-hours">
      <span className="reservation-visit-icon">
        <Clock3 size={18} />
      </span>

      <span className="reservation-opening-hours-copy">
        <small>Opening hours</small>

        <span className="reservation-opening-hours-list">
          {rows.map((row) => (
            <span
              key={`${row.label}-${row.value}`}
              className="reservation-opening-hours-row"
            >
              <b>{row.label}</b>
              <strong>{row.value}</strong>
            </span>
          ))}
        </span>
      </span>
    </div>
  );
}

function VisitItem({
  icon: Icon,
  label,
  value,
  href,
}) {
  const content = (
    <>
      <span className="reservation-visit-icon">
        <Icon size={18} />
      </span>

      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </>
  );

  return href ? (
    <a
      className="reservation-visit-item"
      href={href}
    >
      {content}
    </a>
  ) : (
    <div className="reservation-visit-item">
      {content}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  max,
  inputMode,
  autoComplete,
  placeholder,
}) {
  return (
    <label className="reservation-field">
      <span className="reservation-field-label">
        {Icon ? (
          <Icon size={16} />
        ) : null}

        {label}

        {required ? (
          <b aria-hidden="true">*</b>
        ) : null}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        min={min}
        max={max}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function GuestCounter({
  value,
  onDecrease,
  onIncrease,
  onChange,
}) {
  return (
    <div className="reservation-guest-card">
      <div className="reservation-guest-copy">
        <span className="reservation-guest-icon">
          <UsersRound size={20} />
        </span>

        <span>
          <small>Group size</small>
          <strong>
            How many guests are coming?
          </strong>
        </span>
      </div>

      <div className="reservation-guest-stepper">
        <button
          type="button"
          onClick={onDecrease}
          disabled={value <= 1}
          aria-label="Decrease guest count"
        >
          <Minus size={18} />
        </button>

        <label>
          <input
            type="number"
            min="1"
            max="30"
            value={value}
            onChange={(event) =>
              onChange(event.target.value)
            }
            aria-label="Guest count"
          />

          <span>
            {value === 1
              ? "guest"
              : "guests"}
          </span>
        </label>

        <button
          type="button"
          onClick={onIncrease}
          disabled={value >= 30}
          aria-label="Increase guest count"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
