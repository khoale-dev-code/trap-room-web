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

const gallery = read(
  "src/admin/pages/publishing/GalleryManager.jsx"
);
const shell = read(
  "src/admin/AdminShell.jsx"
);

for (const marker of [
  'data-gallery-control-center="true"',
  'data-gallery-compact-filters="true"',
  'data-gallery-workflow="true"',
  "function GalleryWorkflowPanel(",
  "Upload separate items",
  "Create media group",
  "Clear filters",
]) {
  if (!gallery.includes(marker)) {
    errors.push(
      `Gallery workflow is missing: ${marker}`
    );
  }
}

for (const forbidden of [
  'data-admin-filter-strip="gallery"',
  "function GalleryHelpPanel(",
]) {
  if (gallery.includes(forbidden)) {
    errors.push(
      `Obsolete Gallery layout remains: ${forbidden}`
    );
  }
}

const searchInputs = (
  gallery.match(
    /placeholder="Search title, description, category or alt text\."/g
  ) || []
).length;

if (searchInputs !== 1) {
  errors.push(
    `Expected exactly one Gallery search input, found ${searchInputs}.`
  );
}

for (const marker of [
  'data-admin-current-tab={activeTab}',
  "key={activeTab}",
  "current?.label",
  "current?.description",
]) {
  if (!shell.includes(marker)) {
    errors.push(
      `Admin topbar is missing: ${marker}`
    );
  }
}

if (
  gallery.includes("MutationObserver") ||
  gallery.includes("textContent =")
) {
  errors.push(
    "Gallery must not mutate React-managed DOM nodes."
  );
}

if (errors.length) {
  console.error(
    "Gallery Workflow V23 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Gallery Workflow V23 check passed."
);
