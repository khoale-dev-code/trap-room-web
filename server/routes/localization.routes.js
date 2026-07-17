
import express from "express";
import mongoose from "mongoose";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

const RESOURCE_CONFIG = {
  shop: {
    models: ["Shop"],
    fields: [
      "name",
      "tagline",
      "description",
      "note",
      "address",
      "openingHours",
    ],
    single: true,
  },
  categories: {
    models: ["Category", "MenuCategory"],
    fields: ["name", "description"],
  },
  products: {
    models: ["Product"],
    fields: ["name", "description", "category"],
  },
  toppings: {
    models: ["Topping"],
    fields: ["name", "group", "description"],
  },
  posts: {
    models: ["Post"],
    fields: ["title", "excerpt", "content"],
  },
  promotions: {
    models: ["Promotion"],
    fields: [
      "title",
      "discountText",
      "description",
      "linkLabel",
    ],
  },
  gallery: {
    models: ["Gallery"],
    fields: ["title", "description"],
  },
};

function getResource(resourceName) {
  const config = RESOURCE_CONFIG[resourceName];

  if (!config) {
    const error = new Error(
      "Unsupported translation resource."
    );

    error.statusCode = 404;
    throw error;
  }

  const Model = config.models
    .map((modelName) => mongoose.models[modelName])
    .find(Boolean);

  if (!Model) {
    const error = new Error(
      `The ${resourceName} model is not registered.`
    );

    error.statusCode = 500;
    throw error;
  }

  return {
    config,
    Model,
  };
}

function normalizeLanguage(value) {
  const language = String(value || "")
    .toLowerCase()
    .split("-")[0];

  if (!["en", "vi"].includes(language)) {
    const error = new Error(
      "Language must be en or vi."
    );

    error.statusCode = 400;
    throw error;
  }

  return language;
}

function sanitizeValues(values, allowedFields) {
  const source =
    values && typeof values === "object"
      ? values
      : {};

  return Object.fromEntries(
    allowedFields.map((field) => [
      field,
      typeof source[field] === "string"
        ? source[field].trim()
        : "",
    ])
  );
}

router.get(
  "/:resource",
  requireAdmin,
  async (req, res, next) => {
    try {
      const { config, Model } = getResource(
        req.params.resource
      );

      const query = Model.find();

      if (config.single) {
        const item = await query
          .sort({ createdAt: 1 })
          .lean()
          .then((items) => items[0] || null);

        return res.json({
          items: item ? [item] : [],
          fields: config.fields,
        });
      }

      const items = await query
        .sort({
          sortOrder: 1,
          createdAt: -1,
        })
        .lean();

      return res.json({
        items,
        fields: config.fields,
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.patch(
  "/:resource/:id",
  requireAdmin,
  async (req, res, next) => {
    try {
      const { config, Model } = getResource(
        req.params.resource
      );

      const language = normalizeLanguage(
        req.body?.language
      );

      const values = sanitizeValues(
        req.body?.values,
        config.fields
      );

      const setPayload = Object.fromEntries(
        Object.entries(values).map(([field, value]) => [
          `translations.${language}.${field}`,
          value,
        ])
      );

      const item = await Model.findByIdAndUpdate(
        req.params.id,
        {
          $set: setPayload,
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

      if (!item) {
        return res.status(404).json({
          message: "Translation item not found.",
        });
      }

      return res.json({
        ok: true,
        item,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
