
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function absolute(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  const target = absolute(relativePath);

  if (!fs.existsSync(target)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }

  return fs.readFileSync(target, "utf8");
}

function write(relativePath, source) {
  fs.writeFileSync(
    absolute(relativePath),
    source
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n"),
    "utf8"
  );

  console.log(`Updated ${relativePath}`);
}

function removeExact(source, text, label) {
  if (!source.includes(text)) {
    throw new Error(`Could not locate ${label}.`);
  }

  return source.replace(text, "");
}

function removeOptionalExact(source, text) {
  return source.includes(text)
    ? source.replace(text, "")
    : source;
}

function removeRange(
  source,
  startMarker,
  endMarker,
  label,
  keepEnd = true
) {
  const start = source.indexOf(startMarker);

  if (start < 0) {
    throw new Error(`Could not locate start of ${label}.`);
  }

  const end = source.indexOf(
    endMarker,
    start + startMarker.length
  );

  if (end < 0) {
    throw new Error(`Could not locate end of ${label}.`);
  }

  return (
    source.slice(0, start) +
    (keepEnd ? source.slice(end) : source.slice(end + endMarker.length))
  );
}

function replaceRange(
  source,
  startMarker,
  endMarker,
  replacement,
  label
) {
  const start = source.indexOf(startMarker);

  if (start < 0) {
    throw new Error(`Could not locate start of ${label}.`);
  }

  const end = source.indexOf(
    endMarker,
    start + startMarker.length
  );

  if (end < 0) {
    throw new Error(`Could not locate end of ${label}.`);
  }

  return (
    source.slice(0, start) +
    replacement +
    source.slice(end)
  );
}

function removeFile(relativePath) {
  const target = absolute(relativePath);

  if (fs.existsSync(target)) {
    fs.rmSync(target, {
      recursive: true,
      force: true,
    });

    console.log(`Removed ${relativePath}`);
  }
}

function patchCategories() {
  const relativePath =
    "src/admin/features/categories/CategoriesPage.jsx";

  let source = read(relativePath);

  source = removeExact(
    source,
    'import CategorySummary from "./components/CategorySummary.jsx";\n',
    "CategorySummary import"
  );

  source = removeExact(
    source,
    "  getCategorySummary,\n",
    "getCategorySummary import"
  );

  source = removeRange(
    source,
    "  const summary = useMemo(\n",
    "  function updateForm(",
    "Categories summary state"
  );

  source = removeRange(
    source,
    "      <CategorySummary\n",
    '      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">',
    "Categories summary UI"
  );

  write(relativePath, source);

  removeFile(
    "src/admin/features/categories/components/CategorySummary.jsx"
  );
}

function patchResourceManager() {
  const relativePath =
    "src/admin/features/resource-manager/ResourceManagerPage.jsx";

  let source = read(relativePath);

  source = removeExact(
    source,
    'import ResourceSummary from "./components/ResourceSummary.jsx";\n',
    "ResourceSummary import"
  );

  source = removeExact(
    source,
    "  getResourceSummary,\n",
    "getResourceSummary import"
  );

  source = removeExact(
    source,
    "  hasFeaturedField,\n",
    "hasFeaturedField import"
  );

  source = removeRange(
    source,
    "  const summary = useMemo(\n",
    "  const filterOptions = useMemo(",
    "Resource Manager summary state"
  );

  source = removeRange(
    source,
    "      <ResourceSummary\n",
    '      <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">',
    "Resource Manager summary UI"
  );

  write(relativePath, source);

  removeFile(
    "src/admin/features/resource-manager/components/ResourceSummary.jsx"
  );
}

function patchJournal() {
  const relativePath =
    "src/admin/pages/publishing/JournalPostsManager.jsx";

  let source = read(relativePath);

  source = removeRange(
    source,
    "  const stats = useMemo(() => {\n",
    "  const filteredPosts = useMemo(() => {",
    "Journal statistics state"
  );

  const filters = `      <section
        data-admin-filter-strip="journal"
        className="admin-card p-4"
      >
        <div className="admin-scrollbar flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={[
                "min-h-11 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.1em] transition",
                filter === value
                  ? "border-trap-blue bg-trap-blue text-trap-yellow"
                  : "border-trap-blue/12 bg-white text-trap-blue hover:bg-[#eef1ff]",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

`;

  source = replaceRange(
    source,
    '      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">',
    '      <div\n        className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_480px]"',
    filters,
    "Journal statistic cards"
  );

  write(relativePath, source);
}

