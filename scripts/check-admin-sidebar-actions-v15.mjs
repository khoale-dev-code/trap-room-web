
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
const css = read("src/admin/styles/admin-sidebar-actions-v15.css");

for (const expected of [
  'data-sidebar-action="website"',
  'data-sidebar-action="signout"',
  'data-sidebar-tooltip="Open website"',
  'data-sidebar-tooltip="Sign out"',
  "admin-sidebar-actions-v15.css",
]) {
  if (!shell.includes(expected)) {
    errors.push(`AdminShell.jsx is missing: ${expected}`);
  }
}

for (const expected of [
  '[data-sidebar-action="website"]::before',
  'content: "WEB"',
  '[data-sidebar-action="signout"]::before',
  'content: "OUT"',
  "content: attr(data-sidebar-tooltip)",
  "width: 3.5rem",
  "min-height: 3.5rem",
]) {
  if (!css.includes(expected)) {
    errors.push(`Admin sidebar action CSS is missing: ${expected}`);
  }
}

if (/<\s+size=\{/.test(shell)) {
  errors.push('AdminShell.jsx contains malformed JSX like "< size={...} />".');
}

if (errors.length) {
  console.error("Admin sidebar actions V15 check failed:\n");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("Admin sidebar actions V15 check passed.");
