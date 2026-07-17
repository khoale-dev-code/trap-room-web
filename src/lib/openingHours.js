
export const DEFAULT_OPENING_HOURS_SCHEDULE = {
  timezone: "Asia/Ho_Chi_Minh",
  weekdays: {
    label: "Mon - Fri",
    open: "07:30",
    close: "20:30",
    closed: false,
  },
  weekend: {
    label: "Sat - Sun",
    open: "07:30",
    close: "21:30",
    closed: false,
  },
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function normalizeOpeningHoursSchedule(value) {
  const source =
    value && typeof value === "object"
      ? value
      : {};

  return {
    timezone:
      String(source.timezone || "").trim() ||
      DEFAULT_OPENING_HOURS_SCHEDULE.timezone,
    weekdays: normalizePeriod(
      source.weekdays,
      DEFAULT_OPENING_HOURS_SCHEDULE.weekdays
    ),
    weekend: normalizePeriod(
      source.weekend,
      DEFAULT_OPENING_HOURS_SCHEDULE.weekend
    ),
  };
}

export function parseLegacyOpeningHours(value) {
  const text = String(value || "").trim();

  if (!text) {
    return normalizeOpeningHoursSchedule();
  }

  const result = normalizeOpeningHoursSchedule();

  const weekdayMatch = text.match(
    /(?:mon(?:day)?\s*-\s*fri(?:day)?|thứ\s*2\s*-\s*thứ\s*6)\s*:\s*([0-9: ]+(?:am|pm)?)\s*[–—-]\s*([0-9: ]+(?:am|pm)?)/i
  );

  const weekendMatch = text.match(
    /(?:sat(?:urday)?\s*-\s*sun(?:day)?|thứ\s*7\s*-\s*chủ\s*nhật)\s*:\s*([0-9: ]+(?:am|pm)?)\s*[–—-]\s*([0-9: ]+(?:am|pm)?)/i
  );

  if (weekdayMatch) {
    result.weekdays.open =
      parseDisplayTime(weekdayMatch[1]) ||
      result.weekdays.open;

    result.weekdays.close =
      parseDisplayTime(weekdayMatch[2]) ||
      result.weekdays.close;
  }

  if (weekendMatch) {
    result.weekend.open =
      parseDisplayTime(weekendMatch[1]) ||
      result.weekend.open;

    result.weekend.close =
      parseDisplayTime(weekendMatch[2]) ||
      result.weekend.close;
  }

  return result;
}

export function formatOpeningHoursSummary(
  schedule,
  language = "en"
) {
  const normalized =
    normalizeOpeningHoursSchedule(schedule);

  const labels =
    language === "vi"
      ? {
          weekdays: "Thứ 2 - Thứ 6",
          weekend: "Thứ 7 - Chủ nhật",
          closed: "Đóng cửa",
        }
      : {
          weekdays: "Mon - Fri",
          weekend: "Sat - Sun",
          closed: "Closed",
        };

  return [
    formatPeriodLine(
      labels.weekdays,
      normalized.weekdays,
      labels.closed
    ),
    formatPeriodLine(
      labels.weekend,
      normalized.weekend,
      labels.closed
    ),
  ].join("\n");
}

export function formatTime12(value) {
  if (!TIME_PATTERN.test(String(value || ""))) {
    return "";
  }

  const [hoursText, minutes] =
    String(value).split(":");

  const hours = Number(hoursText);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours =
    hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHours}:${minutes}${suffix}`;
}

export function isTimeRangeValid(period) {
  if (period?.closed) {
    return true;
  }

  if (
    !TIME_PATTERN.test(
      String(period?.open || "")
    ) ||
    !TIME_PATTERN.test(
      String(period?.close || "")
    )
  ) {
    return false;
  }

  return (
    toMinutes(period.close) >
    toMinutes(period.open)
  );
}

export function getOpeningStatus(
  schedule,
  now = new Date()
) {
  const normalized =
    normalizeOpeningHoursSchedule(schedule);

  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: normalized.timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  ).formatToParts(now);

  const weekday =
    parts.find(
      (part) => part.type === "weekday"
    )?.value || "Mon";

  const hour = Number(
    parts.find(
      (part) => part.type === "hour"
    )?.value || 0
  );

  const minute = Number(
    parts.find(
      (part) => part.type === "minute"
    )?.value || 0
  );

  const currentMinutes =
    hour * 60 + minute;

  const period =
    weekday === "Sat" ||
    weekday === "Sun"
      ? normalized.weekend
      : normalized.weekdays;

  if (period.closed) {
    return {
      isOpen: false,
      period,
      reason: "closed-day",
    };
  }

  const openMinutes = toMinutes(
    period.open
  );

  const closeMinutes = toMinutes(
    period.close
  );

  return {
    isOpen:
      currentMinutes >= openMinutes &&
      currentMinutes < closeMinutes,
    period,
    reason: "time-range",
  };
}

function normalizePeriod(
  value,
  fallback
) {
  const source =
    value && typeof value === "object"
      ? value
      : {};

  return {
    label:
      String(source.label || "").trim() ||
      fallback.label,
    open: TIME_PATTERN.test(
      String(source.open || "")
    )
      ? source.open
      : fallback.open,
    close: TIME_PATTERN.test(
      String(source.close || "")
    )
      ? source.close
      : fallback.close,
    closed:
      source.closed === true ||
      source.closed === "true",
  };
}

function formatPeriodLine(
  label,
  period,
  closedLabel
) {
  if (period.closed) {
    return `${label}: ${closedLabel}`;
  }

  return `${label}: ${formatTime12(
    period.open
  )} – ${formatTime12(period.close)}`;
}

function parseDisplayTime(value) {
  const source = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  const match = source.match(
    /^(\d{1,2})(?::(\d{2}))?(AM|PM)?$/
  );

  if (!match) return "";

  let hours = Number(match[1]);
  const minutes = Number(
    match[2] || 0
  );

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    minutes > 59
  ) {
    return "";
  }

  if (match[3]) {
    if (
      hours < 1 ||
      hours > 12
    ) {
      return "";
    }

    if (
      match[3] === "PM" &&
      hours !== 12
    ) {
      hours += 12;
    }

    if (
      match[3] === "AM" &&
      hours === 12
    ) {
      hours = 0;
    }
  }

  if (hours > 23) return "";

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

function toMinutes(value) {
  const [hours, minutes] =
    String(value || "00:00")
      .split(":")
      .map(Number);

  return (
    Number(hours || 0) * 60 +
    Number(minutes || 0)
  );
}
