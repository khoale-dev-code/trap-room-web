
import { Gallery } from "../models/Gallery.js";
import { MenuCategory } from "../models/MenuCategory.js";
import { Post } from "../models/Post.js";
import { Product } from "../models/Product.js";
import { Promotion } from "../models/Promotion.js";
import { Reservation } from "../models/Reservation.js";
import { Topping } from "../models/Topping.js";
import { clearAdminDemoStaffData, getAdminDemoStaffStatus, seedAdminDemoStaffData } from "./adminDemoStaff.service.js";

const DEMO_PREFIX = "TRAP_ADMIN_GUIDE_V1";

const demoModels = {
  categories: MenuCategory,
  products: Product,
  toppings: Topping,
  posts: Post,
  promotions: Promotion,
  gallery: Gallery,
  reservations: Reservation,
};

export async function getAdminDemoStatus() {
  const countEntries = await Promise.all(
    Object.entries(demoModels).map(async ([key, Model]) => [
      key,
      await Model.countDocuments({
        isDemo: true,
        demoKey: {
          $regex: `^${DEMO_PREFIX}:`,
        },
      }),
    ])
  );

  const counts = Object.fromEntries(countEntries);
  const staffStatus = await getAdminDemoStaffStatus();

  counts.employees =
    Number(
      staffStatus.counts?.employees || 0
    );

  counts.workShifts =
    Number(
      staffStatus.counts?.workShifts || 0
    );

  const total = Object.values(counts).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  return {
    demoVersion: DEMO_PREFIX,
    demoPresent: total > 0,
    total,
    counts,
  };
}

