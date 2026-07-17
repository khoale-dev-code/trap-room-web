
import {
  Clock3,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  formatOpeningHoursSummary,
  getOpeningStatus,
  normalizeOpeningHoursSchedule,
  parseLegacyOpeningHours,
} from "../../lib/openingHours.js";
import {
  useI18n,
} from "../../i18n/I18nProvider.jsx";

export default function OpeningHoursDisplay({
  shop = {},
  showStatus = true,
  className = "",
}) {
  const { language } = useI18n();
  const [now, setNow] =
    useState(() => new Date());

  const schedule = useMemo(() => {
    if (
      shop.openingHoursSchedule &&
      typeof shop.openingHoursSchedule ===
        "object"
    ) {
      return normalizeOpeningHoursSchedule(
        shop.openingHoursSchedule
      );
    }

    return parseLegacyOpeningHours(
      shop.openingHours
    );
  }, [
    shop.openingHoursSchedule,
    shop.openingHours,
  ]);

  const summary = useMemo(
    () =>
      formatOpeningHoursSummary(
        schedule,
        language
      ),
    [schedule, language]
  );

  const status = useMemo(
    () =>
      getOpeningStatus(
        schedule,
        now
      ),
    [schedule, now]
  );

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setNow(new Date());
      }, 60000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div
      className={[
        "min-w-0",
        className,
      ].join(" ")}
    >
      {showStatus && (
        <span
          className={[
            "mb-3 inline-flex min-h-7 items-center gap-2 rounded-full px-3 text-[8px] font-extrabold uppercase tracking-[0.1em]",
            status.isOpen
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-600",
          ].join(" ")}
        >
          <Clock3 size={12} />

          {status.isOpen
            ? language === "vi"
              ? "Đang mở cửa"
              : "Open now"
            : language === "vi"
              ? "Đang đóng cửa"
              : "Closed now"}
        </span>
      )}

      <div className="grid gap-1.5">
        {summary
          .split("\n")
          .filter(Boolean)
          .map((line) => {
            const [
              label,
              ...timeParts
            ] = line.split(":");

            return (
              <div
                key={line}
                className="grid grid-cols-[minmax(105px,auto)_1fr] gap-3 text-sm leading-6"
              >
                <span className="font-extrabold text-trap-blue">
                  {label}
                </span>

                <span className="font-semibold text-trap-ink/62">
                  {timeParts
                    .join(":")
                    .trim()}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
