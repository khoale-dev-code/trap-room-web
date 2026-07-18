import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const target =
    path.join(
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

const model =
  read("server/models/OwnerCredential.js");

const auth =
  read("server/routes/auth.routes.js");

const guard =
  read("server/middleware/requireAdmin.js");

const shopModel =
  read("server/models/Shop.js");

const shopRoute =
  read("server/routes/shop.routes.js");

const api =
  read("src/lib/api.js");

const main =
  read("src/main.jsx");

const meta =
  read("src/components/SiteMeta.jsx");

const shopManager =
  read("src/admin/pages/store/ShopManager.jsx");

const passwordCard =
  read("src/admin/components/AdminPasswordCard.jsx");

for (
  const marker of
  [
    "passwordHash",
    "passwordSalt",
    "passwordVersion",
    "OWNER_CREDENTIAL_KEY",
  ]
) {
  if (!model.includes(marker)) {
    errors.push(
      `OwnerCredential model missing: ${marker}`
    );
  }
}

for (
  const marker of
  [
    '"/change-password"',
    "verifyOwnerPassword(",
    "OwnerCredential",
    "signOwnerSession(",
    'sameSite: "lax"',
    "runValidators: false",
    "PASSWORD_CURRENT_INVALID",
  ]
) {
  if (!auth.includes(marker)) {
    errors.push(
      `Auth route missing: ${marker}`
    );
  }
}

for (
  const marker of
  [
    "OWNER_SESSION_REVOKED",
    "passwordVersion",
    "OwnerCredential",
  ]
) {
  if (!guard.includes(marker)) {
    errors.push(
      `Admin guard missing: ${marker}`
    );
  }
}

if (
  !shopModel.includes(
    "faviconUrl:"
  )
) {
  errors.push(
    "Shop model is missing faviconUrl."
  );
}

if (
  !shopRoute.includes(
    "faviconUrl: text(input.faviconUrl)"
  )
) {
  errors.push(
    "Shop route does not persist faviconUrl."
  );
}

if (
  !api.includes(
    "changePassword(payload)"
  )
) {
  errors.push(
    "API client is missing changePassword."
  );
}

if (
  !main.includes(
    'from "./components/SiteMeta.jsx"'
  ) ||
  !main.includes(
    "<SiteMeta />"
  )
) {
  errors.push(
    "SiteMeta is not mounted in src/main.jsx."
  );
}

for (
  const marker of
  [
    "shop.faviconUrl",
    "<title>{title}</title>",
    'rel="icon"',
    "subscribeDataChanged",
  ]
) {
  if (!meta.includes(marker)) {
    errors.push(
      `SiteMeta missing: ${marker}`
    );
  }
}

if (
  meta.includes(
    "MutationObserver"
  ) ||
  meta.includes(
    "document."
  )
) {
  errors.push(
    "SiteMeta must use React metadata, not direct DOM mutation."
  );
}

for (
  const marker of
  [
    'data-favicon-picker="true"',
    "Use logo as browser icon",
    "<AdminPasswordCard />",
  ]
) {
  if (
    !shopManager.includes(marker)
  ) {
    errors.push(
      `ShopManager missing: ${marker}`
    );
  }
}

for (
  const marker of
  [
    'data-admin-password-card="true"',
    "api.auth",
    ".changePassword(form)",
    "currentPassword",
    "confirmPassword",
  ]
) {
  if (
    !passwordCard.includes(marker)
  ) {
    errors.push(
      `Password card missing: ${marker}`
    );
  }
}

if (errors.length) {
  console.error(
    "TRAP favicon and owner password V26 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "TRAP favicon and owner password V26 check passed."
);