export async function seedAdminDemoData() {
  const imageUrl = "/trap-logo.png";

  const coffee = await ensureDocument(
    MenuCategory,
    `${DEMO_PREFIX}:category:coffee`,
    {
      name: "[DEMO] Coffee",
    },
    {
      name: "[DEMO] Coffee",
      slug: "demo-coffee",
      description:
        "Sample category used to explain menu grouping, visibility and display order.",
      sortOrder: 901,
      isActive: true,
      translations: {
        vi: {
          name: "[DEMO] Cà phê",
          description:
            "Danh mục mẫu dùng để hướng dẫn cách nhóm món, ẩn hiện và sắp xếp.",
        },
      },
    }
  );

  const matcha = await ensureDocument(
    MenuCategory,
    `${DEMO_PREFIX}:category:matcha`,
    {
      name: "[DEMO] Matcha",
    },
    {
      name: "[DEMO] Matcha",
      slug: "demo-matcha",
      description:
        "Sample category for matcha drinks and reusable menu organization.",
      sortOrder: 902,
      isActive: true,
      translations: {
        vi: {
          name: "[DEMO] Matcha",
          description:
            "Danh mục mẫu cho các món matcha và cách tổ chức thực đơn.",
        },
      },
    }
  );

  const bakes = await ensureDocument(
    MenuCategory,
    `${DEMO_PREFIX}:category:bakes`,
    {
      name: "[DEMO] Fresh Bakes",
    },
    {
      name: "[DEMO] Fresh Bakes",
      slug: "demo-fresh-bakes",
      description:
        "Sample category showing how baked items appear separately from drinks.",
      sortOrder: 903,
      isActive: true,
      translations: {
        vi: {
          name: "[DEMO] Bánh mới",
          description:
            "Danh mục mẫu minh họa cách tách bánh khỏi nhóm đồ uống.",
        },
      },
    }
  );

  await ensureDocument(
    Product,
    `${DEMO_PREFIX}:product:coconut-matcha`,
    {
      name: "[DEMO] Coconut Matcha",
    },
    {
      name: "[DEMO] Coconut Matcha",
      slug: "demo-coconut-matcha",
      categoryId: matcha._id,
      category: matcha.name,
      description:
        "Featured sample item demonstrating category, VND price, sizes, tags, image, availability and Vietnamese translation.",
      price: 65000,
      oldPrice: 72000,
      sizes: [
        {
          name: "Regular",
          price: 65000,
          oldPrice: 72000,
          isDefault: true,
        },
        {
          name: "Large",
          price: 75000,
          oldPrice: 82000,
          isDefault: false,
        },
      ],
      tags: ["matcha", "coconut", "cold", "best seller"],
      media: [
        {
          url: imageUrl,
          resourceType: "image",
          originalName: "trap-logo.png",
          alt: "Demo Coconut Matcha cover",
          sortOrder: 1,
        },
      ],
      imageUrl,
      sortOrder: 901,
      isFeatured: true,
      isAvailable: true,
      translations: {
        vi: {
          name: "[DEMO] Matcha dừa",
          description:
            "Món mẫu minh họa danh mục, giá VND, kích thước, nhiều tag, ảnh, trạng thái và bản dịch.",
          category: "[DEMO] Matcha",
        },
      },
    }
  );

  await ensureDocument(
    Product,
    `${DEMO_PREFIX}:product:salted-coffee`,
    {
      name: "[DEMO] Salted Cream Coffee",
    },
    {
      name: "[DEMO] Salted Cream Coffee",
      slug: "demo-salted-cream-coffee",
      categoryId: coffee._id,
      category: coffee.name,
      description:
        "Available sample coffee with one default size and reusable tags.",
      price: 55000,
      oldPrice: 0,
      sizes: [
        {
          name: "Regular",
          price: 55000,
          oldPrice: 0,
          isDefault: true,
        },
      ],
      tags: ["coffee", "cream", "signature"],
      media: [],
      imageUrl: "",
      sortOrder: 902,
      isFeatured: false,
      isAvailable: true,
      translations: {
        vi: {
          name: "[DEMO] Cà phê kem muối",
          description:
            "Món cà phê mẫu đang bán, có kích thước mặc định và tag tái sử dụng.",
          category: "[DEMO] Cà phê",
        },
      },
    }
  );

  await ensureDocument(
    Product,
    `${DEMO_PREFIX}:product:strawberry-matcha`,
    {
      name: "[DEMO] Strawberry Matcha",
    },
    {
      name: "[DEMO] Strawberry Matcha",
      slug: "demo-strawberry-matcha",
      categoryId: matcha._id,
      category: matcha.name,
      description:
        "Unavailable sample item showing how a product can stay saved while temporarily hidden from ordering.",
      price: 69000,
      oldPrice: 0,
      sizes: [
        {
          name: "Regular",
          price: 69000,
          oldPrice: 0,
          isDefault: true,
        },
      ],
      tags: ["matcha", "strawberry", "seasonal"],
      media: [],
      imageUrl: "",
      sortOrder: 903,
      isFeatured: false,
      isAvailable: false,
      translations: {
        vi: {
          name: "[DEMO] Matcha dâu",
          description:
            "Món mẫu tạm hết để hướng dẫn cách giữ dữ liệu nhưng đổi trạng thái phục vụ.",
          category: "[DEMO] Matcha",
        },
      },
    }
  );

  await ensureDocument(
    Product,
    `${DEMO_PREFIX}:product:croissant`,
    {
      name: "[DEMO] Butter Croissant",
    },
    {
      name: "[DEMO] Butter Croissant",
      slug: "demo-butter-croissant",
      categoryId: bakes._id,
      category: bakes.name,
      description:
        "Bakery sample used to explain menu categories, ordering and homepage featured items.",
      price: 45000,
      oldPrice: 0,
      sizes: [],
      tags: ["bakery", "butter", "fresh bake"],
      media: [
        {
          url: imageUrl,
          resourceType: "image",
          originalName: "trap-logo.png",
          alt: "Demo Butter Croissant cover",
          sortOrder: 1,
        },
      ],
      imageUrl,
      sortOrder: 904,
      isFeatured: true,
      isAvailable: true,
      translations: {
        vi: {
          name: "[DEMO] Croissant bơ",
          description:
            "Món bánh mẫu dùng để hướng dẫn danh mục, thứ tự và sản phẩm nổi bật.",
          category: "[DEMO] Bánh mới",
        },
      },
    }
  );

  const toppingPayloads = [
    {
      key: "espresso",
      name: "[DEMO] Extra espresso shot",
      viName: "[DEMO] Thêm shot espresso",
      group: "Coffee add-ons",
      price: 15000,
      sortOrder: 901,
    },
    {
      key: "oat-milk",
      name: "[DEMO] Oat milk",
      viName: "[DEMO] Sữa yến mạch",
      group: "Milk options",
      price: 12000,
      sortOrder: 902,
    },
    {
      key: "cream",
      name: "[DEMO] Salted cream",
      viName: "[DEMO] Kem muối",
      group: "Toppings",
      price: 10000,
      sortOrder: 903,
    },
  ];

  for (const item of toppingPayloads) {
    await ensureDocument(
      Topping,
      `${DEMO_PREFIX}:topping:${item.key}`,
      {
        name: item.name,
      },
      {
        name: item.name,
        group: item.group,
        description:
          "Sample extra showing group, additional VND price, availability and ordering.",
        price: item.price,
        media: [],
        imageUrl: "",
        sortOrder: item.sortOrder,
        isAvailable: true,
        isActive: true,
        translations: {
          vi: {
            name: item.viName,
            group:
              item.group === "Milk options"
                ? "Tùy chọn sữa"
                : item.group === "Coffee add-ons"
                  ? "Thêm vào cà phê"
                  : "Topping",
            description:
              "Món thêm mẫu minh họa nhóm, giá cộng thêm, trạng thái và thứ tự.",
          },
        },
      }
    );
  }

  await ensureDocument(
    Post,
    `${DEMO_PREFIX}:post:published`,
    {
      title: "[DEMO] How we prepare matcha",
    },
    {
      title: "[DEMO] How we prepare matcha",
      excerpt:
        "A published sample post showing title, excerpt, content, media and display order.",
      content:
        "This is a training article. Admin users can edit the title, excerpt, full content, media, publication status, pinned status and display order. Changes appear on the client Journal page after saving.",
      media: [
        {
          url: imageUrl,
          resourceType: "image",
          originalName: "trap-logo.png",
          alt: "Demo journal cover",
          sortOrder: 1,
        },
      ],
      imageUrl,
      isPublished: true,
      isPinned: false,
      sortOrder: 901,
      translations: {
        vi: {
          title: "[DEMO] Cách TRAP pha matcha",
          excerpt:
            "Bài mẫu đã xuất bản để hướng dẫn tiêu đề, mô tả ngắn, nội dung, media và thứ tự.",
          content:
            "Đây là bài viết đào tạo. Admin có thể sửa tiêu đề, mô tả ngắn, nội dung, media, trạng thái xuất bản, ghim và thứ tự hiển thị.",
        },
      },
    }
  );

  await ensureDocument(
    Post,
    `${DEMO_PREFIX}:post:draft`,
    {
      title: "[DEMO] Seasonal menu draft",
    },
    {
      title: "[DEMO] Seasonal menu draft",
      excerpt:
        "A hidden draft used to explain content preparation before publishing.",
      content:
        "This draft remains in Admin but does not appear publicly until Published is enabled.",
      media: [],
      imageUrl: "",
      isPublished: false,
      isPinned: false,
      sortOrder: 902,
      translations: {
        vi: {
          title: "[DEMO] Bản nháp thực đơn theo mùa",
          excerpt:
            "Bản nháp mẫu để hướng dẫn chuẩn bị nội dung trước khi xuất bản.",
          content:
            "Bản nháp được giữ trong Admin nhưng chưa xuất hiện ngoài website cho đến khi bật Xuất bản.",
        },
      },
    }
  );

  await ensureDocument(
    Post,
    `${DEMO_PREFIX}:post:pinned`,
    {
      title: "[DEMO] Welcome to TRAP Room",
    },
    {
      title: "[DEMO] Welcome to TRAP Room",
      excerpt:
        "A pinned published post used to explain priority content.",
      content:
        "Pinned posts can be prioritized in Admin and used as important store updates.",
      media: [],
      imageUrl: "",
      isPublished: true,
      isPinned: true,
      sortOrder: 900,
      translations: {
        vi: {
          title: "[DEMO] Chào mừng đến TRAP Room",
          excerpt:
            "Bài đã ghim dùng để hướng dẫn nội dung ưu tiên.",
          content:
            "Bài được ghim có thể được ưu tiên trong Admin và dùng cho thông báo quan trọng.",
        },
      },
    }
  );

  const today = new Date();
  const startDate = formatDate(addDays(today, -7));
  const endDate = formatDate(addDays(today, 30));

  await ensureDocument(
    Promotion,
    `${DEMO_PREFIX}:promotion:active`,
    {
      title: "[DEMO] Weekday Matcha Set",
    },
    {
      title: "[DEMO] Weekday Matcha Set",
      description:
        "Active featured offer demonstrating date range, promo label, code and client visibility.",
      code: "DEMO-MATCHA",
      discountText: "10% OFF",
      startDate,
      endDate,
      media: [
        {
          url: imageUrl,
          resourceType: "image",
          originalName: "trap-logo.png",
          alt: "Demo offer cover",
          sortOrder: 1,
        },
      ],
      imageUrl,
      linkLabel: "View menu",
      linkUrl: "/menu",
      sortOrder: 901,
      isFeatured: true,
      isActive: true,
      translations: {
        vi: {
          title: "[DEMO] Combo Matcha ngày thường",
          discountText: "GIẢM 10%",
          description:
            "Ưu đãi mẫu đang hoạt động để hướng dẫn thời gian, nhãn, mã và trạng thái hiển thị.",
          linkLabel: "Xem thực đơn",
        },
      },
    }
  );

  await ensureDocument(
    Promotion,
    `${DEMO_PREFIX}:promotion:hidden`,
    {
      title: "[DEMO] Hidden campaign",
    },
    {
      title: "[DEMO] Hidden campaign",
      description:
        "Inactive offer kept in Admin for future reuse without showing on the client.",
      code: "DEMO-HIDDEN",
      discountText: "COMING SOON",
      startDate,
      endDate,
      media: [],
      imageUrl: "",
      linkLabel: "",
      linkUrl: "",
      sortOrder: 902,
      isFeatured: false,
      isActive: false,
      translations: {
        vi: {
          title: "[DEMO] Chiến dịch đang ẩn",
          discountText: "SẮP RA MẮT",
          description:
            "Ưu đãi đang ẩn được giữ trong Admin để tái sử dụng nhưng không hiện ngoài website.",
        },
      },
    }
  );

  const galleryPayloads = [
    {
      key: "space",
      title: "[DEMO] The room",
      viTitle: "[DEMO] Không gian TRAP",
      category: "space",
      description:
        "Visible featured gallery item demonstrating category, cover media and ordering.",
      isFeatured: true,
      isActive: true,
      sortOrder: 901,
    },
    {
      key: "drink",
      title: "[DEMO] Matcha detail",
      viTitle: "[DEMO] Chi tiết Matcha",
      category: "drink",
      description:
        "Drink gallery example used to explain category filtering.",
      isFeatured: false,
      isActive: true,
      sortOrder: 902,
    },
    {
      key: "event-hidden",
      title: "[DEMO] Private event draft",
      viTitle: "[DEMO] Sự kiện đang ẩn",
      category: "event",
      description:
        "Hidden gallery item showing that media can remain saved without appearing publicly.",
      isFeatured: false,
      isActive: false,
      sortOrder: 903,
    },
  ];

  for (const item of galleryPayloads) {
    await ensureDocument(
      Gallery,
      `${DEMO_PREFIX}:gallery:${item.key}`,
      {
        title: item.title,
      },
      {
        title: item.title,
        category: item.category,
        description: item.description,
        media: [
          {
            url: imageUrl,
            resourceType: "image",
            originalName: "trap-logo.png",
            alt: item.title,
            objectPosition: "center center",
            sortOrder: 1,
          },
        ],
        imageUrl,
        sortOrder: item.sortOrder,
        isFeatured: item.isFeatured,
        isActive: item.isActive,
        translations: {
          vi: {
            title: item.viTitle,
            description:
              "Mục thư viện mẫu dùng để hướng dẫn media, danh mục, ẩn hiện, nổi bật và thứ tự.",
          },
        },
      }
    );
  }

  const reservationPayloads = [
    {
      key: "pending",
      customerName: "[DEMO] Linh Nguyen",
      phone: "0900000901",
      date: formatDate(addDays(today, 2)),
      time: "10:30",
      guestCount: 2,
      status: "pending",
      note:
        "[DEMO] Pending request: admin should review customer information and confirm or cancel.",
    },
    {
      key: "confirmed",
      customerName: "[DEMO] Minh Tran",
      phone: "0900000902",
      date: formatDate(addDays(today, 1)),
      time: "15:00",
      guestCount: 4,
      status: "confirmed",
      note:
        "[DEMO] Confirmed booking used to explain the reservation lifecycle.",
    },
    {
      key: "completed",
      customerName: "[DEMO] An Pham",
      phone: "0900000903",
      date: formatDate(addDays(today, -2)),
      time: "09:30",
      guestCount: 3,
      status: "completed",
      note:
        "[DEMO] Completed booking kept as visit history.",
    },
    {
      key: "cancelled",
      customerName: "[DEMO] Vy Le",
      phone: "0900000904",
      date: formatDate(addDays(today, 3)),
      time: "18:00",
      guestCount: 2,
      status: "cancelled",
      note:
        "[DEMO] Cancelled booking showing that records can be retained for reference.",
    },
  ];

  for (const item of reservationPayloads) {
    await ensureDocument(
      Reservation,
      `${DEMO_PREFIX}:reservation:${item.key}`,
      {
        phone: item.phone,
        note: {
          $regex: "^\\[DEMO\\]",
        },
      },
      item
    );
  }

  await seedAdminDemoStaffData();

  return getAdminDemoStatus();
}

