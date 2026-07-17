
import express from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Gallery } from "../models/Gallery.js";
import {
  cleanDocumentPayload,
  firstImageUrl,
  normalizeMedia,
  numberValue,
  requiredText,
  text,
} from "../utils/common.js";

const router = express.Router();

const CATEGORIES = [
  "space",
  "drink",
  "bakery",
  "event",
  "other",
];

function normalizeGalleryPayload(input = {}) {
  const source = cleanDocumentPayload(input);

  const title = requiredText(
    source.title,
    "Gallery title",
    180
  );

  const category = CATEGORIES.includes(
    text(source.category)
  )
    ? text(source.category)
    : "other";

  let media = normalizeMedia(
    source.media
  ).slice(0, 12);

  const legacyImageUrl = text(
    source.imageUrl
  );

  if (media.length === 0 && legacyImageUrl) {
    media = normalizeMedia([
      {
        url: legacyImageUrl,
        resourceType: "image",
        alt: title,
        sortOrder: 1,
      },
    ]);
  }

  if (media.length === 0) {
    const error = new Error(
      "Add at least one image or video."
    );

    error.statusCode = 400;
    throw error;
  }

  const isFeatured =
    source.isFeatured === true ||
    source.isFeatured === "true";

  const isActive =
    source.isActive !== false &&
    source.isActive !== "false";

  return {
    title,
    category,
    description: text(
      source.description,
      2000
    ),
    media,
    imageUrl:
      firstImageUrl(media) || "",
    sortOrder: numberValue(
      source.sortOrder,
      999,
      1
    ),
    isFeatured,
    isActive,
  };
}

function buildFilter(query) {
  const filter = {};

  if (query.status === "active") {
    filter.isActive = {
      $ne: false,
    };
  }

  if (query.status === "hidden") {
    filter.isActive = false;
  }

  if (query.status === "featured") {
    filter.isFeatured = true;
  }

  if (
    query.category &&
    CATEGORIES.includes(query.category)
  ) {
    filter.category = query.category;
  }

  if (query.type === "image") {
    filter["media.resourceType"] = {
      $ne: "video",
    };
  }

  if (query.type === "video") {
    filter["media.resourceType"] = "video";
  }

  if (query.q) {
    const regex = new RegExp(
      String(query.q).trim(),
      "i"
    );

    filter.$or = [
      { title: regex },
      { description: regex },
      { category: regex },
      { "media.alt": regex },
      { "media.originalName": regex },
    ];
  }

  return filter;
}

router.get("/", async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    const gallery = await Gallery.find(
      buildFilter(req.query)
    )
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .lean();

    return res.json({ gallery });
  } catch (error) {
    return next(error);
  }
});

router.patch(
  "/reorder",
  requireAdmin,
  async (req, res, next) => {
    try {
      const ids = Array.isArray(req.body?.ids)
        ? req.body.ids.filter(Boolean)
        : [];

      if (ids.length === 0) {
        return res.status(400).json({
          message:
            "Provide the gallery IDs in display order.",
        });
      }

      await Gallery.bulkWrite(
        ids.map((id, index) => ({
          updateOne: {
            filter: { _id: id },
            update: {
              $set: {
                sortOrder: index + 1,
              },
            },
          },
        }))
      );

      const gallery = await Gallery.find({
        _id: {
          $in: ids,
        },
      })
        .sort({
          sortOrder: 1,
          createdAt: -1,
        })
        .lean();

      return res.json({
        ok: true,
        gallery,
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  "/",
  requireAdmin,
  async (req, res, next) => {
    try {
      const galleryItem =
        await Gallery.create(
          normalizeGalleryPayload(
            req.body
          )
        );

      return res
        .status(201)
        .json({ galleryItem });
    } catch (error) {
      return next(error);
    }
  }
);

router.patch(
  "/:id",
  requireAdmin,
  async (req, res, next) => {
    try {
      const current =
        await Gallery.findById(
          req.params.id
        ).lean();

      if (!current) {
        return res.status(404).json({
          message:
            "Gallery item not found.",
        });
      }

      const payload =
        normalizeGalleryPayload({
          ...current,
          ...cleanDocumentPayload(
            req.body
          ),
        });

      const galleryItem =
        await Gallery.findByIdAndUpdate(
          req.params.id,
          payload,
          {
            new: true,
            runValidators: true,
          }
        );

      return res.json({
        galleryItem,
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.delete(
  "/:id",
  requireAdmin,
  async (req, res, next) => {
    try {
      const galleryItem =
        await Gallery.findByIdAndDelete(
          req.params.id
        );

      if (!galleryItem) {
        return res.status(404).json({
          message:
            "Gallery item not found.",
        });
      }

      return res.json({
        ok: true,
        deletedId: req.params.id,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
