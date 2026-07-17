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

const controlCenterStart =
  gallery.indexOf(
    'data-gallery-control-center="true"'
  );

const compactFiltersStart =
  gallery.indexOf(
    'data-gallery-compact-filters="true"'
  );

const workflowStart =
  gallery.indexOf(
    'data-gallery-workflow="true"'
  );

if (
  controlCenterStart < 0 ||
  compactFiltersStart < controlCenterStart
) {
  errors.push(
    "Compact Gallery filters are not inside or after the Gallery control center."
  );
}

if (
  workflowStart < 0
) {
  errors.push(
    "The collapsible Gallery workflow guide is missing."
  );
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

const queryValueBindings = (
  gallery.match(
    /value=\{query\}/g
  ) || []
).length;

const queryChangeBindings = (
  gallery.match(
    /setQuery\(\s*event\.target\.value\s*\)/g
  ) || []
).length;

const searchIcons = (
  gallery.match(
    /<Search\b/g
  ) || []
).length;

if (
  queryValueBindings !== 1 ||
  queryChangeBindings !== 1
) {
  errors.push(
    "Gallery must contain exactly one search input bound to query and setQuery(event.target.value)."
  );
}

if (searchIcons < 1) {
  errors.push(
    "Gallery search control is missing its Search icon."
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
