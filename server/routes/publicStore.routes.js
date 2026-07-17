import express from "express";
import { Gallery } from "../models/Gallery.js";
import { MenuCategory } from "../models/MenuCategory.js";
import { Post } from "../models/Post.js";
import { Product } from "../models/Product.js";
import { Promotion } from "../models/Promotion.js";
import { Shop } from "../models/Shop.js";
import { Topping } from "../models/Topping.js";

const router = express.Router();

async function getShop() {
  let shop = await Shop.findOne({}).lean();
  if (!shop) shop = (await Shop.create({})).toObject();
  return shop;
}

router.get("/", async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");
    const [shop, categories, products, toppings, posts, promotions, gallery] =
      await Promise.all([
        getShop(),
        MenuCategory.find({ isActive: { $ne: false } }).sort({ sortOrder: 1 }).lean(),
        Product.find({ isAvailable: { $ne: false } })
          .populate("categoryId", "name slug")
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean(),
        Topping.find({ isActive: { $ne: false }, isAvailable: { $ne: false } })
          .sort({ sortOrder: 1 })
          .lean(),
        Post.find({
          isPublished: { $ne: false },
          isActive: { $ne: false },
        })
          .sort({ isPinned: -1, sortOrder: 1, createdAt: -1 })
          .lean(),
        Promotion.find({ isActive: { $ne: false } })
          .sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 })
          .lean(),
        Gallery.find({ isActive: { $ne: false } })
          .sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 })
          .lean(),
      ]);

    res.json({
      shop,
      categories,
      products,
      toppings,
      posts,
      promotions,
      gallery,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) { next(error); }
});

export default router;
