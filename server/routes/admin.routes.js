import express from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Gallery } from "../models/Gallery.js";
import { MenuCategory } from "../models/MenuCategory.js";
import { Post } from "../models/Post.js";
import { Product } from "../models/Product.js";
import { Promotion } from "../models/Promotion.js";
import { Reservation } from "../models/Reservation.js";
import { Topping } from "../models/Topping.js";

const router = express.Router();

router.get("/summary", requireAdmin, async (req, res, next) => {
  try {
    const [
      categories,
      products,
      availableProducts,
      featuredProducts,
      toppings,
      posts,
      publishedPosts,
      promotions,
      activePromotions,
      gallery,
      reservations,
      pendingReservations,
      latestReservations,
    ] = await Promise.all([
      MenuCategory.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ isAvailable: { $ne: false } }),
      Product.countDocuments({ isFeatured: true }),
      Topping.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ isPublished: { $ne: false } }),
      Promotion.countDocuments(),
      Promotion.countDocuments({ isActive: { $ne: false } }),
      Gallery.countDocuments(),
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: "pending" }),
      Reservation.find({}).sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    res.set("Cache-Control", "no-store");
    res.json({
      summary: {
        categories,
        products,
        availableProducts,
        featuredProducts,
        toppings,
        posts,
        publishedPosts,
        promotions,
        activePromotions,
        gallery,
        reservations,
        pendingReservations,
      },
      latestReservations,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
