
import express from "express";
import mongoose from "mongoose";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { MenuCategory } from "../models/MenuCategory.js";
import { Product } from "../models/Product.js";
import {
  booleanValue,
  cleanDocumentPayload,
  firstImageUrl,
  normalizeMedia,
  normalizeStringArray,
  numberValue,
  requiredText,
  slugify,
  text,
} from "../utils/common.js";

const router = express.Router();

function integerValue(
  value,
  fallback = 0,
  minimum = 0
) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.max(
    minimum,
    Math.round(numeric)
  );
}

function normalizeSizes(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const sizes = value
    .map((size) => ({
      name: text(size?.name, 80),
      price: integerValue(
        size?.price,
        0,
        0
      ),
      oldPrice: integerValue(
        size?.oldPrice,
        0,
        0
      ),
      isDefault: Boolean(
        size?.isDefault
      ),
    }))
    .filter((size) => size.name);

  if (
    sizes.length > 0 &&
    !sizes.some((size) => size.isDefault)
  ) {
    sizes[0].isDefault = true;
  }

  let defaultUsed = false;

  return sizes.map((size) => {
    const isDefault =
      size.isDefault && !defaultUsed;

    if (isDefault) {
      defaultUsed = true;
    }

    return {
      ...size,
      isDefault,
    };
  });
}

async function nextSortOrder() {
  const last = await Product.findOne()
    .sort({
      sortOrder: -1,
      createdAt: -1,
    })
    .select("sortOrder")
    .lean();

  return (
    integerValue(
      last?.sortOrder,
      0,
      0
    ) + 1
  );
}

