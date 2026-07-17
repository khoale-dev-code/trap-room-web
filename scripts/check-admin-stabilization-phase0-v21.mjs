
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

const categories = read(
  "src/admin/features/categories/CategoriesPage.jsx"
);

const resourceManager = read(
  "src/admin/features/resource-manager/ResourceManagerPage.jsx"
);

const journal = read(
  "src/admin/pages/publishing/JournalPostsManager.jsx"
);

const gallery = read(
  "src/admin/pages/publishing/GalleryManager.jsx"
);

const bookings = read(
  "src/admin/pages/operations/ReservationsManager.jsx"
);

const galleryRoutes = read(
  "server/routes/gallery.routes.js"
);

const serverIndex = read(
  "server/index.js"
);

for (const forbidden of [
  "CategorySummary",
  "getCategorySummary(",
]) {
  if (categories.includes(forbidden)) {
    errors.push(
      `Categories still contains: ${forbidden}`
    );
  }
}

for (const expected of [
  "visibleCount={",
  "filteredItems.length",
  "totalCount={",
  "data.items.length",
]) {
  if (!categories.includes(expected)) {
    errors.push(
      `Categories lost its list count source: ${expected}`
    );
  }
}

for (const forbidden of [
  "ResourceSummary",
  "getResourceSummary(",
  "hasFeaturedField(",
]) {
  if (resourceManager.includes(forbidden)) {
    errors.push(
      `Resource Manager still contains: ${forbidden}`
    );
  }
}

for (const expected of [
  "visibleCount={filteredItems.length}",
  "totalCount={data.items.length}",
]) {
  if (!resourceManager.includes(expected)) {
    errors.push(
      `Resource Manager lost: ${expected}`
    );
  }
}

for (const forbidden of [
  "const stats = useMemo",
  "{stats[value]",
  'className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"',
]) {
  if (journal.includes(forbidden)) {
    errors.push(
      `Journal still contains statistic UI/state: ${forbidden}`
    );
  }
}

for (const expected of [
  'data-admin-filter-strip="journal"',
  "Showing {filteredPosts.length}",
  "{posts.length} posts",
]) {
  if (!journal.includes(expected)) {
    errors.push(
      `Journal lost safe filtering/count UI: ${expected}`
    );
  }
}

for (const forbidden of [
  "const stats = useMemo",
  "__TRAP_GALLERY_STATS__",
  'data-gallery-stats="true"',
  "function StatButton(",
  "function buildGalleryStats(",
]) {
  if (gallery.includes(forbidden)) {
    errors.push(
      `Gallery still contains statistic UI/state: ${forbidden}`
    );
  }
}

if (
  (gallery.match(/<GalleryHelpPanel language=\{language\} \/>/g) || []).length !== 1
) {
  errors.push("GalleryHelpPanel must appear exactly once.");
}

for (const expected of [
  'data-admin-filter-strip="gallery"',
  "{filteredItems.length} of {items.length} items",
  "setStatusFilter(value)",
  "setTypeFilter(value)",
]) {
  if (!gallery.includes(expected)) {
    errors.push(
      `Gallery lost safe filtering/count UI: ${expected}`
    );
  }
}

for (const forbidden of [
  "const counts = useMemo",
  "{counts[item]",
  'className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"',
]) {
  if (bookings.includes(forbidden)) {
    errors.push(
      `Bookings still contains statistic UI/state: ${forbidden}`
    );
  }
}

if (
  (bookings.match(/<section className="admin-card mt-6 p-4">/g) || []).length !== 1
) {
  errors.push("Bookings search section must appear exactly once.");
}

for (const expected of [
  'data-admin-filter-strip="bookings"',
  "Showing {filtered.length} of {items.length} bookings",
]) {
  if (!bookings.includes(expected)) {
    errors.push(
      `Bookings lost safe filtering/count UI: ${expected}`
    );
  }
}

if (
  galleryRoutes.includes(
    '"/stats"'
  )
) {
  errors.push(
    "server/routes/gallery.routes.js still exposes a Gallery statistics route."
  );
}

for (const forbidden of [
  "galleryLiveStatsRoutes",
  "/api/gallery-live-stats",
]) {
  if (serverIndex.includes(forbidden)) {
    errors.push(
      `server/index.js still contains: ${forbidden}`
    );
  }
}

for (const removedPath of [
  "src/admin/features/categories/components/CategorySummary.jsx",
  "src/admin/features/resource-manager/components/ResourceSummary.jsx",
  "src/admin/useGalleryLiveStats.js",
  "server/routes/galleryLiveStats.routes.js",
  "src/admin/features/live-statistics",
]) {
  if (
    fs.existsSync(
      path.join(root, removedPath)
    )
  ) {
    errors.push(
      `Removed statistics artifact still exists: ${removedPath}`
    );
  }
}

if (errors.length) {
  console.error(
    "Admin Stabilization Phase 0 V21 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Admin Stabilization Phase 0 V21 check passed."
);
