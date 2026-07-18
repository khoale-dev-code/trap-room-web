import mongoose from "mongoose";

const heroMediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, default: "", trim: true },
    resourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      default: "image",
    },
    format: { type: String, default: "", trim: true },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    bytes: { type: Number, default: 0 },
    originalName: { type: String, default: "", trim: true },
    alt: { type: String, default: "", trim: true },
    objectPosition: { type: String, default: "center center", trim: true },
    sortOrder: { type: Number, default: 999 },
  },
  { _id: false }
);

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, default: "TRAP Room", trim: true },
    tagline: {
      type: String,
      default: "COFFEE · MATCHA · HOMEBAKED",
      trim: true,
    },
    description: { type: String, default: "", trim: true },
    note: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    openingHours: { type: String, default: "", trim: true },
    instagramUrl: {
      type: String,
      default: "https://www.instagram.com/trapart.room/",
      trim: true,
    },
    googleMapsUrl: { type: String, default: "", trim: true },
    googleMapsEmbedUrl: { type: String, default: "", trim: true },
    logoUrl: { type: String, default: "/trap-logo.png", trim: true },
    faviconUrl: {
      type: String,
      default: "",
      trim: true,
    },
    coverImageUrl: { type: String, default: "", trim: true },
    heroImages: { type: [heroMediaSchema], default: [] },
  },
  { timestamps: true }
);

shopSchema.add({
  translations: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

shopSchema.add({
  openingHoursSchedule: {
    timezone: {
      type: String,
      default: "Asia/Ho_Chi_Minh",
      trim: true,
    },
    weekdays: {
      label: {
        type: String,
        default: "Mon - Fri",
        trim: true,
      },
      open: {
        type: String,
        default: "07:30",
        trim: true,
      },
      close: {
        type: String,
        default: "20:30",
        trim: true,
      },
      closed: {
        type: Boolean,
        default: false,
      },
    },
    weekend: {
      label: {
        type: String,
        default: "Sat - Sun",
        trim: true,
      },
      open: {
        type: String,
        default: "07:30",
        trim: true,
      },
      close: {
        type: String,
        default: "21:30",
        trim: true,
      },
      closed: {
        type: Boolean,
        default: false,
      },
    },
  },
});

heroMediaSchema.add({
  homeHeroImageUrl: {
    type: String,
    default: "",
    trim: true,
  },
  ourStoryImageUrl: {
    type: String,
    default: "",
    trim: true,
  },
  storyImageUrl: {
    type: String,
    default: "",
    trim: true,
  },
  homeHeroObjectPosition: {
    type: String,
    default: "center center",
    trim: true,
  },
  ourStoryObjectPosition: {
    type: String,
    default: "center center",
    trim: true,
  },
  homepageMediaConfigured: {
    type: Boolean,
    default: false,
  },
});

export const Shop = mongoose.models.Shop || mongoose.model("Shop", shopSchema);
