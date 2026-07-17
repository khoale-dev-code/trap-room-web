import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const galleryPath = path.join(
  root,
  "src/admin/pages/publishing/GalleryManager.jsx"
);
const shellPath = path.join(
  root,
  "src/admin/AdminShell.jsx"
);

function read(target) {
  if (!fs.existsSync(target)) {
    throw new Error(
      `Required file is missing: ${path.relative(root, target)}`
    );
  }

  return fs.readFileSync(target, "utf8");
}

function write(target, source) {
  fs.writeFileSync(target, source, "utf8");
  console.log(
    `Updated ${path.relative(root, target)}`
  );
}

function replaceOnce(source, pattern, replacement, label) {
  if (!pattern.test(source)) {
    throw new Error(
      `Could not find the current ${label} structure. No unsafe rewrite was made.`
    );
  }

  pattern.lastIndex = 0;
  return source.replace(pattern, replacement);
}

function patchGallery(input) {
  let source = input;

  if (
    !source.includes(
      'data-gallery-control-center="true"'
    )
  ) {
    source = replaceOnce(
      source,
      /<section className="admin-card mt-6 p-4">\s*<div className="grid gap-4 xl:grid-cols-\[minmax\(0,1fr\)_auto_auto\] xl:items-end">/,
      `<section
        data-gallery-control-center="true"
        className="admin-card mt-4 p-4 sm:p-5"
      >
        <div className="flex flex-col gap-3 border-b border-trap-blue/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-trap-orange">
              Library controls
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-trap-blue">
              Find and manage gallery items
            </h2>

            <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-trap-ink/45">
              Search first, narrow the result, then select or edit only the items you need.
            </p>
          </div>

          {(query ||
            categoryFilter !== "all" ||
            statusFilter !== "all" ||
            typeFilter !== "all") && (
            <button
              type="button"
              className="admin-button-secondary shrink-0"
              onClick={() => {
                setQuery("");
                setCategoryFilter("all");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-end">`,
      "Gallery search toolbar"
    );
  }

  if (
    !source.includes(
      'data-gallery-compact-filters="true"'
    )
  ) {
    source = replaceOnce(
      source,
      /(\s*<div className="mt-4 flex flex-col gap-3 border-t border-trap-blue\/10 pt-4 sm:flex-row sm:items-center sm:justify-between">)/,
      `
        <div
          data-gallery-compact-filters="true"
          className="mt-4 grid gap-4 border-t border-trap-blue/10 pt-4 lg:grid-cols-2"
        >
          <div className="min-w-0">
            <span className="admin-label">
              Visibility
            </span>

            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
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
                  className={[
                    "min-h-10 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.08em] transition",
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

          <div className="min-w-0">
            <span className="admin-label">
              Media type
            </span>

            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {[
                ["all", "All media"],
                ["image", "Images"],
                ["video", "Videos"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTypeFilter(value)}
                  className={[
                    "min-h-10 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.08em] transition",
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
$1`,
      "Gallery result footer"
    );
  }

  if (
    !source.includes(
      "<GalleryWorkflowPanel"
    )
  ) {
    source = replaceOnce(
      source,
      /\s*<section\s+data-admin-filter-strip="gallery"[\s\S]*?<\/section>\s*<GalleryHelpPanel language=\{language\} \/>\s*/,
      `

      <GalleryWorkflowPanel language={language} />

      `,
      "standalone Gallery filter and guide panels"
    );
  }

  if (
    source.includes(
      "function GalleryHelpPanel("
    )
  ) {
    const start = source.indexOf(
      "function GalleryHelpPanel("
    );
    const end = source.indexOf(
      "function BatchUploadPanel(",
      start
    );

    if (start < 0 || end < 0) {
      throw new Error(
        "Could not isolate GalleryHelpPanel safely."
      );
    }

    const workflowComponent = `function GalleryWorkflowPanel({
  language,
}) {
  const vi = language === "vi";

  const content = vi
    ? {
        eyebrow: "Quy trình đăng nội dung",
        title: "Chọn đúng cách đăng Gallery",
        summary:
          "Tải riêng nhiều mục hoặc tạo một nhóm media có nội dung đầy đủ.",
        open: "Xem hướng dẫn",
        steps: [
          {
            number: "01",
            title: "Tải riêng từng file",
            body:
              "Dùng Tải nhiều mục khi mỗi ảnh hoặc video cần trở thành một mục Gallery độc lập.",
          },
          {
            number: "02",
            title: "Tạo nhóm media",
            body:
              "Dùng Tạo nhóm media khi một tiêu đề cần chứa nhiều ảnh, video và phần mô tả chung.",
          },
          {
            number: "03",
            title: "Kiểm tra trước khi hiện",
            body:
              "Lưu ở trạng thái ẩn để kiểm tra. Chỉ bật Nổi bật cho nội dung cần ưu tiên ngoài Client.",
          },
        ],
      }
    : {
        eyebrow: "Publishing workflow",
        title: "Choose the right Gallery action",
        summary:
          "Upload separate records quickly or create one complete media group.",
        open: "View guide",
        steps: [
          {
            number: "01",
            title: "Upload separate items",
            body:
              "Use this when every selected image or video should become its own Gallery item.",
          },
          {
            number: "02",
            title: "Create a media group",
            body:
              "Use this when one title needs several images, videos and one shared description.",
          },
          {
            number: "03",
            title: "Review before publishing",
            body:
              "Keep an item hidden while checking it. Use Featured only for priority Client content.",
          },
        ],
      };

  return (
    <details
      data-gallery-workflow="true"
      className="admin-card group mt-4 overflow-hidden"
    >
      <summary className="flex cursor-pointer list-none flex-col gap-3 p-4 marker:hidden sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef1ff] text-trap-blue">
            <Sparkles size={18} />
          </span>

          <div className="min-w-0">
            <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-trap-orange">
              {content.eyebrow}
            </p>

            <h2 className="mt-1 text-base font-extrabold text-trap-blue sm:text-lg">
              {content.title}
            </h2>

            <p className="mt-1 text-xs font-medium leading-5 text-trap-ink/45">
              {content.summary}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-[0.1em] text-trap-blue">
          {content.open}
          <span className="ml-2 inline-block transition-transform group-open:rotate-180">
            ↓
          </span>
        </span>
      </summary>

      <div className="grid gap-3 border-t border-trap-blue/10 bg-[#fbfcff] p-4 md:grid-cols-3 sm:p-5">
        {content.steps.map((step) => (
          <article
            key={step.number}
            className="rounded-2xl border border-trap-blue/10 bg-white p-4"
          >
            <span className="text-[9px] font-extrabold tracking-[0.14em] text-trap-orange">
              {step.number}
            </span>

            <h3 className="mt-2 text-sm font-extrabold text-trap-blue">
              {step.title}
            </h3>

            <p className="mt-2 text-xs font-medium leading-5 text-trap-ink/55">
              {step.body}
            </p>
          </article>
        ))}
      </div>
    </details>
  );
}

`;

    source =
      source.slice(0, start) +
      workflowComponent +
      source.slice(end);
  }

  source = source
    .replaceAll(
      "Quick upload",
      "Upload separate items"
    )
    .replaceAll(
      "New gallery item",
      "Create media group"
    );

  if (
    !source.includes(
      'title="Each selected file becomes a separate Gallery item."'
    )
  ) {
    source = source.replace(
      /onClick=\{openBatchUploader\}\s*>/,
      `onClick={openBatchUploader}
              title="Each selected file becomes a separate Gallery item."
            >`
    );
  }

  if (
    !source.includes(
      'title="Create one Gallery item with a title, description and multiple media."'
    )
  ) {
    source = source.replace(
      /onClick=\{openCreate\}\s*>/,
      `onClick={openCreate}
              title="Create one Gallery item with a title, description and multiple media."
            >`
    );
  }

  return source;
}

