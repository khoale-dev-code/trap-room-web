
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const requiredFiles = [
  "src/admin/features/menu-items/MenuItemsPage.jsx",
  "src/admin/features/menu-items/copy.js",
  "src/admin/features/menu-items/components/CurrencyInput.jsx",
  "src/admin/features/menu-items/components/MenuItemEditor.jsx",
  "src/admin/features/menu-items/components/MenuItemFilters.jsx",
  "src/admin/features/menu-items/components/MenuItemList.jsx",
  "src/admin/features/menu-items/components/MenuItemCard.jsx",
  "src/admin/features/menu-items/components/MediaEditor.jsx",
  "src/admin/features/menu-items/components/OrderConflictDialog.jsx",
  "src/admin/features/menu-items/components/SizeEditor.jsx",
  "src/admin/features/menu-items/components/TagInput.jsx",
  "src/admin/features/menu-items/components/ToggleCard.jsx",
  "src/admin/features/menu-items/hooks/useFilePreviews.js",
  "src/admin/features/menu-items/hooks/useMenuItemsData.js",
  "src/admin/features/menu-items/services/menuItemsApi.js",
  "src/admin/features/menu-items/utils/currency.js",
  "src/admin/features/menu-items/utils/menuItem.js",
];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    errors.push(`Missing file: ${relativePath}`);
  }
}

const currencyPath = path.join(
  root,
  "src/admin/features/menu-items/utils/currency.js"
);

if (fs.existsSync(currencyPath)) {
  const source = fs.readFileSync(currencyPath, "utf8");

  if (!source.includes("replace(/\\D/g")) {
    errors.push(
      "currency.js does not strip non-digits with /\\D/g."
    );
  }

  if (source.includes("replace(/\\\\D/g")) {
    errors.push(
      "currency.js still contains the broken /\\\\D/g regex."
    );
  }
}

const inputPath = path.join(
  root,
  "src/admin/features/menu-items/components/CurrencyInput.jsx"
);

if (fs.existsSync(inputPath)) {
  const source = fs.readFileSync(inputPath, "utf8");

  for (const expected of [
    "focused",
    "draft",
    "sanitizeVndDigits",
    "inputMode=\"numeric\"",
    "formatVndInput",
  ]) {
    if (!source.includes(expected)) {
      errors.push(`CurrencyInput.jsx is missing: ${expected}`);
    }
  }
}

const servicePath = path.join(
  root,
  "src/admin/features/menu-items/services/menuItemsApi.js"
);

if (fs.existsSync(servicePath)) {
  const source = fs.readFileSync(servicePath, "utf8");

  if (!source.includes('../../../../lib/api.js')) {
    errors.push(
      "menuItemsApi.js has an incorrect api import path."
    );
  }
}

function findManager() {
  const matches = [];

  function walk(directory) {
    if (!fs.existsSync(directory)) return;

    for (const entry of fs.readdirSync(directory, {
      withFileTypes: true,
    })) {
      const absolute = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (entry.name !== "features") {
          walk(absolute);
        }
      } else if (entry.name === "MenuItemsManager.jsx") {
        matches.push(absolute);
      }
    }
  }

  walk(path.join(root, "src/admin"));
  return matches[0];
}

const managerPath = findManager();

if (!managerPath) {
  errors.push("MenuItemsManager.jsx was not found.");
} else {
  const source = fs.readFileSync(managerPath, "utf8");

  if (!source.includes("features/menu-items/MenuItemsPage.jsx")) {
    errors.push(
      "MenuItemsManager.jsx is not a thin feature entry point."
    );
  }

  if (source.split("\n").length > 5) {
    errors.push(
      "MenuItemsManager.jsx is still too large."
    );
  }
}

if (errors.length) {
  console.error("Menu Items Clean V16 check failed:\n");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("Menu Items Clean V16 check passed.");
