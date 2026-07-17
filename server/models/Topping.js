import mongoose from "mongoose";
import { mediaSchema } from "./shared.js";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    group: { type: String, default: "Topping", trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, default: 0, min: 0 },
    media: { type: [mediaSchema], default: [] },
    imageUrl: { type: String, default: "", trim: true },
    sortOrder: { type: Number, default: 999 },
    isAvailable: { type: Boolean, default: true },
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

export const Topping =
  mongoose.models.Topping || mongoose.model("Topping", schema);
