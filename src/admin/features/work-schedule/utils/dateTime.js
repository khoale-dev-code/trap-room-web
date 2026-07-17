
export function startOfWeek(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);

  const weekday = date.getDay();
  date.setDate(date.getDate() + (weekday === 0 ? -6 : 1 - weekday));

  return date;
}

export function addDays(value, amount) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

export function formatDateKey(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateKey(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isSameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function timeToMinutes(value) {
  const [hour, minute] = String(value || "00:00").split(":").map(Number);
  return hour * 60 + minute;
}

export function minutesToTime(value) {
  const safe = clamp(Math.round(value), 0, 24 * 60);
  const hour = Math.floor(safe / 60);
  const minute = safe % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function formatWeekday(date, language) {
  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
    weekday: "short",
  })
    .format(date)
    .replace(".", "");
}

export function formatRangeTitle(days, language) {
  if (!days.length) return "";

  const locale = language === "vi" ? "vi-VN" : "en-US";

  if (days.length === 1) {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(days[0]);
  }

  const first = days[0];
  const last = days[days.length - 1];

  const firstText = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: first.getMonth() === last.getMonth() ? undefined : "short",
  }).format(first);

  const lastText = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(last);

  return `${firstText} – ${lastText}`;
}

export function formatHour(hour, language) {
  const date = new Date(2026, 0, 1, hour, 0);

  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: language !== "vi",
  }).format(date);
}

export function formatHours(value) {
  return `${Math.round(Number(value || 0) * 10) / 10}h`;
}
