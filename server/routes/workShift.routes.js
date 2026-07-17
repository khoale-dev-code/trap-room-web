
import express from "express";
import mongoose from "mongoose";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Employee } from "../models/Employee.js";
import { WorkShift } from "../models/WorkShift.js";
import {
  hasPermission,
} from "../security/staffPermissions.js";

const router = express.Router();

router.use(requireAdmin);

router.get("/my", async (req, res, next) => {
  try {
    if (
      req.admin.accountType !== "staff" ||
      !req.admin.employeeId
    ) {
      return res.json({
        shifts: [],
        summary: {
          totalHours: 0,
          totalShifts: 0,
          byEmployee: [],
        },
      });
    }

    const range = normalizeRange(
      req.query.from,
      req.query.to
    );

    const shifts = await WorkShift.find({
      date: {
        $gte: range.from,
        $lte: range.to,
      },
      employeeIds: req.admin.employeeId,
      status: { $ne: "cancelled" },
    })
      .populate(
        "employeeIds",
        "fullName employeeCode position role isActive"
      )
      .sort({ date: 1, startTime: 1 })
      .lean();

    return res.json({
      shifts,
      summary: createSummary(shifts),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    if (
      !hasPermission(req.admin, "schedule.view") &&
      !hasPermission(req.admin, "schedule.manage")
    ) {
      return res.status(403).json({
        message:
          "Tài khoản không có quyền xem lịch làm.",
      });
    }

    const range = normalizeRange(
      req.query.from,
      req.query.to
    );

    const filter = {
      date: {
        $gte: range.from,
        $lte: range.to,
      },
    };

    if (
      req.query.employeeId &&
      mongoose.Types.ObjectId.isValid(
        req.query.employeeId
      )
    ) {
      filter.employeeIds = req.query.employeeId;
    }

    const shifts = await WorkShift.find(filter)
      .populate(
        "employeeIds",
        "fullName employeeCode position role isActive"
      )
      .sort({ date: 1, startTime: 1 })
      .lean();

    return res.json({
      shifts,
      summary: createSummary(shifts),
    });
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/copy-week",
  async (req, res, next) => {
    try {
      assertManage(req.admin);

      const sourceStart = cleanDate(
        req.body?.sourceStart
      );
      const targetStart = cleanDate(
        req.body?.targetStart
      );

      if (!sourceStart || !targetStart) {
        return res.status(400).json({
          message:
            "Tuần nguồn và tuần đích là bắt buộc.",
        });
      }

      const sourceShifts = await WorkShift.find({
        date: {
          $gte: sourceStart,
          $lte: addDays(sourceStart, 6),
        },
      }).lean();

      const offset = differenceInDays(
        sourceStart,
        targetStart
      );

      let createdCount = 0;

      for (const source of sourceShifts) {
        const date = addDays(
          source.date,
          offset
        );

        const exists = await WorkShift.exists({
          date,
          startTime: source.startTime,
          endTime: source.endTime,
          title: source.title,
        });

        if (exists) continue;

        await WorkShift.create({
          date,
          startTime: source.startTime,
          endTime: source.endTime,
          title: source.title,
          position: source.position,
          employeeIds: source.employeeIds,
          requiredStaff: source.requiredStaff,
          status: source.status,
          note: source.note,
          createdBy: req.admin.username,
          updatedBy: req.admin.username,
        });

        createdCount += 1;
      }

      return res.status(201).json({
        ok: true,
        createdCount,
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post("/", async (req, res, next) => {
  try {
    assertManage(req.admin);

    const payload = await cleanPayload(
      req.body
    );

    await assertNoConflict(payload);

    const shift = await WorkShift.create({
      ...payload,
      createdBy: req.admin.username,
      updatedBy: req.admin.username,
    });

    return res.status(201).json({
      shift: await populateShift(shift._id),
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    assertManage(req.admin);

    const current = await WorkShift.findById(
      req.params.id
    );

    if (!current) {
      return res.status(404).json({
        message: "Không tìm thấy ca làm.",
      });
    }

    const payload = await cleanPayload({
      ...current.toObject(),
      ...req.body,
    });

    await assertNoConflict(
      payload,
      current._id
    );

    Object.assign(current, payload, {
      updatedBy: req.admin.username,
    });

    await current.save();

    return res.json({
      shift: await populateShift(current._id),
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    assertManage(req.admin);

    const shift = await WorkShift.findByIdAndDelete(
      req.params.id
    );

    if (!shift) {
      return res.status(404).json({
        message: "Không tìm thấy ca làm.",
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

async function cleanPayload(input) {
  const date = cleanDate(input?.date);
  const startTime = cleanTime(input?.startTime);
  const endTime = cleanTime(input?.endTime);

  if (!date || !startTime || !endTime) {
    const error = new Error(
      "Ngày, giờ bắt đầu và giờ kết thúc là bắt buộc."
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    toMinutes(endTime) <= toMinutes(startTime)
  ) {
    const error = new Error(
      "Giờ kết thúc phải muộn hơn giờ bắt đầu."
    );
    error.statusCode = 400;
    throw error;
  }

  const employeeIds = [
    ...new Set(
      (Array.isArray(input?.employeeIds)
        ? input.employeeIds
        : []
      )
        .map(String)
        .filter((id) =>
          mongoose.Types.ObjectId.isValid(id)
        )
    ),
  ];

  const activeCount = await Employee.countDocuments(
    {
      _id: { $in: employeeIds },
      isActive: { $ne: false },
    }
  );

  if (activeCount !== employeeIds.length) {
    const error = new Error(
      "Một hoặc nhiều nhân viên không còn hoạt động."
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    date,
    startTime,
    endTime,
    title:
      cleanText(input?.title, 120) ||
      "Store shift",
    position:
      cleanText(input?.position, 120) ||
      "General",
    employeeIds,
    requiredStaff: Math.min(
      20,
      Math.max(
        1,
        Number(input?.requiredStaff || 1)
      )
    ),
    status: [
      "draft",
      "published",
      "completed",
      "cancelled",
    ].includes(input?.status)
      ? input.status
      : "published",
    note: cleanText(input?.note, 2000),
  };
}

async function assertNoConflict(
  payload,
  excludeId = null
) {
  if (!payload.employeeIds.length) return;

  const filter = {
    date: payload.date,
    employeeIds: {
      $in: payload.employeeIds,
    },
    status: { $ne: "cancelled" },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const shifts = await WorkShift.find(filter)
    .populate(
      "employeeIds",
      "fullName employeeCode"
    )
    .lean();

  for (const shift of shifts) {
    const overlaps =
      toMinutes(payload.startTime) <
        toMinutes(shift.endTime) &&
      toMinutes(payload.endTime) >
        toMinutes(shift.startTime);

    if (!overlaps) continue;

    const assigned = new Set(
      shift.employeeIds.map((employee) =>
        String(employee._id)
      )
    );

    const names = shift.employeeIds
      .filter((employee) =>
        payload.employeeIds.includes(
          String(employee._id)
        )
      )
      .map((employee) => employee.fullName)
      .join(", ");

    const error = new Error(
      `Trùng lịch với ca ${shift.startTime} – ${shift.endTime}${
        names ? ` của ${names}` : ""
      }.`
    );

    error.statusCode = 409;
    error.details = {
      conflictShiftId: shift._id,
      employeeIds: [...assigned],
    };

    throw error;
  }
}

function assertManage(account) {
  if (hasPermission(account, "schedule.manage")) {
    return;
  }

  const error = new Error(
    "Tài khoản không có quyền xếp lịch."
  );
  error.statusCode = 403;
  throw error;
}

function normalizeRange(from, to) {
  const monday = getMonday(
    formatDate(new Date())
  );

  const safeFrom = cleanDate(from) || monday;

  return {
    from: safeFrom,
    to: cleanDate(to) || addDays(safeFrom, 6),
  };
}

function createSummary(shifts) {
  const byEmployee = {};

  for (const shift of shifts) {
    const hours =
      Math.max(
        0,
        toMinutes(shift.endTime) -
          toMinutes(shift.startTime)
      ) / 60;

    for (const employee of shift.employeeIds || []) {
      const id = String(employee._id || employee);

      if (!byEmployee[id]) {
        byEmployee[id] = {
          employeeId: id,
          fullName: employee.fullName || "",
          employeeCode: employee.employeeCode || "",
          hours: 0,
          shifts: 0,
        };
      }

      byEmployee[id].hours += hours;
      byEmployee[id].shifts += 1;
    }
  }

  return {
    totalShifts: shifts.length,
    totalHours: Object.values(byEmployee).reduce(
      (sum, item) => sum + item.hours,
      0
    ),
    byEmployee: Object.values(byEmployee)
      .map((item) => ({
        ...item,
        hours:
          Math.round(item.hours * 100) / 100,
      }))
      .sort((a, b) => b.hours - a.hours),
  };
}

async function populateShift(id) {
  return WorkShift.findById(id)
    .populate(
      "employeeIds",
      "fullName employeeCode position role isActive"
    )
    .lean();
}

function cleanDate(value) {
  const result = String(value || "").trim();

  return /^\d{4}-\d{2}-\d{2}$/.test(result)
    ? result
    : "";
}

function cleanTime(value) {
  const result = String(value || "").trim();

  return /^([01]\d|2[0-3]):[0-5]\d$/.test(
    result
  )
    ? result
    : "";
}

function cleanText(value, maxLength) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

function toMinutes(value) {
  const [hours, minutes] = String(
    value || "00:00"
  )
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function formatDate(value) {
  const date = new Date(value);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(
      2,
      "0"
    ),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(value, days) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + Number(days));
  return formatDate(date);
}

function differenceInDays(source, target) {
  return Math.round(
    (new Date(`${target}T12:00:00`) -
      new Date(`${source}T12:00:00`)) /
      86400000
  );
}

function getMonday(value) {
  const date = new Date(`${value}T12:00:00`);
  const day = date.getDay();

  date.setDate(
    date.getDate() + (day === 0 ? -6 : 1 - day)
  );

  return formatDate(date);
}

export default router;
