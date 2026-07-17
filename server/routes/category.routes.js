import express from "express";
import mongoose from "mongoose";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { MenuCategory } from "../models/MenuCategory.js";
import { Product } from "../models/Product.js";
import {
  booleanValue,
  numberValue,
  requiredText,
  slugify,
  text,
} from "../utils/common.js";

const router = express.Router();

function clean(input = {}, partial = false) {
  const next = {};

  if (!partial || Object.hasOwn(input, "name")) {
    next.name = requiredText(input.name, "Category name", 120);
    next.slug = slugify(next.name);
  }

  if (!partial || Object.hasOwn(input, "description")) {
    next.description = text(input.description, 1000);
  }

  if (!partial || Object.hasOwn(input, "sortOrder")) {
    next.sortOrder = numberValue(input.sortOrder, 999, 1);
  }

  if (!partial || Object.hasOwn(input, "isActive")) {
    next.isActive = booleanValue(input.isActive, true);
  }

  return next;
}

router.get("/", async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.active === "true") {
      filter.isActive = { $ne: false };
    }

    if (req.query.q) {
      filter.$or = [
        { name: { $regex: req.query.q, $options: "i" } },
        { description: { $regex: req.query.q, $options: "i" } },
      ];
    }

    const categories = await MenuCategory.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    const counts = await Product.aggregate([
      { $match: { categoryId: { $ne: null } } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      counts.map((item) => [String(item._id), item.count])
    );

    res.json({
      categories: categories.map((category) => ({
        ...category,
        productCount: countMap.get(String(category._id)) || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const category = await MenuCategory.create(clean(req.body));
    res.status(201).json({ category });
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = "A category with this name already exists.";
    }
    next(error);
  }
});

router.patch("/reorder", requireAdmin, async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [];

    if (!ids.length) {
      return res.status(400).json({ message: "No valid category IDs were provided." });
    }

    await MenuCategory.bulkWrite(
      ids.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { sortOrder: index + 1 } },
        },
      }))
    );

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const category = await MenuCategory.findByIdAndUpdate(
      req.params.id,
      clean(req.body, true),
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    if (Object.hasOwn(req.body, "name")) {
      await Product.updateMany(
        { categoryId: category._id },
        { $set: { category: category.name } }
      );
    }

    res.json({ category });
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = "A category with this name already exists.";
    }
    next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments({ categoryId: req.params.id });

    if (productCount > 0) {
      return res.status(409).json({
        message: `This category contains ${productCount} menu item(s). Move them before deleting the category.`,
      });
    }

    const category = await MenuCategory.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
