
import {
  CheckCircle2,
  Clock3,
  Copy,
  Loader2,
  Save,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../../lib/api.js";
import {
  DEFAULT_OPENING_HOURS_SCHEDULE,
  formatOpeningHoursSummary,
  isTimeRangeValid,
  normalizeOpeningHoursSchedule,
  parseLegacyOpeningHours,
} from "../../lib/openingHours.js";
import { useI18n } from "../../i18n/I18nProvider.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

export default function OpeningHoursEditor({
  value,
  legacyValue,
  onChange,
  onSaved,
}) {
  const { language } = useI18n();
  const toast = useToast();

  const initial = useMemo(() => {
    if (
      value &&
      typeof value === "object"
    ) {
      return normalizeOpeningHoursSchedule(
        value
      );
    }

    return parseLegacyOpeningHours(
      legacyValue
    );
  }, [value, legacyValue]);

  const [schedule, setSchedule] =
    useState(initial);
  const [saving, setSaving] =
    useState(false);
  const [savedSnapshot, setSavedSnapshot] =
    useState(
      JSON.stringify(initial)
    );

  useEffect(() => {
    setSchedule(initial);
    setSavedSnapshot(
      JSON.stringify(initial)
    );
  }, [initial]);

  const valid =
    isTimeRangeValid(
      schedule.weekdays
    ) &&
    isTimeRangeValid(
      schedule.weekend
    );

  const dirty =
    JSON.stringify(schedule) !==
    savedSnapshot;

  const summary = useMemo(
    () =>
      formatOpeningHoursSummary(
        schedule,
        language
      ),
    [schedule, language]
  );

  function updatePeriod(
    periodName,
    field,
    fieldValue
  ) {
    setSchedule((current) => {
      const next = {
        ...current,
        [periodName]: {
          ...current[periodName],
          [field]: fieldValue,
        },
      };

      emitChange(next);
      return next;
    });
  }

  function copyWeekdaysToWeekend() {
    setSchedule((current) => {
      const next = {
        ...current,
        weekend: {
          ...current.weekend,
          open:
            current.weekdays.open,
          close:
            current.weekdays.close,
          closed:
            current.weekdays.closed,
        },
      };

      emitChange(next);
      return next;
    });
  }

  function emitChange(nextSchedule) {
    onChange?.({
      schedule: nextSchedule,
      summary:
        formatOpeningHoursSummary(
          nextSchedule,
          "en"
        ),
    });
  }

  async function saveOpeningHours() {
    if (!valid) {
      toast.show(
        language === "vi"
          ? "Giờ đóng cửa phải muộn hơn giờ mở cửa."
          : "Closing time must be later than opening time.",
        "error"
      );

      return;
    }

    try {
      setSaving(true);

      const data = await api.request(
        "/shop-hours",
        {
          method: "PATCH",
          body: JSON.stringify({
            openingHoursSchedule:
              schedule,
          }),
        }
      );

      const savedSchedule =
        normalizeOpeningHoursSchedule(
          data.shop
            ?.openingHoursSchedule ||
            schedule
        );

      setSchedule(savedSchedule);
      setSavedSnapshot(
        JSON.stringify(
          savedSchedule
        )
      );

      emitChange(savedSchedule);
      onSaved?.(data.shop);

      toast.show(
        language === "vi"
          ? "Đã lưu giờ mở cửa."
          : "Opening hours saved."
      );
    } catch (error) {
      toast.show(
        error.message,
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  function restoreDefaults() {
    const defaults =
      normalizeOpeningHoursSchedule(
        DEFAULT_OPENING_HOURS_SCHEDULE
      );

    setSchedule(defaults);
    emitChange(defaults);
  }

  return (
    <section className="admin-card-flat overflow-hidden sm:col-span-2"
      data-opening-hours-editor="true">
      <div className="flex flex-col gap-4 border-b border-trap-blue/10 bg-[#f8f9fd] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-trap-blue text-trap-yellow">
            <Clock3 size={19} />
          </span>

          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-trap-orange">
              {language === "vi"
                ? "Lịch hoạt động"
                : "Store schedule"}
            </p>

            <h3 className="mt-1 text-lg font-extrabold text-trap-blue">
              {language === "vi"
                ? "Giờ mở và đóng cửa"
                : "Opening and closing hours"}
            </h3>

            <p className="mt-1 text-xs font-medium leading-5 text-trap-ink/45">
              {language === "vi"
                ? "Tách ngày thường và cuối tuần để khách dễ theo dõi."
                : "Separate weekdays and weekends so customers can read the schedule clearly."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={copyWeekdaysToWeekend}
          className="admin-button-secondary shrink-0"
        >
          <Copy size={15} />

          {language === "vi"
            ? "Sao chép sang cuối tuần"
            : "Copy to weekend"}
        </button>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
        <PeriodEditor
          language={language}
          title={
            language === "vi"
              ? "Thứ 2 - Thứ 6"
              : "Mon - Fri"
          }
          value={schedule.weekdays}
          onChange={(field, fieldValue) =>
            updatePeriod(
              "weekdays",
              field,
              fieldValue
            )
          }
        />

        <PeriodEditor
          language={language}
          title={
            language === "vi"
              ? "Thứ 7 - Chủ nhật"
              : "Sat - Sun"
          }
          value={schedule.weekend}
          onChange={(field, fieldValue) =>
            updatePeriod(
              "weekend",
              field,
              fieldValue
            )
          }
        />
      </div>

      <div className="border-t border-trap-blue/10 bg-[#f8f9fd] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="admin-label">
              {language === "vi"
                ? "Xem trước ngoài website"
                : "Client preview"}
            </p>

            <div className="rounded-xl border border-trap-blue/10 bg-white p-4">
              {summary
                .split("\n")
                .map((line) => (
                  <p
                    key={line}
                    className="text-sm font-semibold leading-7 text-trap-blue"
                  >
                    {line}
                  </p>
                ))}
            </div>

            {!valid && (
              <p className="mt-3 text-xs font-bold text-red-700">
                {language === "vi"
                  ? "Giờ đóng cửa phải muộn hơn giờ mở cửa."
                  : "Closing time must be later than opening time."}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <button
              type="button"
              className="admin-button-secondary"
              onClick={restoreDefaults}
              disabled={saving}
            >
              {language === "vi"
                ? "Dùng giờ mẫu"
                : "Use sample hours"}
            </button>

            <button
              type="button"
              className="admin-button-primary"
              onClick={
                saveOpeningHours
              }
              disabled={
                saving ||
                !valid ||
                !dirty
              }
            >
              {saving ? (
                <Loader2
                  className="animate-spin"
                  size={16}
                />
              ) : dirty ? (
                <Save size={16} />
              ) : (
                <CheckCircle2
                  size={16}
                />
              )}

              {saving
                ? language === "vi"
                  ? "Đang lưu..."
                  : "Saving..."
                : dirty
                  ? language === "vi"
                    ? "Lưu giờ hoạt động"
                    : "Save opening hours"
                  : language === "vi"
                    ? "Đã lưu"
                    : "Saved"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PeriodEditor({
  title,
  value,
  language,
  onChange,
}) {
  return (
    <article
      className={[
        "rounded-2xl border p-4 transition sm:p-5",
        value.closed
          ? "border-slate-200 bg-slate-50"
          : "border-trap-blue/12 bg-white",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-base font-extrabold text-trap-blue">
            {title}
          </p>

          <p className="mt-1 text-xs font-medium text-trap-ink/42">
            {value.closed
              ? language === "vi"
                ? "Đóng cửa cả ngày"
                : "Closed all day"
              : language === "vi"
                ? "Thiết lập giờ mở và đóng"
                : "Set opening and closing times"}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={
            !value.closed
          }
          onClick={() =>
            onChange(
              "closed",
              !value.closed
            )
          }
          className={[
            "relative h-7 w-12 shrink-0 rounded-full transition",
            value.closed
              ? "bg-slate-300"
              : "bg-trap-blue",
          ].join(" ")}
          aria-label={
            value.closed
              ? "Set open"
              : "Set closed"
          }
        >
          <span
            className={[
              "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
              value.closed
                ? "left-1"
                : "left-6",
            ].join(" ")}
          />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label>
          <span className="admin-label">
            {language === "vi"
              ? "Giờ mở cửa"
              : "Opens"}
          </span>

          <input
            type="time"
            className="admin-input"
            value={value.open}
            disabled={value.closed}
            onChange={(event) =>
              onChange(
                "open",
                event.target.value
              )
            }
          />
        </label>

        <label>
          <span className="admin-label">
            {language === "vi"
              ? "Giờ đóng cửa"
              : "Closes"}
          </span>

          <input
            type="time"
            className="admin-input"
            value={value.close}
            disabled={value.closed}
            onChange={(event) =>
              onChange(
                "close",
                event.target.value
              )
            }
          />
        </label>
      </div>
    </article>
  );
}
