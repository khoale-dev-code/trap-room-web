
import express from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Post } from "../models/Post.js";
import {
  cleanDocumentPayload,
  firstImageUrl,
  normalizeMedia,
  numberValue,
  requiredText,
  text,
} from "../utils/common.js";

const router = express.Router();

function createExcerpt(content = "") {
  return String(content || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

function normalizePostPayload(input = {}) {
  const source = cleanDocumentPayload(input);

  const title = requiredText(
    source.title,
    "Post title",
    200
  );

  const content = text(
    source.content,
    12000
  );

  const media = normalizeMedia(
    source.media
  ).slice(0, 12);

  if (!content && media.length === 0) {
    const error = new Error(
      "Add post content or at least one media file."
    );

    error.statusCode = 400;
    throw error;
  }

  const excerpt =
    text(source.excerpt, 240) ||
    createExcerpt(content);

  const isPublished =
    source.isPublished !== false &&
    source.isPublished !== "false";

  const isPinned =
    source.isPinned === true ||
    source.isPinned === "true";

  return {
    title,
    content,
    excerpt,
    media,
    imageUrl:
      text(source.imageUrl) ||
      firstImageUrl(media),
    sortOrder: numberValue(
      source.sortOrder,
      999,
      1
    ),
    isPinned,
    isPublished,
    isActive: isPublished,
  };
}

function buildFilter(query) {
  const filter = {};

  if (
    query.status === "published" ||
    query.published === "true"
  ) {
    filter.isPublished = {
      $ne: false,
    };
  }

  if (
    query.status === "hidden" ||
    query.status === "draft"
  ) {
    filter.isPublished = false;
  }

  if (
    query.status === "pinned"
  ) {
    filter.isPinned = true;
  }

  if (query.q) {
    const regex = new RegExp(
      String(query.q).trim(),
      "i"
    );

    filter.$or = [
      { title: regex },
      { content: regex },
      { excerpt: regex },
    ];
  }

  return filter;
}

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find(
      buildFilter(req.query)
    )
      .sort({
        isPinned: -1,
        sortOrder: 1,
        createdAt: -1,
      })
      .lean();

    return res.json({ posts });
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/",
  requireAdmin,
  async (req, res, next) => {
    try {
      const post = await Post.create(
        normalizePostPayload(req.body)
      );

      return res
        .status(201)
        .json({ post });
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
      const current = await Post.findById(
        req.params.id
      ).lean();

      if (!current) {
        return res.status(404).json({
          message:
            "Journal post not found.",
        });
      }

      const payload =
        normalizePostPayload({
          ...current,
          ...cleanDocumentPayload(
            req.body
          ),
        });

      const post =
        await Post.findByIdAndUpdate(
          req.params.id,
          payload,
          {
            new: true,
            runValidators: true,
          }
        );

      return res.json({ post });
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
      const post =
        await Post.findByIdAndDelete(
          req.params.id
        );

      if (!post) {
        return res.status(404).json({
          message:
            "Journal post not found.",
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
