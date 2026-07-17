
const TAB_TRANSLATIONS = {
  dashboard: {
    en: {
      label: "Overview",
      description: "Store performance and latest activity",
    },
    vi: {
      label: "Tổng quan",
      description: "Hiệu suất cửa hàng và hoạt động gần đây",
    },
  },
  guide: {
    en: {
      label: "Admin guide",
      description: "Training notes and safe demo data",
    },
    vi: {
      label: "Hướng dẫn Admin",
      description: "Hướng dẫn chức năng và dữ liệu mẫu an toàn",
    },
  },
  shop: {
    en: {
      label: "Store settings",
      description: "Brand, contact, map and opening hours",
    },
    vi: {
      label: "Thông tin cửa hàng",
      description: "Thương hiệu, liên hệ, bản đồ và giờ mở cửa",
    },
  },
  categories: {
    en: {
      label: "Categories",
      description: "Menu groups, visibility and display order",
    },
    vi: {
      label: "Danh mục",
      description: "Nhóm thực đơn, trạng thái và thứ tự hiển thị",
    },
  },
  products: {
    en: {
      label: "Menu items",
      description: "Products, prices, sizes and reusable tags",
    },
    vi: {
      label: "Món trong thực đơn",
      description: "Sản phẩm, giá, kích thước và tag tái sử dụng",
    },
  },
  toppings: {
    en: {
      label: "Extras",
      description: "Milk options, toppings and additional prices",
    },
    vi: {
      label: "Món thêm",
      description: "Tùy chọn sữa, topping và giá cộng thêm",
    },
  },
  posts: {
    en: {
      label: "Journal",
      description: "Stories, drafts and published updates",
    },
    vi: {
      label: "Bài viết",
      description: "Câu chuyện, bản nháp và nội dung đã xuất bản",
    },
  },
  promotions: {
    en: {
      label: "Offers",
      description: "Campaigns, promo codes and active dates",
    },
    vi: {
      label: "Ưu đãi",
      description: "Chiến dịch, mã ưu đãi và thời gian hoạt động",
    },
  },
  gallery: {
    en: {
      label: "Gallery",
      description: "Images, videos and visual publishing",
    },
    vi: {
      label: "Thư viện",
      description: "Hình ảnh, video và nội dung trực quan",
    },
  },
  employees: {
    en: {
      label: "Employees",
      description: "Staff accounts, roles and permissions",
    },
    vi: {
      label: "Nhân viên",
      description: "Tài khoản, vai trò và phân quyền nhân viên",
    },
  },
  schedules: {
    en: {
      label: "Work schedule",
      description: "Create shifts and assign employees",
    },
    vi: {
      label: "Xếp lịch làm",
      description: "Tạo ca và phân công nhân viên",
    },
  },
  "my-schedule": {
    en: {
      label: "My schedule",
      description: "Personal weekly shifts and working hours",
    },
    vi: {
      label: "Lịch của tôi",
      description: "Ca cá nhân và tổng giờ làm theo tuần",
    },
  },
  reservations: {
    en: {
      label: "Bookings",
      description: "Customer table requests and status",
    },
    vi: {
      label: "Đặt bàn",
      description: "Yêu cầu đặt bàn và trạng thái xử lý",
    },
  },
  translations: {
    en: {
      label: "Translations",
      description: "English and Vietnamese client content",
    },
    vi: {
      label: "Chuyển ngữ",
      description: "Nội dung tiếng Anh và tiếng Việt ngoài client",
    },
  },
};

const GROUP_TRANSLATIONS = {
  workspace: {
    en: "Workspace",
    vi: "Không gian làm việc",
  },
  content: {
    en: "Content",
    vi: "Nội dung",
  },
  publishing: {
    en: "Publishing",
    vi: "Xuất bản",
  },
  operations: {
    en: "Operations",
    vi: "Vận hành",
  },
  system: {
    en: "System",
    vi: "Hệ thống",
  },
};

const GROUP_ALIASES = {
  workspace: "workspace",
  "không gian làm việc": "workspace",
  content: "content",
  "nội dung": "content",
  publishing: "publishing",
  "xuất bản": "publishing",
  operations: "operations",
  operation: "operations",
  "team operations": "operations",
  "vận hành": "operations",
  system: "system",
  "language and access": "system",
  "ngôn ngữ và quyền truy cập": "system",
  "hệ thống": "system",
};

export function normalizeAdminLanguage(language) {
  return String(language || "").toLowerCase() === "vi"
    ? "vi"
    : "en";
}

export function getAdminTabTranslation(tab, language) {
  const locale = normalizeAdminLanguage(language);

  return (
    tab?.translations?.[locale] ||
    TAB_TRANSLATIONS[tab?.id]?.[locale] ||
    {}
  );
}

export function getAdminGroupLabel(group, language) {
  const locale = normalizeAdminLanguage(language);
  const source = String(group || "Workspace").trim();
  const alias =
    GROUP_ALIASES[source.toLowerCase()] ||
    source.toLowerCase();

  return (
    GROUP_TRANSLATIONS[alias]?.[locale] ||
    source
  );
}

export function localizeAdminTab(tab, language) {
  const locale = normalizeAdminLanguage(language);
  const translation = getAdminTabTranslation(tab, locale);

  const suffix = locale === "vi" ? "Vi" : "En";

  return {
    ...tab,
    label:
      translation.label ||
      tab?.[`label${suffix}`] ||
      tab?.label ||
      tab?.id ||
      "",
    description:
      translation.description ||
      tab?.[`description${suffix}`] ||
      tab?.description ||
      "",
    group:
      tab?.groupTranslations?.[locale] ||
      tab?.[`group${suffix}`] ||
      getAdminGroupLabel(tab?.group, locale),
  };
}

export function localizeAdminTabs(tabs, language) {
  return (Array.isArray(tabs) ? tabs : []).map((tab) =>
    localizeAdminTab(tab, language)
  );
}

export function getAdminSidebarCopy(language) {
  const locale = normalizeAdminLanguage(language);

  if (locale === "vi") {
    return {
      brandTitle: "Quản trị",
      brandSubtitle: "Không gian làm việc",
      signedIn: "Đã đăng nhập",
      website: "Xem website",
      signOut: "Đăng xuất",
      collapse: "Thu gọn thanh bên",
      expand: "Mở rộng thanh bên",
      close: "Đóng menu",
      open: "Mở menu",
      currentPage: "Trang hiện tại",
    };
  }

  return {
    brandTitle: "Admin",
    brandSubtitle: "Workspace",
    signedIn: "Signed in",
    website: "Website",
    signOut: "Sign out",
    collapse: "Collapse sidebar",
    expand: "Expand sidebar",
    close: "Close menu",
    open: "Open menu",
    currentPage: "Current page",
  };
}

export const ADMIN_SIDEBAR_TRANSLATION_IDS =
  Object.freeze(Object.keys(TAB_TRANSLATIONS));
