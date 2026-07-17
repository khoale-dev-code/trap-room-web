
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const required = [
  "src/admin/utils/apiPayload.js",
  "src/admin/features/resource-manager/hooks/useResourceData.js",
  "src/admin/features/categories/hooks/useCategoriesData.js",
];

for (const relativePath of required) {
  const absolute =
    path.join(
      root,
      relativePath
    );

  if (!fs.existsSync(absolute)) {
    errors.push(
      `Missing file: ${relativePath}`
    );
  }
}

const resourceHookPath =
  path.join(
    root,
    "src/admin/features/resource-manager/hooks/useResourceData.js"
  );

if (
  fs.existsSync(
    resourceHookPath
  )
) {
  const source =
    fs.readFileSync(
      resourceHookPath,
      "utf8"
    );

  for (const expected of [
    "extractApiCollection",
    "extractApiEntity",
    "config?.responseKey",
    "itemsRef.current",
    "silent: true",
    "setItems((current)",
  ]) {
    if (
      !source.includes(
        expected
      )
    ) {
      errors.push(
        `useResourceData.js is missing: ${expected}`
      );
    }
  }
}

const categoryHookPath =
  path.join(
    root,
    "src/admin/features/categories/hooks/useCategoriesData.js"
  );

if (
  fs.existsSync(
    categoryHookPath
  )
) {
  const source =
    fs.readFileSync(
      categoryHookPath,
      "utf8"
    );

  if (
    !source.includes(
      "extractApiCollection"
    )
  ) {
    errors.push(
      "useCategoriesData.js does not use the shared API collection extractor."
    );
  }
}

if (errors.length) {
  console.error(
    "Admin Statistics V20.1 check failed:\n"
  );

  errors.forEach((error) =>
    console.error(`- ${error}`)
  );

  process.exit(1);
}

console.log(
  "Admin Statistics V20.1 check passed."
);
