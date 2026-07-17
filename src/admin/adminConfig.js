
import {
  BadgePercent,
  CalendarDays,
  Coffee,
  Images,
  LayoutDashboard,
  ListTree,
  Newspaper,
  Settings2,
  Store,
  Utensils,
  Languages,
  BookOpenCheck,
  UsersRound,
  CalendarRange,
  Clock3,
} from "lucide-react";

export const tabs = [
  {
    id: "dashboard",
    label: "Overview",
    description: "Store performance and latest activity",
    icon: LayoutDashboard,
    group: "Workspace",
  },
  {
    id: "guide",
    label: "Admin guide",
    description: "Training notes and safe demo data",
    icon: BookOpenCheck,
    group: "Workspace",
  },

  {
    id: "shop",
    label: "Store settings",
    description: "Brand, contact, maps and homepage media",
    icon: Store,
    group: "Workspace",
  },
  {
    id: "categories",
    label: "Categories",
    description: "Organize the menu structure",
    icon: ListTree,
    group: "Content",
  },
  {
    id: "products",
    label: "Menu items",
    description: "Create drinks, bakes, prices and sizes",
    icon: Coffee,
    group: "Content",
  },
  {
    id: "toppings",
    label: "Extras",
    description: "Toppings and optional add-ons",
    icon: Utensils,
    group: "Content",
  },
  {
    id: "posts",
    label: "Journal",
    description: "Stories and store updates",
    icon: Newspaper,
    group: "Publishing",
  },
  {
    id: "promotions",
    label: "Offers",
    description: "Promotions and limited campaigns",
    icon: BadgePercent,
    group: "Publishing",
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Images and videos from TRAP Room",
    icon: Images,
    group: "Publishing",
  },
  {
    id: "translations",
    label: "Translations",
    description: "English and Vietnamese content",
    icon: Languages,
    group: "Operations",
  },

  
  {
    id: "employees",
    label: "Employees",
    description: "Staff accounts, roles and permissions",
    icon: UsersRound,
    group: "Operations",
  },
  {
    id: "schedules",
    label: "Work schedule",
    description: "Create shifts and assign employees",
    icon: CalendarRange,
    group: "Operations",
  },
  {
    id: "my-schedule",
    label: "My schedule",
    description: "Personal weekly shifts and hours",
    icon: Clock3,
    group: "Operations",
  },
{
    id: "reservations",
    label: "Bookings",
    description: "Review and manage table requests",
    icon: CalendarDays,
    group: "Operations",
  },
];

