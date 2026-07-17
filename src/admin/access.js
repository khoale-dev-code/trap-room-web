
export const TAB_PERMISSION_MAP = {
  dashboard: "dashboard.view",
  shop: "shop.manage",
  categories: "menu.manage",
  products: "menu.manage",
  toppings: "menu.manage",
  posts: "content.manage",
  promotions: "content.manage",
  gallery: "content.manage",
  reservations: "bookings.view",
  translations: "translations.manage",
  guide: "admin.guide",
  employees: "employees.manage",
  schedules: "schedule.manage",
  "my-schedule": "schedule.view",
};

export function hasPermission(account, permission) {
  if (
    account?.accountType === "owner" ||
    account?.permissions?.includes("*")
  ) {
    return true;
  }

  return Boolean(account?.permissions?.includes(permission));
}

export function canAccessTab(account, tabId) {
  const permission = TAB_PERMISSION_MAP[tabId];

  if (!permission) {
    return account?.accountType === "owner";
  }

  return hasPermission(account, permission);
}

export function filterTabsForAccount(tabs, account) {
  return tabs.filter((tab) =>
    canAccessTab(account, tab.id)
  );
}

export function getFirstAllowedTab(account) {
  return (
    [
      "dashboard",
      "my-schedule",
      "reservations",
      "products",
    ].find((tabId) =>
      canAccessTab(account, tabId)
    ) || "my-schedule"
  );
}
