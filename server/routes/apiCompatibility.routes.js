
import express from "express";
import mongoose from "mongoose";
import * as authMiddleware from "../middleware/requireAdmin.js";

const router = express.Router();

const requireAdmin =
  authMiddleware.requireAdmin ||
  authMiddleware.default ||
  ((_req, _res, next) => next());

let collectionNameCache = {
  expiresAt: 0,
  names: [],
};

router.get(
  "/menu-items",
  requireAdmin,
  asyncRoute(async (_req, res) => {
    const items = await readCollectionDocuments({
      preferredNames: [
        "menuitems",
        "menu_items",
        "products",
      ],
      pattern: /(menu.*item|product)/i,
    });

    sendNoStore(res);

    res.json({
      ok: true,
      menuItems: items,
      products: items,
      items,
    });
  })
);

router.get(
  "/extras",
  requireAdmin,
  asyncRoute(async (_req, res) => {
    const items = await readCollectionDocuments({
      preferredNames: [
        "extras",
        "toppings",
      ],
      pattern: /(extra|topping)/i,
    });

    sendNoStore(res);

    res.json({
      ok: true,
      extras: items,
      toppings: items,
      items,
    });
  })
);

router.get(
  "/journal-posts",
  requireAdmin,
  asyncRoute(async (_req, res) => {
    const items = await readCollectionDocuments({
      preferredNames: [
        "journalposts",
        "journal_posts",
        "posts",
      ],
      pattern: /(journal.*post|post)/i,
    });

    sendNoStore(res);

    res.json({
      ok: true,
      journalPosts: items,
      posts: items,
      items,
    });
  })
);

/*
 * This route is intentionally mounted before the project's existing
 * /api/products router. It prevents a broken legacy detail handler from
 * returning 500 while preserving all other product endpoints.
 */
router.get(
  "/products/:id",
  asyncRoute(async (req, res, next) => {
    const rawId = String(req.params.id || "").trim();

    if (!rawId) {
      return next();
    }

    const db = getDb();

    const collection = await resolveCollection({
      preferredNames: [
        "products",
        "menuitems",
        "menu_items",
      ],
      pattern: /(product|menu.*item)/i,
    });

    if (!collection) {
      return res.status(404).json({
        message: "Không tìm thấy collection sản phẩm.",
      });
    }

    const queries = [];

    if (mongoose.Types.ObjectId.isValid(rawId)) {
      queries.push({
        _id: new mongoose.Types.ObjectId(rawId),
      });
    }

    queries.push(
      { slug: rawId },
      { id: rawId }
    );

    let product = null;

    for (const query of queries) {
      product = await collection.findOne(query);

      if (product) {
        break;
      }
    }

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm.",
      });
    }

    product = await hydrateProductCategory(
      db,
      product
    );

    sendNoStore(res);

    return res.json({
      ok: true,
      product,
    });
  })
);

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(
      handler(req, res, next)
    ).catch(next);
  };
}

function getDb() {
  const db = mongoose.connection.db;

  if (!db) {
    const error = new Error(
      "MongoDB chưa sẵn sàng."
    );

    error.status = 503;
    throw error;
  }

  return db;
}

async function getCollectionNames() {
  const now = Date.now();

  if (
    collectionNameCache.expiresAt > now &&
    collectionNameCache.names.length
  ) {
    return collectionNameCache.names;
  }

  const db = getDb();

  const records = await db
    .listCollections(
      {},
      { nameOnly: true }
    )
    .toArray();

  const names = records
    .map((record) => record.name)
    .filter(Boolean);

  collectionNameCache = {
    expiresAt: now + 30_000,
    names,
  };

  return names;
}

async function resolveCollection({
  preferredNames,
  pattern,
}) {
  const db = getDb();
  const names = await getCollectionNames();

  const exact = preferredNames.find(
    (preferredName) =>
      names.some(
        (name) =>
          name.toLowerCase() ===
          preferredName.toLowerCase()
      )
  );

  const resolvedName =
    names.find(
      (name) =>
        exact &&
        name.toLowerCase() ===
        exact.toLowerCase()
    ) ||
    names.find((name) => pattern.test(name));

  pattern.lastIndex = 0;

  return resolvedName
    ? db.collection(resolvedName)
    : null;
}

async function readCollectionDocuments({
  preferredNames,
  pattern,
  limit = 500,
}) {
  const collection =
    await resolveCollection({
      preferredNames,
      pattern,
    });

  if (!collection) {
    return [];
  }

  return collection
    .find({})
    .sort({
      updatedAt: -1,
      createdAt: -1,
      sortOrder: 1,
    })
    .limit(limit)
    .toArray();
}

async function hydrateProductCategory(
  db,
  product
) {
  const categoryId =
    product.categoryId ||
    (
      product.category &&
      typeof product.category === "object"
        ? product.category._id
        : null
    );

  if (
    !categoryId ||
    (
      product.category &&
      typeof product.category === "object" &&
      product.category.name
    )
  ) {
    return product;
  }

  const categoryCollection =
    await resolveCollection({
      preferredNames: [
        "menucategories",
        "menu_categories",
        "categories",
      ],
      pattern: /(menu.*categor|categor)/i,
    });

  if (!categoryCollection) {
    return product;
  }

  let normalizedId = categoryId;

  if (
    typeof categoryId === "string" &&
    mongoose.Types.ObjectId.isValid(categoryId)
  ) {
    normalizedId =
      new mongoose.Types.ObjectId(categoryId);
  }

  const category =
    await categoryCollection.findOne({
      _id: normalizedId,
    });

  if (!category) {
    return product;
  }

  return {
    ...product,
    category,
    categoryId: category._id,
  };
}

function sendNoStore(res) {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
}

export default router;
