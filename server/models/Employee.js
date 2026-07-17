
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    phone: { type: String, default: "", trim: true },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    position: {
      type: String,
      default: "Staff",
      trim: true,
    },
    role: {
      type: String,
      enum: [
        "manager",
        "supervisor",
        "barista",
        "cashier",
        "content",
        "custom",
      ],
      default: "barista",
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 80,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    passwordSalt: {
      type: String,
      required: true,
      select: false,
    },
    permissions: {
      type: [String],
      default: [],
    },
    accountEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
    hireDate: {
      type: String,
      default: "",
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

employeeSchema.methods.toSafeObject = function toSafeObject() {
  const value = this.toObject();
  delete value.passwordHash;
  delete value.passwordSalt;
  return value;
};

employeeSchema.add({
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

export const Employee =
  mongoose.models.Employee ||
  mongoose.model("Employee", employeeSchema);
