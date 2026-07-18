import express from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Employee } from "../models/Employee.js";
import {
  OWNER_CREDENTIAL_KEY,
  OwnerCredential,
} from "../models/OwnerCredential.js";
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
    username:
      env.admin.username,
    displayName:
      env.admin.username,
    role: "owner",
    accountType: "owner",
    permissions: ["*"],
  };
}

function staffAccount(employee) {
  return {
    username:
      employee.username,
    displayName:
      employee.fullName,
    role:
      employee.role,
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
}

function signOwnerSession(
  passwordVersion = 0
) {
  return jwt.sign(
    {
      username:
        env.admin.username,
      displayName:
        env.admin.username,
      role: "owner",
      accountType: "owner",
      passwordVersion:
        Number(passwordVersion || 0),
    },
    env.admin.jwtSecret,
    {
      expiresIn: "7d",
    }
  );
}

function signStaffSession(admin) {
  return jwt.sign(
    {
      employeeId:
        admin.employeeId,
      username:
        admin.username,
      displayName:
        admin.displayName,
      role:
        admin.role,
      accountType: "staff",
    },
    env.admin.jwtSecret,
    {
      expiresIn: "7d",
    }
  );
}

async function getOwnerCredential() {
  return OwnerCredential.findOne({
    key: OWNER_CREDENTIAL_KEY,
  }).select(
    "+passwordHash +passwordSalt"
  );
}

async function verifyOwnerPassword(
  password,
  credential = null
) {
  if (credential) {
    return verifyPassword(
      password,
      credential.passwordSalt,
      credential.passwordHash
    );
  }

  return (
    String(password || "") ===
    String(env.admin.password || "")
  );
}

function setSessionCookie(
  res,
  token
) {
  res.cookie(
    env.admin.cookieName,
    token,
    cookieOptions()
  );
}

router.use(
  (req, res, next) => {
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    res.set(
      "Pragma",
      "no-cache"
    );
    res.set(
      "Expires",
      "0"
    );
    next();
  }
);

router.post(
  "/login",
  async (req, res, next) => {
    try {
      const username =
        String(
          req.body?.username || ""
        )
          .trim()
          .toLowerCase();

      const password =
        String(
          req.body?.password || ""
        );

      const ownerUsername =
        String(
          env.admin.username || ""
        )
          .trim()
          .toLowerCase();

      if (
        !username ||
        !password
      ) {
        return res
          .status(400)
          .json({
            message:
              "Please enter both username and password.",
            code:
              "AUTH_FIELDS_REQUIRED",
          });
      }

      if (
        username ===
        ownerUsername
      ) {
        const credential =
          await getOwnerCredential();

        const valid =
          await verifyOwnerPassword(
            password,
            credential
          );

        if (!valid) {
          return res
            .status(401)
            .json({
              message:
                "Incorrect username or password.",
              code:
                "AUTH_INVALID_CREDENTIALS",
            });
        }

        const token =
          signOwnerSession(
            credential
              ?.passwordVersion || 0
          );

        setSessionCookie(
          res,
          token
        );

        return res.json({
          admin:
            ownerAccount(),
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
              "Incorrect username or password.",
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
              "Incorrect username or password.",
            code:
              "AUTH_INVALID_CREDENTIALS",
          });
      }

      const now =
        new Date();

      await Employee.updateOne(
        {
          _id:
            employee._id,
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

      const admin =
        staffAccount(employee);

      setSessionCookie(
        res,
        signStaffSession(admin)
      );

      return res.json({
        admin,
      });
    } catch (error) {
      console.error(
        "[auth/login]",
        {
          name:
            error?.name,
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
      admin:
        req.admin,
    });
  }
);

router.patch(
  "/change-password",
  requireAdmin,
  async (req, res, next) => {
    try {
      const currentPassword =
        String(
          req.body
            ?.currentPassword || ""
        );

      const newPassword =
        String(
          req.body
            ?.newPassword || ""
        );

      const confirmPassword =
        String(
          req.body
            ?.confirmPassword || ""
        );

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res
          .status(400)
          .json({
            message:
              "Current and new passwords are required.",
            code:
              "PASSWORD_FIELDS_REQUIRED",
          });
      }

      if (
        confirmPassword &&
        confirmPassword !==
          newPassword
      ) {
        return res
          .status(400)
          .json({
            message:
              "Password confirmation does not match.",
            code:
              "PASSWORD_CONFIRMATION_MISMATCH",
          });
      }

      if (
        currentPassword ===
        newPassword
      ) {
        return res
          .status(400)
          .json({
            message:
              "The new password must be different from the current password.",
            code:
              "PASSWORD_NOT_CHANGED",
          });
      }

      if (
        req.admin
          .accountType ===
        "owner"
      ) {
        const currentCredential =
          await getOwnerCredential();

        const currentValid =
          await verifyOwnerPassword(
            currentPassword,
            currentCredential
          );

        if (!currentValid) {
          return res
            .status(400)
            .json({
              message:
                "The current password is incorrect.",
              code:
                "PASSWORD_CURRENT_INVALID",
            });
        }

        const nextPassword =
          await hashPassword(
            newPassword
          );

        const nextVersion =
          Number(
            currentCredential
              ?.passwordVersion || 0
          ) + 1;

        await OwnerCredential
          .findOneAndUpdate(
            {
              key:
                OWNER_CREDENTIAL_KEY,
            },
            {
              $set: {
                username:
                  env.admin.username,
                passwordSalt:
                  nextPassword
                    .passwordSalt,
                passwordHash:
                  nextPassword
                    .passwordHash,
                passwordVersion:
                  nextVersion,
                changedAt:
                  new Date(),
              },
            },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert:
                true,
              runValidators:
                true,
            }
          );

        setSessionCookie(
          res,
          signOwnerSession(
            nextVersion
          )
        );

        return res.json({
          ok: true,
          message:
            "Owner password changed successfully.",
          admin:
            ownerAccount(),
        });
      }

      const employee =
        await Employee.findById(
          req.admin
            .employeeId
        ).select(
          "+passwordHash +passwordSalt"
        );

      if (!employee) {
        return res
          .status(404)
          .json({
            message:
              "The staff account could not be found.",
          });
      }

      const currentValid =
        await verifyPassword(
          currentPassword,
          employee.passwordSalt,
          employee.passwordHash
        );

      if (!currentValid) {
        return res
          .status(400)
          .json({
            message:
              "The current password is incorrect.",
            code:
              "PASSWORD_CURRENT_INVALID",
          });
      }

      const nextPassword =
        await hashPassword(
          newPassword
        );

      await Employee.updateOne(
        {
          _id:
            employee._id,
        },
        {
          $set: {
            passwordSalt:
              nextPassword
                .passwordSalt,
            passwordHash:
              nextPassword
                .passwordHash,
            mustChangePassword:
              false,
            lastActivityAt:
              new Date(),
          },
        },
        {
          runValidators: false,
        }
      );

      const refreshed =
        await Employee.findById(
          employee._id
        ).lean();

      const admin =
        staffAccount(
          refreshed || employee
        );

      setSessionCookie(
        res,
        signStaffSession(admin)
      );

      return res.json({
        ok: true,
        message:
          "Password changed successfully.",
        admin,
      });
    } catch (error) {
      console.error(
        "[auth/change-password]",
        {
          name:
            error?.name,
          code:
            error?.code ||
            "PASSWORD_CHANGE_FAILED",
          message:
            error?.message ||
            "Unknown password change error",
        }
      );

      return next(error);
    }
  }
);

export default router;
