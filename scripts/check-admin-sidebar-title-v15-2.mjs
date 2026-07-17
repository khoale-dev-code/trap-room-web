import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const shellPath = path.join(root, "src/admin/AdminShell.jsx");
const patcherPath = path.join(
  root,
  "scripts/patch-admin-sidebar-actions-v15.mjs"
);

if (!fs.existsSync(shellPath)) {
  errors.push("Missing src/admin/AdminShell.jsx");
} else {
  const source = fs.readFileSync(shellPath, "utf8");
  const tags = source.match(/<(?:a|button)\b[\s\S]*?>/g) || [];

  for (const tag of tags) {
    const titleCount = (tag.match(/\btitle\s*=/g) || []).length;

    if (titleCount > 1) {
      errors.push(`Duplicate title remains in: ${tag.slice(0, 180)}`);
    }

    if (tag.includes("data-sidebar-action=")) {
      if (titleCount !== 0) {
        errors.push(
          "Sidebar action tags must not contain a native title attribute."
        );
      }

      if (!tag.includes("aria-label=")) {
        errors.push("Sidebar action is missing aria-label.");
      }

      if (!tag.includes("data-sidebar-tooltip=")) {
        errors.push("Sidebar action is missing data-sidebar-tooltip.");
      }
    }
  }
}

if (!fs.existsSync(patcherPath)) {
  errors.push("Missing scripts/patch-admin-sidebar-actions-v15.mjs");
} else {
  const source = fs.readFileSync(patcherPath, "utf8");

  for (const forbidden of [
    'title="Open website"',
    'title="Sign out"',
    "title='Open website'",
    "title='Sign out'",
  ]) {
    if (source.includes(forbidden)) {
      errors.push(`V15 patcher still contains: ${forbidden}`);
    }
  }
}

if (errors.length) {
  console.error("Admin sidebar title repair V15.2 check failed:\n");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("Admin sidebar title repair V15.2 check passed.");
