
import mongoose from "mongoose";

const workShiftSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    title: {
      type: String,
      default: "Store shift",
      trim: true,
    },
    position: {
      type: String,
      default: "General",
      trim: true,
    },
    employeeIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    requiredStaff: {
      type: Number,
      default: 1,
      min: 1,
      max: 20,
    },
    status: {
      type: String,
      enum: ["draft", "published", "completed", "cancelled"],
      default: "published",
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

workShiftSchema.index({
  date: 1,
  startTime: 1,
  endTime: 1,
});

workShiftSchema.add({
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

export const WorkShift =
  mongoose.models.WorkShift ||
  mongoose.model("WorkShift", workShiftSchema);