function patchShell(input) {
  let source = input;

  if (
    !source.includes(
      'data-admin-current-tab={activeTab}'
    )
  ) {
    source = replaceOnce(
      source,
      /data-admin-topbar="true"/,
      `data-admin-topbar="true"
          data-admin-current-tab={activeTab}`,
      "Admin topbar"
    );
  }

  if (
    !source.includes(
      "key={activeTab}"
    )
  ) {
    const marker =
      'data-admin-topbar="true"';

    const markerIndex =
      source.indexOf(marker);

    const headerIndex =
      source.lastIndexOf(
        "<header",
        markerIndex
      );

    if (
      markerIndex < 0 ||
      headerIndex < 0
    ) {
      throw new Error(
        "Could not identify Admin topbar header."
      );
    }

    source =
      source.slice(0, headerIndex + 7) +
      "\n          key={activeTab}" +
      source.slice(headerIndex + 7);
  }

  const markerIndex = source.indexOf(
    'data-admin-topbar="true"'
  );
  const headerStart = source.lastIndexOf(
    "<header",
    markerIndex
  );
  const headerEnd = source.indexOf(
    "</header>",
    markerIndex
  );

  if (
    headerStart < 0 ||
    headerEnd < 0
  ) {
    throw new Error(
      "Could not isolate Admin topbar."
    );
  }

  let header = source.slice(
    headerStart,
    headerEnd + "</header>".length
  );

  if (
    !header.includes(
      "current?.label"
    ) &&
    !header.includes(
      "current.label"
    )
  ) {
    header = header
      .replace(
        />\s*Overview\s*</,
        `>
                {current?.label || sidebarCopy.brandTitle}
              <`
      )
      .replace(
        />\s*Store performance and latest activity\s*</,
        `>
                  {current?.description}
                <`
      )
      .replace(
        />\s*Hiệu suất cửa hàng và hoạt động gần đây\s*</,
        `>
                  {current?.description}
                <`
      );
  }

  if (
    !header.includes(
      "current?.label"
    ) &&
    !header.includes(
      "current.label"
    )
  ) {
    throw new Error(
      "Admin topbar still does not use the active tab label."
    );
  }

  if (
    !header.includes(
      "current?.description"
    ) &&
    !header.includes(
      "current.description"
    )
  ) {
    throw new Error(
      "Admin topbar still does not use the active tab description."
    );
  }

  source =
    source.slice(0, headerStart) +
    header +
    source.slice(
      headerEnd + "</header>".length
    );

  return source;
}

const galleryBefore = read(galleryPath);
const shellBefore = read(shellPath);

const galleryAfter =
  patchGallery(galleryBefore);
const shellAfter =
  patchShell(shellBefore);

if (galleryAfter !== galleryBefore) {
  write(galleryPath, galleryAfter);
} else {
  console.log(
    "Gallery workflow was already updated."
  );
}

if (shellAfter !== shellBefore) {
  write(shellPath, shellAfter);
} else {
  console.log(
    "Admin topbar was already connected to activeTab."
  );
}

console.log(
  "Gallery Workflow V23 patch completed."
);
