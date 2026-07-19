import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const absolutePath =
    path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    errors.push(
      `Missing file: ${relativePath}`
    );
    return "";
  }

  return fs.readFileSync(
    absolutePath,
    "utf8"
  );
}

function count(
  source,
  marker
) {
  return source
    .split(marker)
    .length - 1;
}

const manager = read(
  "src/admin/pages/store/ShopManager.jsx"
);

const logo = read(
  "src/admin/components/BrandLogoControl.jsx"
);

const password = read(
  "src/admin/components/AdminPasswordCard.jsx"
);

const styles = read(
  "src/admin/styles/store-security-brand-v26-2.css"
);

for (const marker of [
  'BrandLogoControl from "../../components/BrandLogoControl.jsx"',
  "store-security-brand-v26-2.css",
  "<BrandLogoControl",
]) {
  if (!manager.includes(marker)) {
    errors.push(
      `ShopManager missing: ${marker}`
    );
  }
}

if (
  count(
    manager,
    "<AdminPasswordCard />"
  ) !== 1
) {
  errors.push(
    "AdminPasswordCard must appear exactly once."
  );
}

if (
  manager.includes(
    'data-favicon-picker="true"'
  )
) {
  errors.push(
    "The old compact favicon control still exists."
  );
}

for (const marker of [
  'data-brand-logo-control="true"',
  "Replace logo",
  "Use as browser icon",
  "Browser tab preview",
  "min",
]) {
  if (!logo.includes(marker)) {
    errors.push(
      `BrandLogoControl missing: ${marker}`
    );
  }
}

for (const marker of [
  "createPortal",
  'role="dialog"',
  "Password strength",
  "Change password",
  ".changePassword(form)",
]) {
  if (!password.includes(marker)) {
    errors.push(
      `Admin password dialog missing: ${marker}`
    );
  }
}

for (const marker of [
  ".brand-logo-action",
  "min-height: 58px",
  ".admin-password-overlay",
  "env(safe-area-inset-bottom)",
  "@media (max-width: 720px)",
]) {
  if (!styles.includes(marker)) {
    errors.push(
      `UI stylesheet missing: ${marker}`
    );
  }
}

if (errors.length) {
  console.error(
    "TRAP Logo + Password UI V26.2 check failed:"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "TRAP Logo + Password UI V26.2 check passed."
);
