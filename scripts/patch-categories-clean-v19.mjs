
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function findManager() {
  const preferred = [
    "src/admin/pages/content/CategoriesManager.jsx",
    "src/admin/CategoriesManager.jsx",
    "src/admin/pages/CategoriesManager.jsx",
    "src/admin/pages/store/CategoriesManager.jsx",
  ];

  for (const candidate of preferred) {
    if (fs.existsSync(path.join(root, candidate))) {
      return candidate;
    }
  }

  const adminRoot = path.join(root, "src/admin");

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, {
      withFileTypes: true,
    })) {
      const absolute = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === "features") {
          continue;
        }

        const result = walk(absolute);

        if (result) {
          return result;
        }

        continue;
      }

      if (entry.name === "CategoriesManager.jsx") {
        return path
          .relative(root, absolute)
          .replaceAll("\\", "/");
      }
    }

    return "";
  }

  return walk(adminRoot);
}

const managerPath = findManager();

if (!managerPath) {
  throw new Error(
    "CategoriesManager.jsx was not found under src/admin."
  );
}

const managerAbsolute = path.join(
  root,
  managerPath
);

const featurePage = path.join(
  root,
  "src/admin/features/categories/CategoriesPage.jsx"
);

let relativeImport = path
  .relative(
    path.dirname(managerAbsolute),
    featurePage
  )
  .replaceAll("\\", "/");

if (!relativeImport.startsWith(".")) {
  relativeImport = `./${relativeImport}`;
}

fs.writeFileSync(
  managerAbsolute,
  `export { default } from "${relativeImport}";\n`,
  "utf8"
);

console.log(
  `Replaced ${managerPath} with a thin Categories feature entry point.`
);
