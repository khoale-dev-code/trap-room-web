import mongoose from "mongoose";
import { slugify } from "../utils/common.js";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, default: "", trim: true, index: true },
    description: { type: String, default: "", trim: true },
    sortOrder: { type: Number, default: 999, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

schema.pre("save", function syncSlug(next) {
  if (!this.slug || this.isModified("name")) this.slug = slugify(this.name);
  next();
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

export const MenuCategory =
  mongoose.models.MenuCategory || mongoose.model("MenuCategory", schema);
