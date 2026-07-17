
import express from "express";
import {
  existsSync,
} from "node:fs";
import {
  fileURLToPath,
} from "node:url";
import mongoose from "mongoose";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  requirePermission,
} from "../security/staffPermissions.js";

const router = express.Router();

const definitions = [
  {
    id: "shop",
    label: "Store settings",
    modelPath: "../models/Shop.js",
    exportName: "Shop",
    sort: {
      updatedAt: -1,
    },
    fields: [
      {
        key: "name",
        label: "Store name",
        required: true,
      },
      {
        key: "tagline",
        label: "Tagline",
      },
      {
        key: "description",
        label: "Description",
        long: true,
      },
      {
        key: "address",
        label: "Address",
        long: true,
      },
      {
        key: "openingHours",
        label: "Opening-hours note",
        long: true,
      },
      {
        key: "note",
        label: "Store note",
        long: true,
      },
    ],
  },
  {
    id: "categories",
    label: "Categories",
    modelPath: "../models/MenuCategory.js",
    exportName: "MenuCategory",
    sort: {
      sortOrder: 1,
      name: 1,
    },
    fields: [
      {
        key: "name",
        label: "Category name",
        required: true,
      },
      {
        key: "description",
        label: "Description",
        long: true,
      },
    ],
  },
  {
    id: "products",
    label: "Menu items",
    modelPath: "../models/Product.js",
    exportName: "Product",
    sort: {
      sortOrder: 1,
      name: 1,
    },
    fields: [
      {
        key: "name",
        label: "Item name",
        required: true,
      },
      {
        key: "description",
        label: "Description",
        long: true,
      },
      {
        key: "category",
        label: "Category label",
      },
    ],
  },
  {
    id: "toppings",
    label: "Extras",
    modelPath: "../models/Topping.js",
    exportName: "Topping",
    sort: {
      sortOrder: 1,
      name: 1,
    },
    fields: [
      {
        key: "name",
        label: "Extra name",
        required: true,
      },
      {
        key: "group",
        label: "Group",
      },
      {
        key: "description",
        label: "Description",
        long: true,
      },
    ],
  },
  {
    id: "posts",
    label: "Journal",
    modelPath: "../models/Post.js",
    exportName: "Post",
    sort: {
      sortOrder: 1,
      updatedAt: -1,
    },
    fields: [
      {
        key: "title",
        label: "Post title",
        required: true,
      },
      {
        key: "excerpt",
        label: "Excerpt",
        long: true,
      },
      {
        key: "content",
        label: "Article content",
        long: true,
      },
    ],
  },
  {
    id: "promotions",
    label: "Offers",
    modelPath: "../models/Promotion.js",
    exportName: "Promotion",
    sort: {
      sortOrder: 1,
      updatedAt: -1,
    },
    fields: [
      {
        key: "title",
        label: "Offer title",
        required: true,
      },
      {
        key: "discountText",
        label: "Discount label",
      },
      {
        key: "description",
        label: "Description",
        long: true,
      },
      {
        key: "linkLabel",
        label: "Action label",
      },
    ],
  },
  {
    id: "gallery",
    label: "Gallery",
    modelPath: "../models/Gallery.js",
    exportName: "Gallery",
    sort: {
      sortOrder: 1,
      updatedAt: -1,
    },
    fields: [
      {
        key: "title",
        label: "Gallery title",
        required: true,
      },
      {
        key: "description",
        label: "Description",
        long: true,
      },
    ],
  },
];

const registry =
  new Map();

for (const definition of definitions) {
  const modelUrl =
    new URL(
      definition.modelPath,
      import.meta.url
    );

  if (
    !existsSync(
      fileURLToPath(
        modelUrl
      )
    )
  ) {
    continue;
  }

  const module =
    await import(
      modelUrl.href
    );

  const Model =
    module[
      definition.exportName
    ] ||
    module.default;

  if (!Model) {
    continue;
  }

  registry.set(
    definition.id,
    {
      ...definition,
      Model,
    }
  );
}

router.use(
  requireAdmin,
  requirePermission(
    "translations.manage"
  )
);

