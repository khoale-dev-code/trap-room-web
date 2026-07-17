
import express from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Employee } from "../models/Employee.js";
import {
  hashPassword,
  verifyPassword,
} from "../utils/password.js";

const router = express.Router();

function cookieOptions() {
  const production = env.nodeEnv === "production";

  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/",
  };
}

router.post("/login", async (req, res, next) => {
  try {
    const username = String(
      req.body?.username || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      req.body?.password || ""
    );

    if (
      username ===
        String(env.admin.username).toLowerCase() &&
      password === env.admin.password
    ) {
      const token = jwt.sign(
        {
          username: env.admin.username,
          displayName: env.admin.username,
          role: "owner",
          accountType: "owner",
        },
        env.admin.jwtSecret,
        { expiresIn: "7d" }
      );

      res.cookie(
        env.admin.cookieName,
        token,
        cookieOptions()
      );

      return res.json({
        admin: {
          username: env.admin.username,
          displayName: env.admin.username,
          role: "owner",
          accountType: "owner",
          permissions: ["*"],
        },
      });
    }

    const employee = await Employee.findOne({
      $or: [{ username }, { email: username }],
    }).select("+passwordHash +passwordSalt");

    if (
      !employee ||
      employee.isActive === false ||
      employee.accountEnabled === false
    ) {
      return res.status(401).json({
        message: "Sai tài khoản hoặc mật khẩu.",
      });
    }

    const valid = await verifyPassword(
      password,
      employee.passwordSalt,
      employee.passwordHash
    );

    if (!valid) {
      return res.status(401).json({
        message: "Sai tài khoản hoặc mật khẩu.",
      });
    }

    employee.lastLoginAt = new Date();
    employee.lastActivityAt = new Date();
    await employee.save();

    const token = jwt.sign(
      {
        employeeId: String(employee._id),
        username: employee.username,
        displayName: employee.fullName,
        role: employee.role,
        accountType: "staff",
      },
      env.admin.jwtSecret,
      { expiresIn: "7d" }
    );

    res.cookie(
      env.admin.cookieName,
      token,
      cookieOptions()
    );

    return res.json({
      admin: {
        username: employee.username,
        displayName: employee.fullName,
        role: employee.role,
        position: employee.position,
        employeeId: String(employee._id),
        employeeCode: employee.employeeCode,
        accountType: "staff",
        permissions: employee.permissions || [],
        mustChangePassword: Boolean(
          employee.mustChangePassword
        ),
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(env.admin.cookieName, {
    path: "/",
  });

  return res.json({ ok: true });
});

router.get("/me", requireAdmin, (req, res) => {
  return res.json({ admin: req.admin });
});

router.patch(
  "/change-password",
  requireAdmin,
  async (req, res, next) => {
    try {
      if (req.admin.accountType !== "staff") {
        return res.status(400).json({
          message:
            "Tài khoản chủ cửa hàng được quản lý bằng biến môi trường.",
        });
      }

      const employee = await Employee.findById(
        req.admin.employeeId
      ).select("+passwordHash +passwordSalt");

      const valid = await verifyPassword(
        req.body?.currentPassword,
        employee.passwordSalt,
        employee.passwordHash
      );

      if (!valid) {
        return res.status(400).json({
          message: "Mật khẩu hiện tại không đúng.",
        });
      }

      const nextPassword = await hashPassword(
        req.body?.newPassword
      );

      employee.passwordHash =
        nextPassword.passwordHash;
      employee.passwordSalt =
        nextPassword.passwordSalt;
      employee.mustChangePassword = false;

      await employee.save();

      return res.json({ ok: true });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
