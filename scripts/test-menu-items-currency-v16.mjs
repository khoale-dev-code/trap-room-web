
import {
  formatVndInput,
  sanitizeVndDigits,
  toVndNumber,
} from "../src/admin/features/menu-items/utils/currency.js";

const cases = [
  [
    sanitizeVndDigits("25.0000"),
    "250000",
    "typing zero after 25.000",
  ],
  [
    toVndNumber("25.000"),
    25000,
    "formatted VND parsing",
  ],
  [
    toVndNumber("35000"),
    35000,
    "raw digit parsing",
  ],
  [
    formatVndInput(35000),
    "35.000",
    "VND display formatting",
  ],
];

const errors = cases
  .filter(([actual, expected]) => actual !== expected)
  .map(
    ([actual, expected, label]) =>
      `${label}: expected ${expected}, received ${actual}`
  );

if (errors.length) {
  console.error("Currency tests failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Menu item currency tests passed.");
