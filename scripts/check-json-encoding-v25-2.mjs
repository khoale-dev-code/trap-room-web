import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function checkJson(
  relativePath,
  required = true
) {
  const file =
    path.join(root, relativePath);

  if (!fs.existsSync(file)) {
    if (required) {
      errors.push(
        `Missing JSON file: ${relativePath}`
      );
    }
    return null;
  }

  const bytes =
    fs.readFileSync(file);

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xef &&
    bytes[1] === 0xbb &&
    bytes[2] === 0xbf
  ) {
    errors.push(
      `${relativePath} contains a UTF-8 BOM.`
    );
  }

  const source =
    bytes.toString("utf8");

  try {
    return JSON.parse(source);
  } catch (error) {
    errors.push(
      `${relativePath} is invalid JSON: ${error.message}`
    );
    return null;
  }
}

const packageJson =
  checkJson("package.json");

const lock =
  checkJson("package-lock.json");

const railway =
  checkJson("railway.json");

checkJson("vercel.json", false);

if (
  packageJson?.scripts?.start !==
  "node server/index.js"
) {
  errors.push(
    "package.json start script is incorrect."
  );
}

if (
  packageJson?.scripts?.["build:backend"] !==
  "node scripts/check-backend-build-v25-2.mjs"
) {
  errors.push(
    "package.json build:backend script is incorrect."
  );
}

if (
  packageJson?.engines?.node !==
  "22.x"
) {
  errors.push(
    'package.json engines.node must remain "22.x" for Railway.'
  );
}

if (
  lock?.packages?.[""]?.name !==
  packageJson?.name
) {
  errors.push(
    "package-lock.json root package does not match package.json."
  );
}

if (
  railway?.build?.buildCommand !==
  "npm run build:backend"
) {
  errors.push(
    "railway.json must use npm run build:backend."
  );
}

if (
  railway?.deploy?.startCommand !==
  "npm start"
) {
  errors.push(
    "railway.json must use npm start."
  );
}

if (
  railway?.deploy?.healthcheckPath !==
  "/api/health"
) {
  errors.push(
    "railway.json healthcheckPath must be /api/health."
  );
}

if (errors.length) {
  console.error(
    "JSON encoding and deploy configuration check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "JSON encoding and deployment configuration check passed."
);
