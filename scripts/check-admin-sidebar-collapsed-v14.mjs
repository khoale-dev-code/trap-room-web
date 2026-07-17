
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const target = path.join(root, relativePath);

  if (!fs.existsSync(target)) {
    errors.push(`Missing file: ${relativePath}`);
    return "";
  }

  return fs.readFileSync(target, "utf8");
}

const shell = read("src/admin/AdminShell.jsx");
const css = read("src/admin/styles/admin-sidebar-collapsed-v14.css");

for (const expected of [
  'data-admin-shell="true"',
  "data-admin-sidebar-collapsed",
  "admin-sidebar-collapsed-v14.css",
]) {
  if (!shell.includes(expected)) {
    errors.push(`AdminShell.jsx is missing: ${expected}`);
  }
}

for (const expected of [
  "--trap-admin-sidebar-collapsed-width: 92px",
  '[data-admin-sidebar="desktop"]',
  "grid-template-columns:",
  "nav",
  "> div:last-child",
  "@media (min-width: 1024px)",
]) {
  if (!css.includes(expected)) {
    errors.push(`Collapsed sidebar CSS is missing: ${expected}`);
  }
}

if (/<\s+size=\{/.test(shell)) {
  errors.push('AdminShell.jsx contains malformed JSX like "< size={...} />".');
}

if (errors.length) {
  console.error("Admin collapsed sidebar V14 check failed:\n");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("Admin collapsed sidebar V14 check passed.");
