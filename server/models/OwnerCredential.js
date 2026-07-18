import mongoose from "mongoose";

const ownerCredentialSchema =
  new mongoose.Schema(
    {
      key: {
        type: String,
        required: true,
        unique: true,
        default: "primary-owner",
        trim: true,
      },
      username: {
        type: String,
        required: true,
        trim: true,
      },
      passwordSalt: {
        type: String,
        required: true,
        select: false,
      },
      passwordHash: {
        type: String,
        required: true,
        select: false,
      },
      passwordVersion: {
        type: Number,
        default: 1,
        min: 1,
      },
      changedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

export const OWNER_CREDENTIAL_KEY =
  "primary-owner";

export const OwnerCredential =
  mongoose.models.OwnerCredential ||
  mongoose.model(
    "OwnerCredential",
    ownerCredentialSchema
  );
