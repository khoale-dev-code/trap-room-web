
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function findManager() {
  const preferred = [
    "src/admin/pages/content/MenuItemsManager.jsx",
    "src/admin/MenuItemsManager.jsx",
    "src/admin/pages/MenuItemsManager.jsx",
    "src/admin/pages/catalog/MenuItemsManager.jsx",
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
        const found = walk(absolute);
        if (found) return found;
      } else if (entry.name === "MenuItemsManager.jsx") {
        return path.relative(root, absolute).replaceAll("\\", "/");
      }
    }

    return "";
  }

  return walk(adminRoot);
}

const managerPath = findManager();

if (!managerPath) {
  throw new Error("MenuItemsManager.jsx was not found.");
}

const managerDirectory = path.dirname(
  path.join(root, managerPath)
);

const featurePage = path.join(
  root,
  "src/admin/features/menu-items/MenuItemsPage.jsx"
);

let relativeImport = path
  .relative(managerDirectory, featurePage)
  .replaceAll("\\", "/");

if (!relativeImport.startsWith(".")) {
  relativeImport = `./${relativeImport}`;
}

fs.writeFileSync(
  path.join(root, managerPath),
  `export { default } from "${relativeImport}";\n`,
  "utf8"
);

console.log(
  `Replaced ${managerPath} with a thin feature entry point.`
);
