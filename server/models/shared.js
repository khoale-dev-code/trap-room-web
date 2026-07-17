import mongoose from "mongoose";

export const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, default: "", trim: true },
    resourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      default: "image",
    },
    originalName: { type: String, default: "", trim: true },
    alt: { type: String, default: "", trim: true },
    sortOrder: { type: Number, default: 999 },
  },
  { _id: false }
);
