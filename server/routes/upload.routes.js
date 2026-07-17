import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import {
  assertCloudinaryReady,
  cloudinary,
} from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 40 * 1024 * 1024,
    files: 12,
  },
  fileFilter(req, file, callback) {
    const allowed =
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/");

    callback(
      allowed
        ? null
        : new Error("Only image and video files are supported."),
      allowed
    );
  },
});

function uploadOne(file) {
  const resourceType = file.mimetype.startsWith("video/")
    ? "video"
    : "image";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinary.folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          originalName: file.originalname,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

router.post(
  "/",
  requireAdmin,
  upload.array("files", 12),
  async (req, res, next) => {
    try {
      assertCloudinaryReady();

      if (!req.files?.length) {
        return res.status(400).json({
          message: "No files were selected for upload.",
        });
      }

      const media = await Promise.all(
        req.files.map(uploadOne)
      );

      res.status(201).json({ media });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
