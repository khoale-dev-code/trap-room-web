
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const target =
    path.join(root, relativePath);

  if (!fs.existsSync(target)) {
    errors.push(
      `Missing file: ${relativePath}`
    );

    return "";
  }

  return fs.readFileSync(
    target,
    "utf8"
  );
}

const indexSource =
  read("server/index.js");

const routeSource =
  read(
    "server/routes/apiCompatibility.routes.js"
  );

for (const expected of [
  'import apiCompatibilityRoutes from "./routes/apiCompatibility.routes.js";',
  'app.use("/api", apiCompatibilityRoutes);',
]) {
  if (!indexSource.includes(expected)) {
    errors.push(
      `server/index.js is missing: ${expected}`
    );
  }
}

for (const expected of [
  'router.get(\n  "/menu-items"',
  'router.get(\n  "/extras"',
  'router.get(\n  "/journal-posts"',
  'router.get(\n  "/products/:id"',
  "mongoose.Types.ObjectId.isValid",
  "hydrateProductCategory",
]) {
  if (!routeSource.includes(expected)) {
    errors.push(
      `apiCompatibility.routes.js is missing: ${expected}`
    );
  }
}

const compatibilityIndex =
  indexSource.indexOf(
    'app.use("/api", apiCompatibilityRoutes);'
  );

const productIndex =
  indexSource.search(
    /app\.use\(\s*["']\/api\/products["']/
  );

if (
  productIndex >= 0 &&
  compatibilityIndex > productIndex
) {
  errors.push(
    "Compatibility routes must be mounted before /api/products."
  );
}

const mountCount =
  (
    indexSource.match(
      /app\.use\(\s*["']\/api["']\s*,\s*apiCompatibilityRoutes\s*\)/g
    ) || []
  ).length;

if (mountCount !== 1) {
  errors.push(
    `Expected one compatibility mount, found ${mountCount}.`
  );
}

if (errors.length) {
  console.error(
    "API compatibility V12 check failed:\n"
  );

  errors.forEach(
    (error) =>
      console.error(`- ${error}`)
  );

  process.exit(1);
}

console.log(
  "API compatibility V12 check passed."
);
