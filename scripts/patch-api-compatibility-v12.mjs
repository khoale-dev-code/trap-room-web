
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "server/index.js");

if (!fs.existsSync(indexPath)) {
  throw new Error("Missing server/index.js");
}

let source = fs.readFileSync(indexPath, "utf8");

const importLine =
  'import apiCompatibilityRoutes from "./routes/apiCompatibility.routes.js";';

if (!source.includes(importLine)) {
  const imports = [
    ...source.matchAll(/^import .*;$/gm),
  ];

  if (!imports.length) {
    throw new Error(
      "Could not locate imports in server/index.js."
    );
  }

  const last = imports.at(-1);
  const insertAt =
    last.index + last[0].length;

  source =
    source.slice(0, insertAt) +
    `\n${importLine}` +
    source.slice(insertAt);
}

const mountLine =
  'app.use("/api", apiCompatibilityRoutes);';

source = source.replace(
  /^\s*app\.use\(\s*["']\/api["']\s*,\s*apiCompatibilityRoutes\s*\);\s*$/gm,
  ""
);

const productMount =
  /app\.use\(\s*["']\/api\/products["']/g;

const productMatch =
  productMount.exec(source);

let insertAt = -1;

if (productMatch) {
  insertAt = productMatch.index;
} else {
  const apiMounts = [
    ...source.matchAll(
      /app\.use\(\s*["']\/api(?:\/[^"']*)?["'][\s\S]*?\);/g
    ),
  ];

  if (apiMounts.length) {
    const last = apiMounts.at(-1);

    insertAt =
      last.index + last[0].length;
  }
}

if (insertAt < 0) {
  const listenIndex =
    source.search(
      /\bapp\.listen\s*\(/
    );

  if (listenIndex < 0) {
    throw new Error(
      "Could not locate a safe mount position in server/index.js."
    );
  }

  insertAt = listenIndex;
}

source =
  source.slice(0, insertAt) +
  `${mountLine}\n` +
  source.slice(insertAt);

fs.writeFileSync(
  indexPath,
  source,
  "utf8"
);

console.log(
  "Mounted API compatibility routes before the existing product detail route."
);
