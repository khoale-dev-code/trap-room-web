
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Employee } from "../models/Employee.js";
import {
  hasAnyPermission,
  permissionsForRequest,
} from "../security/staffPermissions.js";

export async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[env.admin.cookieName];

    if (!token) {
      return res.status(401).json({
        message: "Bạn cần đăng nhập để tiếp tục.",
      });
    }

    const payload = jwt.verify(
      token,
      env.admin.jwtSecret
    );

    if (payload.accountType !== "staff") {
      req.admin = {
        username: payload.username,
        displayName: payload.displayName || payload.username,
        role: "owner",
        accountType: "owner",
        permissions: ["*"],
      };

      return next();
    }

    const employee = await Employee.findOne({
      _id: payload.employeeId,
      isActive: { $ne: false },
      accountEnabled: { $ne: false },
    }).lean();

    if (!employee) {
      return res.status(401).json({
        message:
          "Tài khoản nhân viên đã bị khóa hoặc không còn tồn tại.",
      });
    }

    req.admin = {
      username: employee.username,
      displayName: employee.fullName,
      role: employee.role,
      accountType: "staff",
      employeeId: String(employee._id),
      employeeCode: employee.employeeCode,
      position: employee.position,
      permissions: employee.permissions || [],
      mustChangePassword: Boolean(
        employee.mustChangePassword
      ),
    };

    const required = permissionsForRequest(req);

    if (
      required.length > 0 &&
      !hasAnyPermission(req.admin, required)
    ) {
      return res.status(403).json({
        message:
          "Tài khoản không có quyền truy cập chức năng này.",
        requiredPermissions: required,
      });
    }

    return next();
  } catch {
    return res.status(401).json({
      message:
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    });
  }
}
