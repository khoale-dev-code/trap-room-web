import express from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  booleanValue,
  cleanDocumentPayload,
  firstImageUrl,
  normalizeMedia,
  numberValue,
  requiredText,
  text,
} from "./common.js";

export function createResourceRouter({
  Model,
  responseKey,
  itemKey,
  titleField = "title",
  searchableFields = [],
  booleanFields = [],
  numberFields = ["sortOrder"],
  textFields = [],
  selectFields = {},
  media = true,
  defaults = {},
  beforeClean,
  afterClean,
  listFilter,
  listSort = { sortOrder: 1, createdAt: -1 },
}) {
  const router = express.Router();

  function clean(input = {}, partial = false) {
    const raw = cleanDocumentPayload(input);
    const source = beforeClean ? beforeClean(raw) : raw;
    const next = {};

    if (!partial || Object.hasOwn(source, titleField)) {
      next[titleField] = requiredText(
        source[titleField],
        titleField === "name" ? "Name" : "Title",
        200
      );
    }

    textFields.forEach((field) => {
      if (!partial || Object.hasOwn(source, field)) {
        next[field] = text(source[field] ?? defaults[field], 6000);
      }
    });

    numberFields.forEach((field) => {
      if (!partial || Object.hasOwn(source, field)) {
        next[field] = numberValue(
          source[field],
          defaults[field] ?? (field === "sortOrder" ? 999 : 0),
          field === "sortOrder" ? 1 : 0
        );
      }
    });

    booleanFields.forEach((field) => {
      if (!partial || Object.hasOwn(source, field)) {
        next[field] = booleanValue(
          source[field],
          defaults[field] ?? false
        );
      }
    });

    Object.entries(selectFields).forEach(([field, options]) => {
      if (!partial || Object.hasOwn(source, field)) {
        const value = text(source[field]);
        next[field] = options.includes(value)
          ? value
          : defaults[field] ?? options[0];
      }
    });

    if (media && (!partial || Object.hasOwn(source, "media"))) {
      next.media = normalizeMedia(source.media);
    }

    if (media && Object.hasOwn(source, "imageUrl")) {
      next.imageUrl = text(source.imageUrl);
    }

    if (media && !next.imageUrl && next.media) {
      next.imageUrl = firstImageUrl(next.media);
    }

    return afterClean ? afterClean(next, source, partial) : next;
  }

  router.get("/", async (req, res, next) => {
    try {
      const filter = listFilter ? listFilter(req.query) : {};

      if (req.query.q && searchableFields.length) {
        filter.$or = searchableFields.map((field) => ({
          [field]: { $regex: req.query.q, $options: "i" },
        }));
      }

      const items = await Model.find(filter).sort(listSort).lean();
      res.json({ [responseKey]: items });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", requireAdmin, async (req, res, next) => {
    try {
      const item = await Model.create(clean(req.body));
      res.status(201).json({ [itemKey]: item });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id", requireAdmin, async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(
        req.params.id,
        clean(req.body, true),
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({ message: "Item not found." });
      }

      res.json({ [itemKey]: item });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", requireAdmin, async (req, res, next) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);

      if (!item) {
        return res.status(404).json({ message: "Item not found." });
      }

      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
