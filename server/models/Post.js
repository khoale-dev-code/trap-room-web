import mongoose from "mongoose";
import { mediaSchema } from "./shared.js";

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "", trim: true },
    excerpt: { type: String, default: "", trim: true },
    media: { type: [mediaSchema], default: [] },
    imageUrl: { type: String, default: "", trim: true },
    isPublished: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isPinned: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 999 },
  },
  { timestamps: true }
);

schema.pre("save", function syncPost(next) {
  this.isPublished =
    this.isPublished !== false;
  this.isActive =
    this.isPublished !== false;
  if (!this.excerpt) this.excerpt = String(this.content || "").slice(0, 180);
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

export const Post = mongoose.models.Post || mongoose.model("Post", schema);
