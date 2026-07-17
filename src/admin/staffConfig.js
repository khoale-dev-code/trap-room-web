
export const PERMISSION_OPTIONS = [
  ["dashboard.view", "View dashboard", "Xem tổng quan"],
  ["shop.manage", "Manage store settings", "Quản lý cửa hàng"],
  ["menu.manage", "Manage menu", "Quản lý thực đơn"],
  ["content.manage", "Manage content", "Quản lý nội dung"],
  ["bookings.view", "View bookings", "Xem đặt bàn"],
  ["bookings.manage", "Manage bookings", "Quản lý đặt bàn"],
  ["employees.manage", "Manage employees", "Quản lý nhân viên"],
  ["schedule.view", "View own schedule", "Xem lịch cá nhân"],
  ["schedule.manage", "Manage schedules", "Xếp lịch làm"],
  ["translations.manage", "Manage translations", "Quản lý chuyển ngữ"],
  ["admin.guide", "Use admin guide", "Dùng hướng dẫn Admin"],
].map(([value, en, vi]) => ({
  value,
  en,
  vi,
}));

export const ROLE_OPTIONS = [
  ["manager", "Manager", "Quản lý"],
  ["supervisor", "Supervisor", "Trưởng ca"],
  ["barista", "Barista", "Pha chế"],
  ["cashier", "Cashier", "Thu ngân"],
  ["content", "Content", "Nội dung"],
  ["custom", "Custom", "Tùy chỉnh"],
].map(([value, en, vi]) => ({
  value,
  en,
  vi,
}));

export const ROLE_TEMPLATES = {
  manager: PERMISSION_OPTIONS.map(
    (item) => item.value
  ),
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
