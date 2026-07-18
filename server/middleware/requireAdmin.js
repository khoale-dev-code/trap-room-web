import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Employee } from "../models/Employee.js";
import {
  OWNER_CREDENTIAL_KEY,
  OwnerCredential,
} from "../models/OwnerCredential.js";
import {
  hasAnyPermission,
  permissionsForRequest,
} from "../security/staffPermissions.js";

export async function requireAdmin(
  req,
  res,
  next
) {
  try {
    const token =
      req.cookies?.[
        env.admin.cookieName
      ];

    if (!token) {
      return res
        .status(401)
        .json({
          message:
            "You need to sign in to continue.",
        });
    }

    const payload =
      jwt.verify(
        token,
        env.admin.jwtSecret
      );

    if (
      payload.accountType !==
      "staff"
    ) {
      const credential =
        await OwnerCredential
          .findOne({
            key:
              OWNER_CREDENTIAL_KEY,
          })
          .select(
            "passwordVersion"
          )
          .lean();

      const currentVersion =
        Number(
          credential
            ?.passwordVersion || 0
        );

      const tokenVersion =
        Number(
          payload
            ?.passwordVersion || 0
        );

      if (
        currentVersion !==
        tokenVersion
      ) {
        return res
          .status(401)
          .json({
            message:
              "This owner session is no longer valid. Please sign in again.",
            code:
              "OWNER_SESSION_REVOKED",
          });
      }

      req.admin = {
        username:
          payload.username,
        displayName:
          payload.displayName ||
          payload.username,
        role: "owner",
        accountType: "owner",
        permissions: ["*"],
      };

      return next();
    }

    const employee =
      await Employee.findOne({
        _id:
          payload.employeeId,
        isActive: {
          $ne: false,
        },
        accountEnabled: {
          $ne: false,
        },
      }).lean();

    if (!employee) {
      return res
        .status(401)
        .json({
          message:
            "The staff account is locked or no longer exists.",
        });
    }

    req.admin = {
      username:
        employee.username,
      displayName:
        employee.fullName,
      role:
        employee.role,
      accountType: "staff",
      employeeId:
        String(employee._id),
      employeeCode:
        employee.employeeCode,
      position:
        employee.position,
      permissions:
        employee.permissions || [],
      mustChangePassword:
        Boolean(
          employee
            .mustChangePassword
        ),
    };

    const required =
      permissionsForRequest(req);

    if (
      required.length > 0 &&
      !hasAnyPermission(
        req.admin,
        required
      )
    ) {
      return res
        .status(403)
        .json({
          message:
            "This account does not have permission to use this feature.",
          requiredPermissions:
            required,
        });
    }

    return next();
  } catch {
    return res
      .status(401)
      .json({
        message:
          "Your session has expired. Please sign in again.",
      });
  }
}
