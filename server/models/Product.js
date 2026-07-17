import mongoose from "mongoose";
import { mediaSchema } from "./shared.js";
import { slugify } from "../utils/common.js";

const sizeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, default: 0, min: 0 },
    oldPrice: { type: Number, default: 0, min: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, default: "", trim: true, index: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      default: null,
      index: true,
    },
    category: { type: String, default: "", trim: true, index: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, default: 0, min: 0 },
    oldPrice: { type: Number, default: 0, min: 0 },
    sizes: { type: [sizeSchema], default: [] },
    tags: { type: [String], default: [] },
    media: { type: [mediaSchema], default: [] },
    imageUrl: { type: String, default: "", trim: true },
    sortOrder: { type: Number, default: 999, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isAvailable: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

schema.pre("save", function syncFields(next) {
  if (!this.slug || this.isModified("name")) this.slug = slugify(this.name);
  if (!this.imageUrl && this.media?.length) {
    this.imageUrl =
      this.media.find((item) => item.resourceType !== "video")?.url || "";
  }
  next();
});

schema.index({ name: "text", description: "text", category: "text", tags: "text" });

sizeSchema.add({
  translations: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

schema.add({
  isDemo: {
    type: Boolean,
    default: false,
    index: true,
  },
  demoKey: {
    type: String,
    default: "",
    trim: true,
    index: true,
  },
});

export const Product =
  mongoose.models.Product || mongoose.model("Product", schema);