function patchGallery() {
  const relativePath =
    "src/admin/pages/publishing/GalleryManager.jsx";

  let source = read(relativePath);

  source = removeRange(
    source,
    "  const stats = useMemo(() => {\n",
    "  const filteredItems = useMemo(() => {",
    "Gallery statistics state and debug effect"
  );

  const filters = `      <section
        data-admin-filter-strip="gallery"
        className="admin-card p-4"
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div>
            <span className="admin-label">
              Visibility
            </span>

            <div className="admin-scrollbar flex gap-2 overflow-x-auto pb-1">
              {[
                ["all", "All items"],
                ["active", "Visible"],
                ["hidden", "Hidden"],
                ["featured", "Featured"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  aria-pressed={statusFilter === value}
                  className={[
                    "min-h-11 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.1em] transition",
                    statusFilter === value
                      ? "border-trap-blue bg-trap-blue text-trap-yellow"
                      : "border-trap-blue/12 bg-white text-trap-blue hover:bg-[#eef1ff]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="admin-label">
              Media type
            </span>

            <div className="admin-scrollbar flex gap-2 overflow-x-auto pb-1">
              {[
                ["all", "All media"],
                ["image", "Images"],
                ["video", "Videos"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTypeFilter(value)}
                  aria-pressed={typeFilter === value}
                  className={[
                    "min-h-11 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.1em] transition",
                    typeFilter === value
                      ? "border-trap-blue bg-trap-blue text-trap-yellow"
                      : "border-trap-blue/12 bg-white text-trap-blue hover:bg-[#eef1ff]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

`;

  source = replaceRange(
    source,
    '      <section data-gallery-stats="true" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">',
    "      <GalleryHelpPanel language={language} />",
    filters,
    "Gallery statistic cards"
  );

  source = removeRange(
    source,
    "function StatButton({\n",
    "function BatchUploadPanel({",
    "Gallery StatButton component"
  );

  source = removeRange(
    source,
    "function buildGalleryStats(value) {\n",
    "function extractGalleryList(\n",
    "Gallery statistics helper"
  );

  source = source
    .replace(
      '"Nhấn các ô thống kê để lọc. Nút phóng to mở bản xem trước đúng tỷ lệ trước khi xuất bản."',
      '"Dùng các nút lọc trạng thái và loại media. Nút phóng to mở bản xem trước đúng tỷ lệ trước khi xuất bản."'
    )
    .replace(
      '"Các con số phía trên luôn tính từ toàn bộ dữ liệu Gallery đã tải, không phụ thuộc ô tìm kiếm."',
      '"Danh sách và dòng số lượng hiển thị luôn dùng cùng một nguồn dữ liệu React."'
    )
    .replace(
      '"Click a statistic card to filter. The expand action opens a fitted preview before publishing."',
      '"Use the visibility and media-type filters. The expand action opens a fitted preview before publishing."'
    )
    .replace(
      '"The statistics above always use the complete loaded Gallery data and are not affected by search."',
      '"The list and showing count now use the same React data source."'
    );

  write(relativePath, source);
}

function patchBookings() {
  const relativePath =
    "src/admin/pages/operations/ReservationsManager.jsx";

  let source = read(relativePath);

  source = removeRange(
    source,
    "  const counts = useMemo(() => {\n",
    "  const filtered = useMemo(() => {",
    "Booking statistics state"
  );

  const filters = `      <section
        data-admin-filter-strip="bookings"
        className="admin-card p-4"
      >
        <div className="admin-scrollbar flex gap-2 overflow-x-auto pb-1">
          {["all", ...statuses].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              aria-pressed={status === item}
              className={[
                "min-h-11 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.1em] transition",
                status === item
                  ? "border-trap-blue bg-trap-blue text-trap-yellow"
                  : "border-trap-blue/12 bg-white text-trap-blue hover:bg-[#eef1ff]",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

`;

  source = replaceRange(
    source,
    '      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">',
    '      <section className="admin-card mt-6 p-4">',
    filters,
    "Booking statistic cards"
  );

  write(relativePath, source);
}

function patchGalleryBackend() {
  const routePath =
    "server/routes/gallery.routes.js";

  let route = read(routePath);

  if (
    route.includes(
      'router.get(\n  "/stats",'
    )
  ) {
    route = removeRange(
      route,
      'router.get(\n  "/stats",',
      'router.get("/",',
      "Gallery /stats route"
    );
  }

  write(routePath, route);

  const indexPath =
    "server/index.js";

  let index = read(indexPath);

  index = removeOptionalExact(
    index,
    'import galleryLiveStatsRoutes from "./routes/galleryLiveStats.routes.js";\n'
  );

  index = removeOptionalExact(
    index,
    'app.use("/api/gallery-live-stats", galleryLiveStatsRoutes);\n'
  );

  write(indexPath, index);

  removeFile(
    "server/routes/galleryLiveStats.routes.js"
  );

  removeFile(
    "src/admin/useGalleryLiveStats.js"
  );
}

function patchArchitectureChecks() {
  const categoryCheck =
    "scripts/check-categories-clean-v19.mjs";

  if (fs.existsSync(absolute(categoryCheck))) {
    let source = read(categoryCheck);

    source = source.replace(
      '  "src/admin/features/categories/components/CategorySummary.jsx",\n',
      ""
    );

    write(categoryCheck, source);
  }

  const resourceCheck =
    "scripts/check-resource-manager-clean-v20.mjs";

  if (fs.existsSync(absolute(resourceCheck))) {
    let source = read(resourceCheck);

    source = source.replace(
      '  "src/admin/features/resource-manager/components/ResourceSummary.jsx",\n',
      ""
    );

    write(resourceCheck, source);
  }
}

patchCategories();
patchResourceManager();
patchJournal();
patchGallery();
patchBookings();
patchGalleryBackend();
patchArchitectureChecks();

console.log(
  "Admin CRUD statistics were removed without mutating React-managed DOM."
);