export async function clearAdminDemoData() {
  const deleted = {};

  const orderedEntries = [
    ["reservations", Reservation],
    ["gallery", Gallery],
    ["promotions", Promotion],
    ["posts", Post],
    ["toppings", Topping],
    ["products", Product],
    ["categories", MenuCategory],
  ];

  for (const [key, Model] of orderedEntries) {
    const result = await Model.deleteMany({
      isDemo: true,
      demoKey: {
        $regex: `^${DEMO_PREFIX}:`,
      },
    });

    deleted[key] = Number(result.deletedCount || 0);
  }

  const staffResult =
    await clearAdminDemoStaffData();

  Object.assign(
    deleted,
    staffResult.deleted || {}
  );

  return {
    ok: true,
    deleted,
    status: await getAdminDemoStatus(),
  };
}

async function ensureDocument(
  Model,
  demoKey,
  identity,
  payload
) {
  let document = await Model.findOne({
    $or: [
      {
        demoKey,
      },
      identity,
    ],
  });

  if (document) {
    let changed = false;

    if (document.demoKey !== demoKey) {
      document.demoKey = demoKey;
      changed = true;
    }

    if (document.isDemo !== true) {
      document.isDemo = true;
      changed = true;
    }

    if (changed) {
      await document.save();
    }

    return document;
  }

  return Model.create({
    ...payload,
    isDemo: true,
    demoKey,
  });
}

function addDays(value, days) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDate(value) {
  const date = new Date(value);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
