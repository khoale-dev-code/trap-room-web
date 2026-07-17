import mongoose from "mongoose";
import { mediaSchema } from "./shared.js";

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    code: { type: String, default: "", trim: true },
    discountText: { type: String, default: "", trim: true },
    startDate: { type: String, default: "", trim: true },
    endDate: { type: String, default: "", trim: true },
    media: { type: [mediaSchema], default: [] },
    imageUrl: { type: String, default: "", trim: true },
    linkLabel: { type: String, default: "", trim: true },
    linkUrl: { type: String, default: "", trim: true },
    sortOrder: { type: Number, default: 999 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.pre("save", function syncImage(next) {
  if (!this.imageUrl && this.media?.length) {
    this.imageUrl =
      this.media.find((item) => item.resourceType !== "video")?.url || "";
  }
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

export const Promotion =
  mongoose.models.Promotion || mongoose.model("Promotion", schema);
