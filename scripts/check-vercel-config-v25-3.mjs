import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, "vercel.json");

if (!fs.existsSync(file)) {
  console.error("Missing vercel.json.");
  process.exit(1);
}

const bytes = fs.readFileSync(file);

if (
  bytes.length >= 3 &&
  bytes[0] === 0xef &&
  bytes[1] === 0xbb &&
  bytes[2] === 0xbf
) {
  console.error(
    "vercel.json contains a UTF-8 BOM."
  );
  process.exit(1);
}

let config;

try {
  config = JSON.parse(
    bytes.toString("utf8")
  );
} catch (error) {
  console.error(
    `Invalid vercel.json: ${error.message}`
  );
  process.exit(1);
}

const rewrites =
  Array.isArray(config.rewrites)
    ? config.rewrites
    : [];

const apiRewrite =
  rewrites.find(
    (item) =>
      item?.source ===
      "/api/:path*"
  );

const spaRewrite =
  rewrites.find(
    (item) =>
      item?.source ===
        "/:path*" &&
      item?.destination ===
        "/index.html"
  );

const errors = [];

if (!apiRewrite) {
  errors.push(
    "Missing /api/:path* rewrite."
  );
} else if (
  !/^https:\/\/[^/]+\/api\/:path\*$/.test(
    apiRewrite.destination
  )
) {
  errors.push(
    "API rewrite destination is invalid."
  );
}

if (!spaRewrite) {
  errors.push(
    "Missing SPA fallback to /index.html."
  );
}

if (
  config.framework !== "vite"
) {
  errors.push(
    'framework must be "vite".'
  );
}

if (
  config.outputDirectory !== "dist"
) {
  errors.push(
    'outputDirectory must be "dist".'
  );
}

if (errors.length) {
  console.error(
    "Vercel V25.3 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Vercel V25.3 configuration check passed."
);
