
import {
  filterCategories,
  getCategorySummary,
  getNextCategoryOrder,
  moveCategoryInList,
  placeCategoryAtOrder,
} from "../src/admin/features/categories/utils/category.js";

const items = [
  {
    _id: "a",
    name: "Coffee",
    sortOrder: 1,
    isActive: true,
  },
  {
    _id: "b",
    name: "Tea",
    sortOrder: 2,
    isActive: false,
  },
  {
    _id: "c",
    name: "Bakery",
    sortOrder: 3,
    isActive: true,
  },
];

const errors = [];

if (getNextCategoryOrder(items) !== 4) {
  errors.push(
    "getNextCategoryOrder should return 4."
  );
}

const moved = moveCategoryInList(
  items,
  "b",
  -1
);

if (
  moved.map((item) => item._id).join(",") !==
  "b,a,c"
) {
  errors.push(
    "moveCategoryInList failed."
  );
}

const placed = placeCategoryAtOrder(
  items,
  "c",
  1
);

if (
  placed.map((item) => item._id).join(",") !==
  "c,a,b"
) {
  errors.push(
    "placeCategoryAtOrder failed."
  );
}

const hidden = filterCategories({
  items,
  query: "",
  filter: "hidden",
});

if (
  hidden.length !== 1 ||
  hidden[0]._id !== "b"
) {
  errors.push(
    "filterCategories hidden filter failed."
  );
}

const summary =
  getCategorySummary(items);

if (
  summary.total !== 3 ||
  summary.visible !== 2 ||
  summary.hidden !== 1
) {
  errors.push(
    "getCategorySummary failed."
  );
}

if (errors.length) {
  console.error(
    "Categories utility tests failed:\n"
  );

  errors.forEach((error) =>
    console.error(`- ${error}`)
  );

  process.exit(1);
}

console.log(
  "Categories utility tests passed."
);
