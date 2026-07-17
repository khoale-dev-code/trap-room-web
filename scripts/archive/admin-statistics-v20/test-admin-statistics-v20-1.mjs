
import {
  extractApiCollection,
  extractApiEntity,
} from "../src/admin/utils/apiPayload.js";
import {
  getResourceSummary,
} from "../src/admin/features/resource-manager/utils/resource.js";
import {
  getCategorySummary,
} from "../src/admin/features/categories/utils/category.js";

const errors = [];

const payloads = [
  [
    {
      items: [
        { _id: "1" },
        { _id: "2" },
      ],
    },
    2,
    "items",
  ],
  [
    {
      data: {
        extras: [
          { _id: "1" },
        ],
      },
    },
    1,
    "nested extras",
  ],
  [
    {
      result: {
        journalPosts: [
          { _id: "1" },
          { _id: "2" },
          { _id: "3" },
        ],
      },
    },
    3,
    "nested journalPosts",
  ],
  [
    {
      employees: [
        { _id: "1" },
      ],
    },
    1,
    "employees",
  ],
];

for (const [
  payload,
  expected,
  label,
] of payloads) {
  const actual =
    extractApiCollection(
      payload
    ).length;

  if (actual !== expected) {
    errors.push(
      `${label}: expected ${expected}, received ${actual}`
    );
  }
}

const entity =
  extractApiEntity({
    data: {
      item: {
        _id: "abc",
        name: "Saved",
      },
    },
  });

if (entity?._id !== "abc") {
  errors.push(
    "extractApiEntity failed."
  );
}

const resourceSummary =
  getResourceSummary(
    [
      {
        isActive: true,
        isFeatured: true,
      },
      {
        isActive: false,
      },
    ],
    {
      fields: [
        {
          name: "isActive",
          type: "checkbox",
        },
        {
          name: "isFeatured",
          type: "checkbox",
        },
      ],
    }
  );

if (
  resourceSummary.total !== 2 ||
  resourceSummary.active !== 1 ||
  resourceSummary.hidden !== 1 ||
  resourceSummary.featured !== 1
) {
  errors.push(
    "Resource statistics calculation failed."
  );
}

const categorySummary =
  getCategorySummary([
    {
      isActive: true,
    },
    {
      isActive: false,
    },
    {
      isActive: true,
    },
  ]);

if (
  categorySummary.total !== 3 ||
  categorySummary.visible !== 2 ||
  categorySummary.hidden !== 1
) {
  errors.push(
    "Category statistics calculation failed."
  );
}

if (errors.length) {
  console.error(
    "Admin Statistics V20.1 tests failed:\n"
  );

  errors.forEach((error) =>
    console.error(`- ${error}`)
  );

  process.exit(1);
}

console.log(
  "Admin Statistics V20.1 tests passed."
);
