import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const target = path.join(
    root,
    relativePath
  );

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

function readJson(relativePath) {
  const source = read(relativePath);

  if (!source) {
    return null;
  }

  try {
    return JSON.parse(source);
  } catch (error) {
    errors.push(
      `Invalid JSON in ${relativePath}: ${error.message}`
    );
    return null;
  }
}

const packageJson =
  readJson("package.json");
const railway =
  readJson("railway.json");
const server = read(
  "server/index.js"
);
const env = read(
  "server/config/env.js"
);
const api = read(
  "src/lib/api.js"
);

if (
  packageJson?.scripts?.start !==
  "node server/index.js"
) {
  errors.push(
    "package.json start script must run server/index.js."
  );
}

if (
  packageJson?.engines?.node !==
  "22.x"
) {
  errors.push(
    'package.json must pin Node to "22.x".'
  );
}

if (
  railway?.deploy?.startCommand !==
  "npm start"
) {
  errors.push(
    "railway.json startCommand must be npm start."
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

for (const marker of [
  'app.set("trust proxy", 1);',
  "function isAllowedClientOrigin(",
  "env.serveFrontend",
  '"0.0.0.0"',
  'app.get("/api/health"',
]) {
  if (!server.includes(marker)) {
    errors.push(
      `server/index.js is missing: ${marker}`
    );
  }
}

for (const marker of [
  "process.env.PORT",
  "process.env.CLIENT_ORIGINS",
  "serveFrontend:",
  "allowVercelPreviews:",
]) {
  if (!env.includes(marker)) {
    errors.push(
      `server/config/env.js is missing: ${marker}`
    );
  }
}

if (
  !api.includes(
    'import.meta.env.VITE_API_URL || "/api"'
  )
) {
  errors.push(
    "src/lib/api.js must default to same-origin /api."
  );
}

const vercelPath =
  path.join(root, "vercel.json");

if (fs.existsSync(vercelPath)) {
  const vercel =
    readJson("vercel.json");

  const rewrites =
    vercel?.rewrites || [];

  const apiRewrite =
    rewrites.find(
      (item) =>
        item.source ===
        "/api/:path*"
    );

  const spaRewrite =
    rewrites.find(
      (item) =>
        item.destination ===
        "/index.html"
    );

  if (!apiRewrite) {
    errors.push(
      "vercel.json is missing the /api reverse proxy."
    );
  } else if (
    !/^https:\/\/.+\/api\/:path\*$/.test(
      apiRewrite.destination
    )
  ) {
    errors.push(
      "vercel.json API destination must be an HTTPS Railway /api/:path* URL."
    );
  }

  if (!spaRewrite) {
    errors.push(
      "vercel.json is missing the SPA fallback to /index.html."
    );
  }
}

const configFilesWithoutSecrets = [
  "railway.json",
  "vercel.json",
];

const forbiddenSecretPatterns = [
  /mongodb\+srv:\/\/[^:\s]+:[^@\s]+@/i,
  /CLOUDINARY_API_SECRET\s*=\s*\S+/,
  /ADMIN_JWT_SECRET\s*=\s*\S+/,
];

for (
  const relativePath of
  configFilesWithoutSecrets
) {
  const target =
    path.join(root, relativePath);

  if (!fs.existsSync(target)) {
    continue;
  }

  const source =
    fs.readFileSync(
      target,
      "utf8"
    );

  for (
    const pattern of
    forbiddenSecretPatterns
  ) {
    if (pattern.test(source)) {
      errors.push(
        `Possible secret detected in ${relativePath}.`
      );
    }
  }
}

for (const relativePath of [
  ".env.railway.example",
  ".env.production.example",
]) {
  const target =
    path.join(root, relativePath);

  if (!fs.existsSync(target)) {
    continue;
  }

  const source =
    fs.readFileSync(
      target,
      "utf8"
    );

  const requiredPlaceholders = [
    "CHANGE_ME",
    "YOUR-",
  ];

  if (
    relativePath ===
      ".env.railway.example" &&
    !requiredPlaceholders.some(
      (marker) =>
        source.includes(marker)
    )
  ) {
    errors.push(
      ".env.railway.example does not appear to use safe placeholders."
    );
  }
}

if (errors.length) {
  console.error(
    "TRAP Room deploy readiness V25 failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "TRAP Room deploy readiness V25 passed."
);
