
import express from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Shop } from "../models/Shop.js";

const router = express.Router();

const TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

const DEFAULT_SCHEDULE = {
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

router.get(
  "/",
  async (req, res, next) => {
    try {
      const shop =
        await getOrCreateShop();

      res.set(
        "Cache-Control",
        "no-store"
      );

      return res.json({
        shop,
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.patch(
  "/",
  requireAdmin,
  async (req, res, next) => {
    try {
      const schedule =
        normalizeSchedule(
          req.body
            ?.openingHoursSchedule
        );

      validateSchedule(schedule);

      const openingHours =
        formatSummary(schedule);

      const existing =
        await getOrCreateShop();

      const shop =
        await Shop.findByIdAndUpdate(
          existing._id,
          {
            $set: {
              openingHoursSchedule:
                schedule,
              openingHours,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        ).lean();

      res.set(
        "Cache-Control",
        "no-store"
      );

      return res.json({
        ok: true,
        shop,
      });
    } catch (error) {
      return next(error);
    }
  }
);

async function getOrCreateShop() {
  let shop = await Shop.findOne()
    .sort({
      createdAt: 1,
    })
    .lean();

  if (!shop) {
    const created =
      await Shop.create({
        openingHours:
          formatSummary(
            DEFAULT_SCHEDULE
          ),
        openingHoursSchedule:
          DEFAULT_SCHEDULE,
      });

    shop = created.toObject();
  }

  return shop;
}

function normalizeSchedule(value) {
  const source =
    value &&
    typeof value === "object"
      ? value
      : {};

  return {
    timezone:
      cleanText(
        source.timezone
      ) ||
      DEFAULT_SCHEDULE.timezone,
    weekdays: normalizePeriod(
      source.weekdays,
      DEFAULT_SCHEDULE.weekdays
    ),
    weekend: normalizePeriod(
      source.weekend,
      DEFAULT_SCHEDULE.weekend
    ),
  };
}

function normalizePeriod(
  value,
  fallback
) {
  const source =
    value &&
    typeof value === "object"
      ? value
      : {};

  return {
    label:
      cleanText(source.label) ||
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

function validateSchedule(schedule) {
  for (const [
    key,
    period,
  ] of Object.entries({
    weekdays:
      schedule.weekdays,
    weekend:
      schedule.weekend,
  })) {
    if (period.closed) {
      continue;
    }

    if (
      !TIME_PATTERN.test(
        period.open
      ) ||
      !TIME_PATTERN.test(
        period.close
      )
    ) {
      const error =
        new Error(
          `Invalid ${key} time format.`
        );

      error.statusCode = 400;
      throw error;
    }

    if (
      toMinutes(period.close) <=
      toMinutes(period.open)
    ) {
      const error =
        new Error(
          `${key} closing time must be later than opening time.`
        );

      error.statusCode = 400;
      throw error;
    }
  }
}

function formatSummary(schedule) {
  return [
    formatLine(
      "Mon - Fri",
      schedule.weekdays
    ),
    formatLine(
      "Sat - Sun",
      schedule.weekend
    ),
  ].join("\n");
}

function formatLine(
  label,
  period
) {
  if (period.closed) {
    return `${label}: Closed`;
  }

  return `${label}: ${formatTime12(
    period.open
  )} – ${formatTime12(
    period.close
  )}`;
}

function formatTime12(value) {
  const [hoursText, minutes] =
    value.split(":");

  const hours =
    Number(hoursText);

  const suffix =
    hours >= 12 ? "PM" : "AM";

  const displayHours =
    hours % 12 === 0
      ? 12
      : hours % 12;

  return `${displayHours}:${minutes}${suffix}`;
}

function toMinutes(value) {
  const [hours, minutes] =
    value
      .split(":")
      .map(Number);

  return (
    hours * 60 +
    minutes
  );
}

function cleanText(value) {
  return String(value || "")
    .trim();
}

export default router;
