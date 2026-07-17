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
  const production =
    env.nodeEnv === "production";

  return {
    httpOnly: true,
    secure: production,
    // Vercel proxies /api through the same browser origin.
    // Lax is more reliable on Safari than a third-party None cookie.
    sameSite: "lax",
    maxAge:
      1000 * 60 * 60 * 24 * 7,
    path: "/",
  };
}

function clearCookieOptions() {
  const {
    maxAge,
    ...options
  } = cookieOptions();

  return options;
}

function ownerAccount() {
  return {
    username: env.admin.username,
    displayName:
      env.admin.username,
    role: "owner",
    accountType: "owner",
    permissions: ["*"],
  };
}

function signSession(payload) {
  return jwt.sign(
    payload,
    env.admin.jwtSecret,
    {
      expiresIn: "7d",
    }
  );
}

router.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

router.post(
  "/login",
  async (req, res, next) => {
    try {
      const username = String(
        req.body?.username || ""
      )
        .trim()
        .toLowerCase();

      const password = String(
        req.body?.password || ""
      );

      const ownerUsername =
        String(
          env.admin.username || ""
        )
          .trim()
          .toLowerCase();

      if (!username || !password) {
        return res.status(400).json({
          message:
            "Vui lòng nhập tài khoản và mật khẩu.",
          code: "AUTH_FIELDS_REQUIRED",
        });
      }

      /*
       * Owner and staff authentication must not fall through
       * to one another. A wrong owner password returns 401
       * immediately instead of querying a possibly legacy
       * Employee record with the same username.
       */
      if (
        username ===
        ownerUsername
      ) {
        if (
          password !==
          String(
            env.admin.password || ""
          )
        ) {
          return res
            .status(401)
            .json({
              message:
                "Sai tài khoản hoặc mật khẩu.",
              code:
                "AUTH_INVALID_CREDENTIALS",
            });
        }

        const admin =
          ownerAccount();

        const token =
          signSession({
            username:
              admin.username,
            displayName:
              admin.displayName,
            role: "owner",
            accountType: "owner",
          });

        res.cookie(
          env.admin.cookieName,
          token,
          cookieOptions()
        );

        return res.json({
          admin,
        });
      }

      const employee =
        await Employee.findOne({
          $or: [
            { username },
            { email: username },
          ],
        }).select(
          "+passwordHash +passwordSalt"
        );

      if (
        !employee ||
        employee.isActive ===
          false ||
        employee.accountEnabled ===
          false
      ) {
        return res
          .status(401)
          .json({
            message:
              "Sai tài khoản hoặc mật khẩu.",
            code:
              "AUTH_INVALID_CREDENTIALS",
          });
      }

      const valid =
        await verifyPassword(
          password,
          employee.passwordSalt,
          employee.passwordHash
        );

      if (!valid) {
        return res
          .status(401)
          .json({
            message:
              "Sai tài khoản hoặc mật khẩu.",
            code:
              "AUTH_INVALID_CREDENTIALS",
          });
      }

      /*
       * Do not call employee.save() during login.
       * Old Employee documents can be missing fields that
       * became required later. Saving the whole document
       * triggers unrelated schema validation and returns 500.
       */
      const now = new Date();

      await Employee.updateOne(
        {
          _id: employee._id,
        },
        {
          $set: {
            lastLoginAt: now,
            lastActivityAt: now,
          },
        },
        {
          runValidators: false,
        }
      );

      const admin = {
        username:
          employee.username,
        displayName:
          employee.fullName,
        role: employee.role,
        position:
          employee.position,
        employeeId:
          String(employee._id),
        employeeCode:
          employee.employeeCode,
        accountType: "staff",
        permissions:
          employee.permissions || [],
        mustChangePassword:
          Boolean(
            employee.mustChangePassword
          ),
      };

      const token =
        signSession({
          employeeId:
            admin.employeeId,
          username:
            admin.username,
          displayName:
            admin.displayName,
          role: admin.role,
          accountType: "staff",
        });

      res.cookie(
        env.admin.cookieName,
        token,
        cookieOptions()
      );

      return res.json({
        admin,
      });
    } catch (error) {
      console.error(
        "[auth/login]",
        {
          name: error?.name,
          code:
            error?.code ||
            "AUTH_LOGIN_FAILED",
          message:
            error?.message ||
            "Unknown login error",
        }
      );

      return next(error);
    }
  }
);

router.post(
  "/logout",
  (req, res) => {
    res.clearCookie(
      env.admin.cookieName,
      clearCookieOptions()
    );

    return res.json({
      ok: true,
    });
  }
);

router.get(
  "/me",
  requireAdmin,
  (req, res) => {
    return res.json({
      admin: req.admin,
    });
  }
);

router.patch(
  "/change-password",
  requireAdmin,
  async (req, res, next) => {
    try {
      if (
        req.admin.accountType !==
        "staff"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Tài khoản chủ cửa hàng được quản lý bằng biến môi trường.",
          });
      }

      const employee =
        await Employee.findById(
          req.admin.employeeId
        ).select(
          "+passwordHash +passwordSalt"
        );

      if (!employee) {
        return res
          .status(404)
          .json({
            message:
              "Không tìm thấy tài khoản nhân viên.",
          });
      }

      const valid =
        await verifyPassword(
          req.body
            ?.currentPassword,
          employee.passwordSalt,
          employee.passwordHash
        );

      if (!valid) {
        return res
          .status(400)
          .json({
            message:
              "Mật khẩu hiện tại không đúng.",
          });
      }

      const nextPassword =
        await hashPassword(
          req.body?.newPassword
        );

      employee.passwordHash =
        nextPassword.passwordHash;

      employee.passwordSalt =
        nextPassword.passwordSalt;

      employee.mustChangePassword =
        false;

      await employee.save();

      return res.json({
        ok: true,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
