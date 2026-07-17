
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const requiredFiles = [
  "src/admin/features/categories/CategoriesPage.jsx",
  "src/admin/features/categories/copy.js",
  "src/admin/features/categories/index.js",
  "src/admin/features/categories/components/CategoryCard.jsx",
  "src/admin/features/categories/components/CategoryEditor.jsx",
  "src/admin/features/categories/components/CategoryFilters.jsx",
  "src/admin/features/categories/components/CategoryList.jsx",
  "src/admin/features/categories/components/VisibilityToggle.jsx",
  "src/admin/features/categories/hooks/useCategoriesData.js",
  "src/admin/features/categories/hooks/useMobileEditorLock.js",
  "src/admin/features/categories/services/categoriesApi.js",
  "src/admin/features/categories/utils/category.js",
];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    errors.push(
      `Missing file: ${relativePath}`
    );
  }
}

const servicePath = path.join(
  root,
  "src/admin/features/categories/services/categoriesApi.js"
);

if (fs.existsSync(servicePath)) {
  const source = fs.readFileSync(
    servicePath,
    "utf8"
  );

  if (
    !source.includes(
      '../../../../lib/api.js'
    )
  ) {
    errors.push(
      "categoriesApi.js has an incorrect api import path."
    );
  }
}

const editorPath = path.join(
  root,
  "src/admin/features/categories/components/CategoryEditor.jsx"
);

if (fs.existsSync(editorPath)) {
  const source = fs.readFileSync(
    editorPath,
    "utf8"
  );

  for (const expected of [
    "onSubmit={submit}",
    "onClick={clickSave}",
    "onSave();",
    "92dvh",
    "safe-area-inset-bottom",
    "xl:sticky",
  ]) {
    if (!source.includes(expected)) {
      errors.push(
        `CategoryEditor.jsx is missing: ${expected}`
      );
    }
  }
}

function findManager() {
  const matches = [];

  function walk(directory) {
    if (!fs.existsSync(directory)) {
      return;
    }

    for (const entry of fs.readdirSync(directory, {
      withFileTypes: true,
    })) {
      const absolute = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (entry.name !== "features") {
          walk(absolute);
        }

        continue;
      }

      if (entry.name === "CategoriesManager.jsx") {
        matches.push(absolute);
      }
    }
  }

  walk(path.join(root, "src/admin"));
  return matches[0];
}

const managerPath = findManager();

if (!managerPath) {
  errors.push(
    "CategoriesManager.jsx was not found."
  );
} else {
  const source = fs.readFileSync(
    managerPath,
    "utf8"
  );

  if (
    !source.includes(
      "features/categories/CategoriesPage.jsx"
    )
  ) {
    errors.push(
      "CategoriesManager.jsx is not a thin feature entry point."
    );
  }

  if (source.split("\n").length > 5) {
    errors.push(
      "CategoriesManager.jsx is still too large."
    );
  }
}

if (errors.length) {
  console.error(
    "Categories Clean V19 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Categories Clean V19 check passed."
);