export const resourceConfig = {
  categories: {
    id: "categories",
    title: "Menu categories",
    singular: "category",
    description: "Create a clear structure so customers can browse the menu quickly.",
    api: "categories",
    responseKey: "categories",
    itemKey: "category",
    fields: [
      {
        name: "name",
        label: "Category name",
        placeholder: "Coffee",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        placeholder: "A short description for this category.",
        type: "textarea",
        full: true,
      },
      {
        name: "sortOrder",
        label: "Display order",
        type: "number",
        defaultValue: 999,
      },
      {
        name: "isActive",
        label: "Visible on client",
        help: "Turn this off to hide the category without deleting it.",
        type: "checkbox",
        defaultValue: true,
        full: true,
      },
    ],
  },

  products: {
    id: "products",
    title: "Menu items",
    singular: "menu item",
    description: "Manage product details, pricing, media, availability and size options.",
    api: "products",
    responseKey: "products",
    itemKey: "product",
    supportsMedia: true,
    fields: [
      {
        name: "name",
        label: "Item name",
        placeholder: "Coconut matcha",
        required: true,
        full: true,
      },
      {
        name: "categoryId",
        label: "Menu category",
        type: "category-select",
      },
      {
        name: "category",
        label: "Fallback category name",
        placeholder: "Use only when no category is selected",
      },
      {
        name: "description",
        label: "Description",
        placeholder: "Describe the flavor, ingredients and experience.",
        type: "textarea",
        full: true,
      },
      {
        name: "price",
        label: "Base price",
        type: "number",
        defaultValue: 0,
      },
      {
        name: "oldPrice",
        label: "Previous price",
        type: "number",
        defaultValue: 0,
      },
      {
        name: "sizes",
        label: "Size options",
        type: "sizes",
        full: true,
        defaultValue: [],
      },
      {
        name: "tags",
        label: "Tags",
        placeholder: "matcha, coconut, cold",
        type: "tags",
        full: true,
      },
      {
        name: "sortOrder",
        label: "Display order",
        type: "number",
        defaultValue: 999,
      },
      {
        name: "isFeatured",
        label: "House favorite",
        help: "Featured items appear in homepage highlights.",
        type: "checkbox",
        defaultValue: false,
      },
      {
        name: "isAvailable",
        label: "Available today",
        help: "Unavailable items stay saved but are marked as unavailable.",
        type: "checkbox",
        defaultValue: true,
      },
    ],
  },

  toppings: {
    id: "toppings",
    title: "Extras",
    singular: "extra",
    description: "Manage optional add-ons, toppings and additional prices.",
    api: "toppings",
    responseKey: "toppings",
    itemKey: "topping",
    supportsMedia: true,
    fields: [
      {
        name: "name",
        label: "Extra name",
        placeholder: "Extra matcha shot",
        required: true,
        full: true,
      },
      {
        name: "group",
        label: "Group",
        placeholder: "Extra",
        defaultValue: "Extra",
      },
      {
        name: "price",
        label: "Price",
        type: "number",
        defaultValue: 0,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        full: true,
      },
      {
        name: "sortOrder",
        label: "Display order",
        type: "number",
        defaultValue: 999,
      },
      {
        name: "isAvailable",
        label: "Available",
        type: "checkbox",
        defaultValue: true,
      },
      {
        name: "isActive",
        label: "Visible on client",
        type: "checkbox",
        defaultValue: true,
      },
    ],
  },

  posts: {
    id: "posts",
    title: "Journal posts",
    singular: "journal post",
    description: "Publish store stories, news and new product announcements.",
    api: "posts",
    responseKey: "posts",
    itemKey: "post",
    supportsMedia: true,
    fields: [
      {
        name: "title",
        label: "Post title",
        placeholder: "A new matcha has entered the room",
        required: true,
        full: true,
      },
      {
        name: "content",
        label: "Content",
        placeholder: "Write the full story here.",
        type: "textarea",
        full: true,
      },
      {
        name: "sortOrder",
        label: "Display order",
        type: "number",
        defaultValue: 999,
      },
      {
        name: "isPinned",
        label: "Pin this post",
        type: "checkbox",
        defaultValue: false,
      },
      {
        name: "isPublished",
        label: "Published",
        type: "checkbox",
        defaultValue: true,
      },
    ],
  },

  promotions: {
    id: "promotions",
    title: "Offers",
    singular: "offer",
    description: "Create time-limited offers, codes and homepage promotions.",
    api: "promotions",
    responseKey: "promotions",
    itemKey: "promotion",
    supportsMedia: true,
    fields: [
      {
        name: "title",
        label: "Offer name",
        placeholder: "Summer matcha week",
        required: true,
        full: true,
      },
      {
        name: "discountText",
        label: "Offer label",
        placeholder: "20% off",
      },
      {
        name: "code",
        label: "Promo code",
        placeholder: "TRAP20",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        full: true,
      },
      {
        name: "linkLabel",
        label: "Link label",
        placeholder: "View menu",
      },
      {
        name: "linkUrl",
        label: "Link URL",
        type: "url",
        placeholder: "https://...",
      },
      {
        name: "startDate",
        label: "Start date",
        type: "date",
      },
      {
        name: "endDate",
        label: "End date",
        type: "date",
      },
      {
        name: "sortOrder",
        label: "Display order",
        type: "number",
        defaultValue: 999,
      },
      {
        name: "isFeatured",
        label: "Homepage feature",
        type: "checkbox",
        defaultValue: false,
      },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        defaultValue: true,
      },
    ],
  },

  gallery: {
    id: "gallery",
    title: "Gallery",
    singular: "gallery item",
    description: "Upload images and videos that show the room, drinks and events.",
    api: "gallery",
    responseKey: "gallery",
    itemKey: "galleryItem",
    supportsMedia: true,
    fields: [
      {
        name: "title",
        label: "Title",
        placeholder: "Weekend at TRAP",
        required: true,
        full: true,
      },
      {
        name: "category",
        label: "Gallery category",
        type: "select",
        defaultValue: "space",
        options: [
          { value: "space", label: "Space" },
          { value: "drink", label: "Drinks" },
          { value: "bakery", label: "Bakes" },
          { value: "event", label: "Events" },
          { value: "other", label: "Other" },
        ],
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        full: true,
      },
      {
        name: "sortOrder",
        label: "Display order",
        type: "number",
        defaultValue: 999,
      },
      {
        name: "isFeatured",
        label: "Homepage feature",
        type: "checkbox",
        defaultValue: false,
      },
      {
        name: "isActive",
        label: "Visible on client",
        type: "checkbox",
        defaultValue: true,
      },
    ],
  },
};

export function emptyForm(config) {
  return Object.fromEntries(
    config.fields.map((field) => [
      field.name,
      field.defaultValue ??
        (field.type === "checkbox"
          ? false
          : field.type === "sizes"
            ? []
            : ""),
    ])
  );
}

export const adminUtilityTab = {
  id: "settings",
  label: "Settings",
  icon: Settings2,
};
