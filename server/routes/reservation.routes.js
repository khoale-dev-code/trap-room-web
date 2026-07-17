import express from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Reservation } from "../models/Reservation.js";
import {
  assertDateString,
  assertTimeString,
  numberValue,
  requiredText,
  text,
} from "../utils/common.js";

const router = express.Router();
const statuses = ["pending", "confirmed", "completed", "cancelled"];

function cleanCreate(input = {}, adminCreated = false) {
  const status = statuses.includes(input.status)
    ? input.status
    : adminCreated
      ? "confirmed"
      : "pending";

  return {
    customerName: requiredText(input.customerName, "Customer name", 160),
    phone: requiredText(input.phone, "Phone number", 60),
    date: assertDateString(input.date, "Reservation date", { optional: false }),
    time: assertTimeString(input.time, "Reservation time", { optional: false }),
    guestCount: Math.min(30, numberValue(input.guestCount, 2, 1)),
    note: text(input.note, 2000),
    status,
  };
}

router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const filter = {};

    if (statuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.q) {
      filter.$or = [
        { customerName: { $regex: req.query.q, $options: "i" } },
        { phone: { $regex: req.query.q, $options: "i" } },
        { note: { $regex: req.query.q, $options: "i" } },
      ];
    }

    const reservations = await Reservation.find(filter)
      .sort({ date: -1, time: -1, createdAt: -1 })
      .lean();

    res.json({ reservations });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const reservation = await Reservation.create(cleanCreate(req.body, false));
    res.status(201).json({ reservation });
  } catch (error) {
    next(error);
  }
});

router.post("/admin", requireAdmin, async (req, res, next) => {
  try {
    const reservation = await Reservation.create(cleanCreate(req.body, true));
    res.status(201).json({ reservation });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const payload = {};

    if (Object.hasOwn(req.body, "status")) {
      if (!statuses.includes(req.body.status)) {
        return res.status(400).json({ message: "Invalid booking status." });
      }
      payload.status = req.body.status;
    }

    if (Object.hasOwn(req.body, "customerName")) {
      payload.customerName = requiredText(req.body.customerName, "Customer name", 160);
    }

    if (Object.hasOwn(req.body, "phone")) {
      payload.phone = requiredText(req.body.phone, "Phone number", 60);
    }

    if (Object.hasOwn(req.body, "date")) {
      payload.date = assertDateString(req.body.date, "Reservation date", { optional: false });
    }

    if (Object.hasOwn(req.body, "time")) {
      payload.time = assertTimeString(req.body.time, "Reservation time", { optional: false });
    }

    if (Object.hasOwn(req.body, "guestCount")) {
      payload.guestCount = Math.min(30, numberValue(req.body.guestCount, 2, 1));
    }

    if (Object.hasOwn(req.body, "note")) {
      payload.note = text(req.body.note, 2000);
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.json({ reservation });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
