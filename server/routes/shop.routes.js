import express from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Shop } from "../models/Shop.js";
import {
  normalizeMedia,
  optionalUrl,
  requiredText,
  text,
} from "../utils/common.js";

const router = express.Router();

async function getOrCreateShop() {
  let shop = await Shop.findOne({});
  if (!shop) shop = await Shop.create({});
  return shop;
}

function cleanShopPayload(input = {}) {
  const heroImages = normalizeMedia(input.heroImages).map((item, index) => ({
    ...item,
    alt: text(item.alt) || text(input.name) || "TRAP Room",
    objectPosition: text(item.objectPosition) || "center center",
    sortOrder: index + 1,
  }));

  return {
    name: requiredText(input.name || "TRAP Room", "Store name", 120),
    tagline: text(input.tagline, 180),
    description: text(input.description, 3000),
    note: text(input.note, 3000),
    phone: text(input.phone, 60),
    address: text(input.address, 500),
    openingHours: text(input.openingHours, 500),
    instagramUrl: optionalUrl(input.instagramUrl, "Instagram URL"),
    googleMapsUrl: optionalUrl(input.googleMapsUrl, "Google Maps URL"),
    googleMapsEmbedUrl: optionalUrl(
      input.googleMapsEmbedUrl,
      "Google Maps Embed URL"
    ),
    logoUrl: text(input.logoUrl) || "/trap-logo.png",
    coverImageUrl: text(input.coverImageUrl),
    heroImages,
  };
}

router.get("/", async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    const shop = await getOrCreateShop();
    res.json({ shop });
  } catch (error) {
    next(error);
  }
});

router.patch("/", requireAdmin, async (req, res, next) => {
  try {
    const current = await getOrCreateShop();
    const shop = await Shop.findByIdAndUpdate(
      current._id,
      cleanShopPayload(req.body),
      { new: true, runValidators: true }
    );

    res.set("Cache-Control", "no-store");
    res.json({ shop });
  } catch (error) {
    next(error);
  }
});

export default router;
