
export const STAFF_PERMISSIONS = [
  "dashboard.view",
  "shop.manage",
  "menu.manage",
  "content.manage",
  "bookings.view",
  "bookings.manage",
  "employees.manage",
  "schedule.view",
  "schedule.manage",
  "translations.manage",
  "admin.guide",
];

export const STAFF_ROLE_TEMPLATES = {
  manager: [...STAFF_PERMISSIONS],
  supervisor: [
    "dashboard.view",
    "menu.manage",
    "bookings.view",
    "bookings.manage",
    "schedule.view",
    "schedule.manage",
  ],
  barista: [
    "dashboard.view",
    "bookings.view",
    "schedule.view",
  ],
  cashier: [
    "dashboard.view",
    "bookings.view",
    "bookings.manage",
    "schedule.view",
  ],
  content: [
    "dashboard.view",
    "menu.manage",
    "content.manage",
    "translations.manage",
  ],
  custom: [
    "dashboard.view",
    "schedule.view",
  ],
};

export function normalizePermissions(value, role = "custom") {
  const requested = Array.isArray(value)
    ? value
    : STAFF_ROLE_TEMPLATES[role] || [];

  return [
    ...new Set(
      requested.filter((permission) =>
        STAFF_PERMISSIONS.includes(permission)
      )
    ),
  ];
}

export function hasPermission(account, permission) {
  if (
    account?.accountType === "owner" ||
    account?.permissions?.includes("*")
  ) {
    return true;
  }

  return Boolean(account?.permissions?.includes(permission));
}

export function permissionsForRequest(req) {
  const baseUrl = String(req.baseUrl || "").toLowerCase();
  const method = String(req.method || "GET").toUpperCase();
  const readOnly = method === "GET" || method === "HEAD";

  if (baseUrl.includes("/api/auth")) return [];
  if (baseUrl.includes("/api/employees")) return ["employees.manage"];

  if (baseUrl.includes("/api/work-shifts")) {
    return readOnly
      ? ["schedule.view", "schedule.manage"]
      : ["schedule.manage"];
  }

  if (baseUrl.includes("/api/admin-demo")) return ["admin.guide"];
  if (baseUrl.includes("/api/admin")) return ["dashboard.view"];

  if (
    baseUrl.includes("/api/shop") ||
    baseUrl.includes("/api/shop-hours")
  ) {
    return ["shop.manage"];
  }

  if (
    baseUrl.includes("/api/categories") ||
    baseUrl.includes("/api/products") ||
    baseUrl.includes("/api/toppings")
  ) {
    return ["menu.manage"];
  }

  if (
    baseUrl.includes("/api/posts") ||
    baseUrl.includes("/api/promotions") ||
    baseUrl.includes("/api/gallery")
  ) {
    return ["content.manage"];
  }

  if (baseUrl.includes("/api/reservations")) {
    return readOnly
      ? ["bookings.view", "bookings.manage"]
      : ["bookings.manage"];
  }

  if (
    baseUrl.includes("/api/translations-admin") ||
    baseUrl.includes("/api/localization") ||
    baseUrl.includes("/api/translations")
  ) {
    return ["translations.manage"];
  }

  if (baseUrl.includes("/api/upload")) {
    return ["shop.manage", "menu.manage", "content.manage"];
  }

  return ["__deny_unknown_route__"];
}

export function hasAnyPermission(account, permissions) {
  return permissions.some((permission) =>
    hasPermission(account, permission)
  );
}

export function requirePermission(permission) {
  return function permissionGuard(req, res, next) {
    if (hasPermission(req.admin, permission)) return next();

    return res.status(403).json({
      message: "Tài khoản không có quyền thực hiện chức năng này.",
      requiredPermission: permission,
    });
  };
}