async function clean(
  input = {},
  partial = false
) {
  const raw = cleanDocumentPayload(
    input
  );
  const next = {};

  if (
    !partial ||
    Object.hasOwn(raw, "name")
  ) {
    next.name = requiredText(
      raw.name,
      "Menu item name",
      160
    );

    next.slug = slugify(next.name);
  }

  if (
    !partial ||
    Object.hasOwn(raw, "description")
  ) {
    next.description = text(
      raw.description,
      4000
    );
  }

  for (const field of [
    "price",
    "oldPrice",
  ]) {
    if (
      !partial ||
      Object.hasOwn(raw, field)
    ) {
      next[field] = integerValue(
        raw[field],
        0,
        0
      );
    }
  }

  if (
    !partial ||
    Object.hasOwn(raw, "sortOrder")
  ) {
    next.sortOrder = integerValue(
      raw.sortOrder,
      await nextSortOrder(),
      1
    );
  }

  if (
    !partial ||
    Object.hasOwn(raw, "tags")
  ) {
    next.tags = [
      ...new Set(
        normalizeStringArray(
          raw.tags
        ).map((tag) =>
          tag
            .replace(/^#+/, "")
            .trim()
        )
      ),
    ].filter(Boolean);
  }

  if (
    !partial ||
    Object.hasOwn(raw, "sizes")
  ) {
    next.sizes = normalizeSizes(
      raw.sizes
    );
  }

  if (
    !partial ||
    Object.hasOwn(raw, "media")
  ) {
    next.media = normalizeMedia(
      raw.media
    );
  }

  if (
    !partial ||
    Object.hasOwn(raw, "isFeatured")
  ) {
    next.isFeatured = booleanValue(
      raw.isFeatured,
      false
    );
  }

  if (
    !partial ||
    Object.hasOwn(raw, "isAvailable")
  ) {
    next.isAvailable = booleanValue(
      raw.isAvailable,
      true
    );
  }

  if (
    !partial ||
    Object.hasOwn(raw, "categoryId") ||
    Object.hasOwn(raw, "category")
  ) {
    if (
      raw.categoryId &&
      mongoose.Types.ObjectId.isValid(
        raw.categoryId
      )
    ) {
      const category =
        await MenuCategory.findById(
          raw.categoryId
        ).lean();

      if (!category) {
        const error = new Error(
          "The selected category no longer exists."
        );

        error.statusCode = 400;
        throw error;
      }

      next.categoryId =
        category._id;

      next.category =
        category.name;
    } else {
      next.categoryId = null;
      next.category = text(
        raw.category,
        120
      );
    }
  }

  if (
    Object.hasOwn(raw, "imageUrl")
  ) {
    next.imageUrl = text(
      raw.imageUrl
    );
  }

  if (
    !next.imageUrl &&
    next.media
  ) {
    next.imageUrl =
      firstImageUrl(next.media);
  }

  return next;
}

function conflictResponse(
  res,
  conflict
) {
  return res.status(409).json({
    message:
      "Another menu item already uses this display order.",
    details: {
      code:
        "SORT_ORDER_CONFLICT",
      conflict: {
        _id: conflict._id,
        name: conflict.name,
        sortOrder:
          conflict.sortOrder,
      },
    },
  });
}

async function findOrderConflict(
  sortOrder,
  excludeId = null
) {
  if (!sortOrder) return null;

  const filter = {
    sortOrder,
  };

  if (excludeId) {
    filter._id = {
      $ne: excludeId,
    };
  }

  return Product.findOne(filter)
    .select(
      "name sortOrder category price"
    )
    .lean();
}

async function populatedProduct(id) {
  return Product.findById(id)
    .populate(
      "categoryId",
      "name slug isActive sortOrder"
    )
    .lean();
}

async function compactSortOrders() {
  const products = await Product.find()
    .sort({
      sortOrder: 1,
      createdAt: 1,
    })
    .select("_id")
    .lean();

  if (products.length === 0) {
    return;
  }

  await Product.bulkWrite(
    products.map(
      (product, index) => ({
        updateOne: {
          filter: {
            _id: product._id,
          },
          update: {
            $set: {
              sortOrder: index + 1,
            },
          },
        },
      })
    )
  );
}

router.get(
  "/",
  async (req, res, next) => {
    try {
      const filter = {};

      if (
        req.query.status ===
          "available" ||
        req.query.available ===
          "true"
      ) {
        filter.isAvailable = {
          $ne: false,
        };
      }

      if (
        req.query.status ===
        "unavailable"
      ) {
        filter.isAvailable = false;
      }

      if (
        req.query.status ===
          "featured" ||
        req.query.featured ===
          "true"
      ) {
        filter.isFeatured = true;
      }

      if (
        req.query.categoryId &&
        mongoose.Types.ObjectId.isValid(
          req.query.categoryId
        )
      ) {
        filter.categoryId =
          req.query.categoryId;
      }

      if (req.query.q) {
        filter.$or = [
          {
            name: {
              $regex: req.query.q,
              $options: "i",
            },
          },
          {
            description: {
              $regex: req.query.q,
              $options: "i",
            },
          },
          {
            category: {
              $regex: req.query.q,
              $options: "i",
            },
          },
          {
            tags: {
              $regex: req.query.q,
              $options: "i",
            },
          },
        ];
      }

      const products =
        await Product.find(filter)
          .populate(
            "categoryId",
            "name slug isActive sortOrder"
          )
          .sort({
            sortOrder: 1,
            createdAt: -1,
          })
          .lean();

      return res.json({
        products,
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  "/tags",
  async (req, res, next) => {
    try {
      const values =
        await Product.distinct(
          "tags"
        );

      const tags = [
        ...new Set(
          values
            .map((tag) =>
              String(tag || "").trim()
            )
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        a.localeCompare(b, "vi", {
          sensitivity: "base",
        })
      );

      return res.json({ tags });
    } catch (error) {
      return next(error);
    }
  }
);

router.patch(
  "/reorder",
  requireAdmin,
  async (req, res, next) => {
    try {
      const ids = Array.isArray(
        req.body?.ids
      )
        ? req.body.ids.filter((id) =>
            mongoose.Types.ObjectId.isValid(
              id
            )
          )
        : [];

      if (!ids.length) {
        return res.status(400).json({
          message:
            "No valid menu item IDs were provided.",
        });
      }

      await Product.bulkWrite(
        ids.map((id, index) => ({
          updateOne: {
            filter: { _id: id },
            update: {
              $set: {
                sortOrder:
                  index + 1,
              },
            },
          },
        }))
      );

      const products =
        await Product.find({
          _id: {
            $in: ids,
          },
        })
          .populate(
            "categoryId",
            "name slug isActive sortOrder"
          )
          .sort({
            sortOrder: 1,
          })
          .lean();

      return res.json({
        ok: true,
        products,
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  "/:id",
  async (req, res, next) => {
    try {
      const query =
        mongoose.Types.ObjectId.isValid(
          req.params.id
        )
          ? {
              _id: req.params.id,
            }
          : {
              slug: req.params.id,
            };

      const product =
        await Product.findOne(query)
          .populate(
            "categoryId",
            "name slug isActive sortOrder"
          )
          .lean();

      if (!product) {
        return res.status(404).json({
          message:
            "Menu item not found.",
        });
      }

      return res.json({ product });
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
      const payload =
        await clean(req.body);

      const conflict =
        await findOrderConflict(
          payload.sortOrder
        );

      if (conflict) {
        if (
          req.body
            ?.orderConflictMode !==
          "shift"
        ) {
          return conflictResponse(
            res,
            conflict
          );
        }

        await Product.updateMany(
          {
            sortOrder: {
              $gte:
                payload.sortOrder,
            },
          },
          {
            $inc: {
              sortOrder: 1,
            },
          }
        );
      }

      const created =
        await Product.create(
          payload
        );

      const product =
        await populatedProduct(
          created._id
        );

      return res
        .status(201)
        .json({ product });
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
        await Product.findById(
          req.params.id
        ).lean();

      if (!current) {
        return res.status(404).json({
          message:
            "Menu item not found.",
        });
      }

      const payload =
        await clean(
          req.body,
          true
        );

      if (
        Object.hasOwn(
          payload,
          "sortOrder"
        )
      ) {
        const conflict =
          await findOrderConflict(
            payload.sortOrder,
            current._id
          );

        if (conflict) {
          const swapWithId =
            req.body?.swapWithId;

          if (
            !swapWithId ||
            String(swapWithId) !==
              String(conflict._id)
          ) {
            return conflictResponse(
              res,
              conflict
            );
          }

          await Product.bulkWrite([
            {
              updateOne: {
                filter: {
                  _id: conflict._id,
                },
                update: {
                  $set: {
                    sortOrder:
                      integerValue(
                        current.sortOrder,
                        1,
                        1
                      ),
                  },
                },
              },
            },
            {
              updateOne: {
                filter: {
                  _id: current._id,
                },
                update: {
                  $set: payload,
                },
              },
            },
          ]);

          const product =
            await populatedProduct(
              current._id
            );

          return res.json({
            product,
            swappedWith: {
              _id: conflict._id,
              name: conflict.name,
              sortOrder:
                integerValue(
                  current.sortOrder,
                  1,
                  1
                ),
            },
          });
        }
      }

      const updated =
        await Product.findByIdAndUpdate(
          current._id,
          payload,
          {
            new: true,
            runValidators: true,
          }
        );

      const product =
        await populatedProduct(
          updated._id
        );

      return res.json({
        product,
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
      const product =
        await Product.findByIdAndDelete(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Menu item not found.",
        });
      }

      await compactSortOrders();

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
