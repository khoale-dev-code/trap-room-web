
import {
  filterResources,
  getFilterOptions,
  getResourceSummary,
  itemToForm,
} from "../src/admin/features/resource-manager/utils/resource.js";

const config = {
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "tags",
      type: "tags",
    },
    {
      name: "isActive",
      type: "checkbox",
    },
    {
      name: "isFeatured",
      type: "checkbox",
    },
  ],
};

const items = [
  {
    _id: "a",
    name: "Coffee",
    tags: ["hot"],
    isActive: true,
    isFeatured: true,
  },
  {
    _id: "b",
    name: "Tea",
    tags: ["cold"],
    isActive: false,
  },
];

const errors = [];

const filtered = filterResources({
  items,
  query: "coffee",
  filter: "all",
});

if (filtered.length !== 1 || filtered[0]._id !== "a") {
  errors.push("filterResources query failed.");
}

const hidden = filterResources({
  items,
  query: "",
  filter: "hidden",
});

if (hidden.length !== 1 || hidden[0]._id !== "b") {
  errors.push("filterResources hidden filter failed.");
}

const summary = getResourceSummary(items, config);

if (
  summary.total !== 2 ||
  summary.active !== 1 ||
  summary.hidden !== 1 ||
  summary.featured !== 1
) {
  errors.push("getResourceSummary failed.");
}

const form = itemToForm(config, items[0]);

if (form.tags !== "hot") {
  errors.push("itemToForm tags conversion failed.");
}

const copy = {
  all: "All",
  visible: "Visible",
  hidden: "Hidden",
  available: "Available",
  unavailable: "Unavailable",
  featured: "Featured",
};

const options = getFilterOptions(config, copy);

if (!options.some(([value]) => value === "featured")) {
  errors.push("getFilterOptions featured option failed.");
}

if (errors.length) {
  console.error("Resource Manager utility tests failed:\n");

  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Resource Manager utility tests passed.");
