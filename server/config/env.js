import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function required(name) {
  const value = String(process.env[name] || "").trim();

  if (!value) {
    throw new Error(`Missing ${name} in the .env file.`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  clientOrigins: String(
    process.env.CLIENT_ORIGIN || "http://localhost:5173"
  )
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  mongodbUri: required("MONGODB_URI"),
  admin: {
    username: required("ADMIN_USERNAME"),
    password: required("ADMIN_PASSWORD"),
    jwtSecret: required("ADMIN_JWT_SECRET"),
    cookieName: "trap_admin_token",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    folder: process.env.CLOUDINARY_FOLDER || "trap-room",
  },
};
