
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      default: "",
      trim: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      default: "image",
    },
    format: {
      type: String,
      default: "",
      trim: true,
    },
    width: {
      type: Number,
      default: 0,
      min: 0,
    },
    height: {
      type: Number,
      default: 0,
      min: 0,
    },
    bytes: {
      type: Number,
      default: 0,
      min: 0,
    },
    originalName: {
      type: String,
      default: "",
      trim: true,
    },
    alt: {
      type: String,
      default: "",
      trim: true,
    },
    objectPosition: {
      type: String,
      default: "center center",
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 999,
      min: 1,
    },
  },
  {
    _id: false,
  }
);

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    category: {
      type: String,
      enum: [
        "space",
        "drink",
        "bakery",
        "event",
        "other",
      ],
      default: "space",
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    media: {
      type: [mediaSchema],
      default: [],
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 999,
      min: 1,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

gallerySchema.pre("save", function syncGalleryMedia(next) {
  this.media = [...(this.media || [])]
    .sort(
      (a, b) =>
        Number(a.sortOrder || 999) -
        Number(b.sortOrder || 999)
    )
    .map((item, index) => ({
      ...item.toObject?.(),
      ...(item.toObject ? {} : item),
      sortOrder: index + 1,
    }));

  if (!this.imageUrl) {
    this.imageUrl =
      this.media.find(
        (item) => item.resourceType !== "video"
      )?.url || "";
  }

  next();
});

gallerySchema.add({
  translations: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

gallerySchema.add({
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

export const Gallery =
  mongoose.models.Gallery ||
  mongoose.model("Gallery", gallerySchema);
