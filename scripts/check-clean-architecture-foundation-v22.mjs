import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const warnings = [];

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

for (const required of [
  "server/shared/errors/AppError.js",
  "server/shared/http/requestId.js",
  "server/shared/http/respond.js",
  "server/shared/http/errorHandler.js",
  "server/routes/v1.routes.js",
  "src/lib/ApiError.js",
  "scripts/audit-clean-architecture-v22.mjs",
]) {
  if (
    !fs.existsSync(
      path.join(root, required)
    )
  ) {
    errors.push(
      `Missing V22 foundation file: ${required}`
    );
  }
}

const envSource =
  read("server/config/env.js");

for (const expected of [
  "CLIENT_ORIGINS",
  "CLIENT_ORIGIN",
  "clientOrigins",
  "clientOrigin",
  ".env.${nodeEnv}",
]) {
  if (
    !envSource.includes(expected)
  ) {
    errors.push(
      `Environment loader is missing: ${expected}`
    );
  }
}

const serverIndex =
  read("server/index.js");

for (const expected of [
  "requestIdMiddleware",
  'app.use("/api/v1", v1Routes);',
  "app.use(errorHandler);",
]) {
  if (
    !serverIndex.includes(expected)
  ) {
    errors.push(
      `server/index.js is missing: ${expected}`
    );
  }
}

const apiSource =
  read("src/lib/api.js");

for (const expected of [
  'import { ApiError } from "./ApiError.js";',
  "response.status",
  "x-request-id",
  "NETWORK_ERROR",
]) {
  if (
    !apiSource.includes(expected)
  ) {
    errors.push(
      `src/lib/api.js is missing: ${expected}`
    );
  }
}

const languageTools =
  read(
    "src/i18n/GlobalLanguageTools.jsx"
  );

if (
  languageTools.includes(
    "AutoTranslate"
  )
) {
  errors.push(
    "GlobalLanguageTools.jsx still mounts AutoTranslate."
  );
}

if (
  fs.existsSync(
    path.join(
      root,
      "src/i18n/AutoTranslate.jsx"
    )
  )
) {
  errors.push(
    "The React-unsafe AutoTranslate runtime still exists under src."
  );
}

const publicStoreHook =
  read("src/hooks/usePublicStore.js");

if (
  /setInterval\s*\(/.test(
    publicStoreHook
  )
) {
  errors.push(
    "usePublicStore.js still contains interval polling."
  );
}

const publicStoreRoute =
  read(
    "server/routes/publicStore.routes.js"
  );

for (const expected of [
  "const publicProducts",
  "categoryId.isActive",
  "products: publicProducts",
]) {
  if (
    !publicStoreRoute.includes(
      expected
    )
  ) {
    errors.push(
      `publicStore.routes.js is missing: ${expected}`
    );
  }
}

const dataSync =
  read("src/lib/dataSync.js");

if (
  dataSync.includes("yepo-") ||
  dataSync.includes("yepo:")
) {
  warnings.push(
    "src/lib/dataSync.js still contains a legacy YEPO namespace."
  );
}

for (const obsolete of [
  "scripts/check-admin-live-statistics-v20-2.mjs",
  "scripts/patch-admin-live-statistics-v20-2.mjs",
  "scripts/test-admin-live-statistics-v20-2.mjs",
  "scripts/check-admin-statistics-v20-1.mjs",
  "scripts/test-admin-statistics-v20-1.mjs",
  "scripts/check-admin-dom-recovery-v20-3.mjs",
  "scripts/check-admin-dom-recovery-v20-3-1.mjs",
  "scripts/remove-admin-live-statistics-v20-3.mjs",
]) {
  if (
    fs.existsSync(
      path.join(root, obsolete)
    )
  ) {
    errors.push(
      `Conflicting legacy script was not archived: ${obsolete}`
    );
  }
}

if (
  serverIndex.includes(
    "apiCompatibilityRoutes"
  )
) {
  warnings.push(
    "Compatibility routes remain mounted. Keep them until each Admin feature has migrated to /api/v1."
  );
}

if (warnings.length) {
  console.warn(
    "V22 verification warnings:"
  );

  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (errors.length) {
  console.error(
    "Clean Architecture Foundation V22 check failed:"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Clean Architecture Foundation V22 check passed."
);
