
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const shellPath = path.join(root, "src/admin/AdminShell.jsx");

if (!fs.existsSync(shellPath)) {
  errors.push("Missing src/admin/AdminShell.jsx");
} else {
  const source = fs.readFileSync(shellPath, "utf8");

  const openingTags = source.match(/<(?:a|button)\b[\s\S]*?>/g) || [];

  for (const tag of openingTags) {
    const titleCount = (tag.match(/\btitle\s*=/g) || []).length;

    if (titleCount > 1) {
      errors.push(
        `Duplicate title attribute remains in: ${tag.slice(0, 180)}`
      );
    }

    if (tag.includes("data-sidebar-action=")) {
      if (!tag.includes("aria-label=")) {
        errors.push(
          "A sidebar action is missing aria-label."
        );
      }

      if (!tag.includes("data-sidebar-tooltip=")) {
        errors.push(
          "A sidebar action is missing data-sidebar-tooltip."
        );
      }

      if (titleCount > 0) {
        errors.push(
          "Sidebar action tags should not use native title attributes."
        );
      }
    }
  }
}

const patcherPath = path.join(
  root,
  "scripts/patch-admin-sidebar-actions-v15.mjs"
);

if (fs.existsSync(patcherPath)) {
  const patcher = fs.readFileSync(patcherPath, "utf8");

  if (
    patcher.includes('title="Open website"') ||
    patcher.includes('title="Sign out"')
  ) {
    errors.push(
      "The V15 patcher can still add native title attributes."
    );
  }
}

if (errors.length) {
  console.error(
    "Admin sidebar title repair V15.1 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Admin sidebar title repair V15.1 check passed."
);