router.get(
  "/summary",
  async (req, res, next) => {
    try {
      const resources = [];

      for (
        const definition of
        registry.values()
      ) {
        const documents =
          await definition.Model
            .find({})
            .select(
              createProjection(
                definition
              )
            )
            .lean();

        const items =
          documents.map(
            (document) =>
              serializeDocument(
                definition,
                document
              )
          );

        const summary =
          summarizeItems(
            items
          );

        resources.push({
          id:
            definition.id,
          label:
            definition.label,
          fields:
            definition.fields,
          ...summary,
        });
      }

      const total =
        resources.reduce(
          (sum, resource) =>
            sum +
            resource.total,
          0
        );

      const complete =
        resources.reduce(
          (sum, resource) =>
            sum +
            resource.complete,
          0
        );

      const translatedFields =
        resources.reduce(
          (sum, resource) =>
            sum +
            resource.translatedFields,
          0
        );

      const expectedFields =
        resources.reduce(
          (sum, resource) =>
            sum +
            resource.expectedFields,
          0
        );

      res.set(
        "Cache-Control",
        "no-store"
      );

      return res.json({
        resources,
        totals: {
          total,
          complete,
          incomplete:
            Math.max(
              0,
              total -
                complete
            ),
          translatedFields,
          expectedFields,
          completion:
            expectedFields
              ? Math.round(
                  (
                    translatedFields /
                    expectedFields
                  ) *
                    100
                )
              : 100,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  "/:resource",
  async (req, res, next) => {
    try {
      const definition =
        getDefinition(
          req.params.resource
        );

      const documents =
        await definition.Model
          .find({})
          .select(
            createProjection(
              definition
            )
          )
          .sort(
            definition.sort ||
              {
                updatedAt: -1,
              }
          )
          .limit(1000)
          .lean();

      const keyword =
        String(
          req.query.q || ""
        )
          .trim()
          .toLowerCase();

      const requestedStatus =
        String(
          req.query.status ||
            "all"
        ).toLowerCase();

      let items =
        documents.map(
          (document) =>
            serializeDocument(
              definition,
              document
            )
        );

      if (keyword) {
        items =
          items.filter(
            (item) =>
              [
                item.title,
                ...Object.values(
                  item.source
                ),
                ...Object.values(
                  item.translation
                ),
              ]
                .join(" ")
                .toLowerCase()
                .includes(
                  keyword
                )
          );
      }

      if (
        requestedStatus !==
        "all"
      ) {
        items =
          items.filter(
            (item) =>
              item.status ===
              requestedStatus
          );
      }

      res.set(
        "Cache-Control",
        "no-store"
      );

      return res.json({
        resource: {
          id:
            definition.id,
          label:
            definition.label,
          fields:
            definition.fields,
        },
        items,
        summary:
          summarizeItems(
            items
          ),
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.patch(
  "/:resource/:id",
  async (req, res, next) => {
    try {
      const definition =
        getDefinition(
          req.params.resource
        );

      if (
        !mongoose.Types.ObjectId
          .isValid(
            req.params.id
          )
      ) {
        return res
          .status(400)
          .json({
            message:
              "ID nội dung không hợp lệ.",
          });
      }

      const input =
        req.body?.translation;

      if (
        !input ||
        typeof input !==
          "object" ||
        Array.isArray(input)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Dữ liệu bản dịch không hợp lệ.",
          });
      }

      const updates = {};

      for (
        const field of
        definition.fields
      ) {
        if (
          !Object.hasOwn(
            input,
            field.key
          )
        ) {
          continue;
        }

        updates[
          `translations.vi.${field.key}`
        ] =
          normalizeValue(
            input[
              field.key
            ]
          );
      }

      if (
        !Object.keys(
          updates
        ).length
      ) {
        return res
          .status(400)
          .json({
            message:
              "Không có trường bản dịch nào để cập nhật.",
          });
      }

      const document =
        await definition.Model
          .findByIdAndUpdate(
            req.params.id,
            {
              $set: updates,
            },
            {
              new: true,
              runValidators:
                true,
            }
          )
          .select(
            createProjection(
              definition
            )
          )
          .lean();

      if (!document) {
        return res
          .status(404)
          .json({
            message:
              "Không tìm thấy nội dung cần dịch.",
          });
      }

      return res.json({
        item:
          serializeDocument(
            definition,
            document
          ),
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  "/:resource/copy-source",
  async (req, res, next) => {
    try {
      const definition =
        getDefinition(
          req.params.resource
        );

      const ids =
        Array.isArray(
          req.body?.ids
        )
          ? [
              ...new Set(
                req.body.ids
                  .map(String)
                  .filter(
                    (id) =>
                      mongoose.Types.ObjectId
                        .isValid(
                          id
                        )
                  )
              ),
            ]
          : [];

      if (!ids.length) {
        return res
          .status(400)
          .json({
            message:
              "Hãy chọn ít nhất một nội dung.",
          });
      }

      const documents =
        await definition.Model
          .find({
            _id: {
              $in: ids,
            },
          })
          .select(
            createProjection(
              definition
            )
          )
          .lean();

      let updated = 0;

      for (
        const document of
        documents
      ) {
        const set = {};

        for (
          const field of
          definition.fields
        ) {
          const current =
            normalizeValue(
              document
                ?.translations
                ?.vi
                ?.[field.key]
            );

          const source =
            normalizeValue(
              document[
                field.key
              ]
            );

          if (
            !current &&
            source
          ) {
            set[
              `translations.vi.${field.key}`
            ] = source;
          }
        }

        if (
          Object.keys(set)
            .length
        ) {
          await definition.Model
            .updateOne(
              {
                _id:
                  document._id,
              },
              {
                $set: set,
              }
            );

          updated += 1;
        }
      }

      return res.json({
        ok: true,
        updated,
        warning:
          "Source text was copied as a placeholder. It still needs a real Vietnamese translation.",
      });
    } catch (error) {
      return next(error);
    }
  }
);

function getDefinition(
  resource
) {
  const definition =
    registry.get(resource);

  if (!definition) {
    const error =
      new Error(
        "Nhóm nội dung chuyển ngữ không tồn tại."
      );

    error.statusCode = 404;
    throw error;
  }

  return definition;
}

function createProjection(
  definition
) {
  const projection = {
    translations: 1,
    updatedAt: 1,
    createdAt: 1,
    sortOrder: 1,
    isActive: 1,
    isAvailable: 1,
    isPublished: 1,
  };

  for (
    const field of
    definition.fields
  ) {
    projection[
      field.key
    ] = 1;
  }

  return projection;
}

function serializeDocument(
  definition,
  document
) {
  const source = {};
  const translation = {};
  const relevantFields = [];

  for (
    const field of
    definition.fields
  ) {
    const sourceValue =
      normalizeValue(
        document[
          field.key
        ]
      );

    const translationValue =
      normalizeValue(
        document
          ?.translations
          ?.vi
          ?.[field.key]
      );

    source[field.key] =
      sourceValue;

    translation[field.key] =
      translationValue;

    if (
      field.required ||
      sourceValue
    ) {
      relevantFields.push(
        field.key
      );
    }
  }

  const expectedFields =
    relevantFields.length;

  const translatedFields =
    relevantFields.filter(
      (key) =>
        Boolean(
          translation[key]
        )
    ).length;

  const completion =
    expectedFields
      ? Math.round(
          (
            translatedFields /
            expectedFields
          ) *
            100
        )
      : 100;

  const status =
    completion >= 100
      ? "complete"
      : translatedFields > 0
        ? "partial"
        : "missing";

  const titleField =
    definition.fields.find(
      (field) =>
        field.required
    ) ||
    definition.fields[0];

  return {
    id:
      String(
        document._id
      ),
    title:
      source[
        titleField.key
      ] ||
      `${definition.label} item`,
    source,
    translation,
    relevantFields,
    expectedFields,
    translatedFields,
    completion,
    status,
    updatedAt:
      document.updatedAt ||
      null,
    state: {
      isActive:
        document.isActive,
      isAvailable:
        document.isAvailable,
      isPublished:
        document.isPublished,
    },
  };
}

function summarizeItems(
  items
) {
  const complete =
    items.filter(
      (item) =>
        item.status ===
        "complete"
    ).length;

  const partial =
    items.filter(
      (item) =>
        item.status ===
        "partial"
    ).length;

  const missing =
    items.filter(
      (item) =>
        item.status ===
        "missing"
    ).length;

  const translatedFields =
    items.reduce(
      (sum, item) =>
        sum +
        item.translatedFields,
      0
    );

  const expectedFields =
    items.reduce(
      (sum, item) =>
        sum +
        item.expectedFields,
      0
    );

  return {
    total:
      items.length,
    complete,
    partial,
    missing,
    translatedFields,
    expectedFields,
    completion:
      expectedFields
        ? Math.round(
            (
              translatedFields /
              expectedFields
            ) *
              100
          )
        : 100,
  };
}

function normalizeValue(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value ===
    "string"
  ) {
    return value.trim();
  }

  if (
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return String(value);
  }

  return "";
}

export default router;
