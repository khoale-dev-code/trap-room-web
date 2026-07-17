
import express from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Employee } from "../models/Employee.js";
import {
  STAFF_ROLE_TEMPLATES,
  normalizePermissions,
  requirePermission,
} from "../security/staffPermissions.js";
import { hashPassword } from "../utils/password.js";

const router = express.Router();

router.use(
  requireAdmin,
  requirePermission("employees.manage")
);

router.get("/", async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status === "active") {
      filter.isActive = { $ne: false };
    }

    if (req.query.status === "inactive") {
      filter.isActive = false;
    }

    if (req.query.q) {
      const pattern = new RegExp(
        escapeRegex(req.query.q),
        "i"
      );

      filter.$or = [
        { fullName: pattern },
        { employeeCode: pattern },
        { username: pattern },
        { phone: pattern },
        { email: pattern },
        { position: pattern },
      ];
    }

    const employees = await Employee.find(
      filter
    )
      .sort({
        isActive: -1,
        fullName: 1,
      })
      .lean();

    return res.json({ employees });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const username = normalizeUsername(
      req.body?.username
    );

    if (!username) {
      return res.status(400).json({
        message: "Tên đăng nhập là bắt buộc.",
      });
    }

    await assertUniqueAccount(
      username,
      req.body?.email
    );

    const role = normalizeRole(req.body?.role);
    const password = await hashPassword(
      req.body?.password
    );

    const employee = await Employee.create({
      employeeCode: await nextEmployeeCode(),
      fullName: requiredText(
        req.body?.fullName,
        "Tên nhân viên"
      ),
      phone: cleanText(req.body?.phone, 40),
      email: cleanText(
        req.body?.email,
        160
      ).toLowerCase(),
      position:
        cleanText(req.body?.position, 120) ||
        "Staff",
      role,
      username,
      permissions: normalizePermissions(
        req.body?.permissions,
        role
      ),
      accountEnabled:
        req.body?.accountEnabled !== false,
      isActive: req.body?.isActive !== false,
      mustChangePassword:
        req.body?.mustChangePassword !== false,
      hireDate: cleanDate(req.body?.hireDate),
      note: cleanText(req.body?.note, 3000),
      ...password,
    });

    return res.status(201).json({
      employee: employee.toSafeObject(),
    });
  } catch (error) {
    return next(normalizeMongoError(error));
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const employee = await Employee.findById(
      req.params.id
    );

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên.",
      });
    }

    if (
      Object.hasOwn(req.body || {}, "username")
    ) {
      const username = normalizeUsername(
        req.body.username
      );

      await assertUniqueAccount(
        username,
        req.body?.email,
        employee._id
      );

      employee.username = username;
    }

    for (const [field, maxLength] of Object.entries({
      fullName: 160,
      phone: 40,
      email: 160,
      position: 120,
      note: 3000,
    })) {
      if (Object.hasOwn(req.body || {}, field)) {
        employee[field] = cleanText(
          req.body[field],
          maxLength
        );
      }
    }

    if (employee.email) {
      employee.email = employee.email.toLowerCase();
    }

    if (Object.hasOwn(req.body || {}, "role")) {
      employee.role = normalizeRole(req.body.role);
    }

    if (
      Object.hasOwn(req.body || {}, "permissions")
    ) {
      employee.permissions = normalizePermissions(
        req.body.permissions,
        employee.role
      );
    }

    for (const field of [
      "accountEnabled",
      "isActive",
      "mustChangePassword",
    ]) {
      if (Object.hasOwn(req.body || {}, field)) {
        employee[field] = Boolean(
          req.body[field]
        );
      }
    }

    if (employee.isActive === false) {
      employee.accountEnabled = false;
    }

    if (Object.hasOwn(req.body || {}, "hireDate")) {
      employee.hireDate = cleanDate(
        req.body.hireDate
      );
    }

    await employee.save();

    return res.json({
      employee: employee.toSafeObject(),
    });
  } catch (error) {
    return next(normalizeMongoError(error));
  }
});

router.patch(
  "/:id/password",
  async (req, res, next) => {
    try {
      const employee = await Employee.findById(
        req.params.id
      ).select("+passwordHash +passwordSalt");

      if (!employee) {
        return res.status(404).json({
          message: "Không tìm thấy nhân viên.",
        });
      }

      const password = await hashPassword(
        req.body?.password
      );

      employee.passwordHash =
        password.passwordHash;
      employee.passwordSalt =
        password.passwordSalt;
      employee.mustChangePassword =
        req.body?.mustChangePassword !== false;

      await employee.save();

      return res.json({ ok: true });
    } catch (error) {
      return next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const employee =
      await Employee.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            isActive: false,
            accountEnabled: false,
          },
        },
        { new: true }
      );

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên.",
      });
    }

    return res.json({
      ok: true,
      employee: employee.toSafeObject(),
    });
  } catch (error) {
    return next(error);
  }
});

async function nextEmployeeCode() {
  const last = await Employee.findOne()
    .sort({ employeeCode: -1 })
    .select("employeeCode")
    .lean();

  const current = Number(
    String(last?.employeeCode || "").match(
      /(\d+)$/
    )?.[1] || 0
  );

  return `TRAP-${String(current + 1).padStart(
    3,
    "0"
  )}`;
}

async function assertUniqueAccount(
  username,
  email,
  excludeId = null
) {
  const conditions = [{ username }];
  const cleanEmail = cleanText(
    email,
    160
  ).toLowerCase();

  if (cleanEmail) conditions.push({ email: cleanEmail });

  const filter = { $or: conditions };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const existing = await Employee.findOne(
    filter
  ).lean();

  if (existing) {
    const error = new Error(
      "Tên đăng nhập hoặc email đã được sử dụng."
    );
    error.statusCode = 409;
    throw error;
  }
}

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function normalizeRole(value) {
  const role = String(value || "")
    .trim()
    .toLowerCase();

  return Object.hasOwn(
    STAFF_ROLE_TEMPLATES,
    role
  )
    ? role
    : "custom";
}

function requiredText(value, label) {
  const result = cleanText(value, 160);

  if (!result) {
    const error = new Error(
      `${label} là bắt buộc.`
    );
    error.statusCode = 400;
    throw error;
  }

  return result;
}

function cleanText(value, maxLength) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

function cleanDate(value) {
  const result = String(value || "").trim();

  return /^\d{4}-\d{2}-\d{2}$/.test(result)
    ? result
    : "";
}

function escapeRegex(value) {
  return String(value || "").replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function normalizeMongoError(error) {
  if (error?.code === 11000) {
    const next = new Error(
      "Tên đăng nhập, email hoặc mã nhân viên đã tồn tại."
    );
    next.statusCode = 409;
    return next;
  }

  return error;
}

export default router;
