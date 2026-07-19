import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const relativePath =
  "src/admin/pages/store/ShopManager.jsx";
const absolutePath =
  path.join(root, relativePath);

if (!fs.existsSync(absolutePath)) {
  throw new Error(
    `Required file is missing: ${relativePath}`
  );
}

let source =
  fs.readFileSync(
    absolutePath,
    "utf8"
  );

source = source.replaceAll(
  "\r\n",
  "\n"
);

function insertAfter(
  input,
  marker,
  addition,
  label
) {
  if (input.includes(addition.trim())) {
    return input;
  }

  const index =
    input.indexOf(marker);

  if (index < 0) {
    throw new Error(
      `Could not locate ${label}.`
    );
  }

  const position =
    index + marker.length;

  return (
    input.slice(0, position) +
    addition +
    input.slice(position)
  );
}

source = insertAfter(
  source,
  'import AdminPasswordCard from "../../components/AdminPasswordCard.jsx";',
  '\nimport BrandLogoControl from "../../components/BrandLogoControl.jsx";',
  "AdminPasswordCard import"
);

source = insertAfter(
  source,
  'import "../../styles/store-media-actions-v9.css";',
  '\nimport "../../styles/store-security-brand-v26-2.css";',
  "Store Settings stylesheet imports"
);

source = source
  .split("<AdminPasswordCard />")
  .join("");

const actionsIndex =
  source.indexOf("actions={");

if (actionsIndex < 0) {
  throw new Error(
    "Could not locate AdminPageHeader actions."
  );
}

const fragmentIndex =
  source.indexOf(
    "<>",
    actionsIndex
  );

if (fragmentIndex < 0) {
  throw new Error(
    "Could not locate the action fragment."
  );
}

const fragmentEnd =
  fragmentIndex + 2;

source =
  source.slice(0, fragmentEnd) +
  "\n            <AdminPasswordCard />" +
  source.slice(fragmentEnd);

if (
  !source.includes(
    "<BrandLogoControl"
  )
) {
  const faviconMarker =
    'data-favicon-picker="true"';

  const faviconIndex =
    source.indexOf(faviconMarker);

  if (faviconIndex < 0) {
    throw new Error(
      "Could not locate the V26 favicon control. Run V26 before V26.2."
    );
  }

  const wrapperStart =
    source.lastIndexOf(
      "<div",
      faviconIndex
    );

  if (wrapperStart < 0) {
    throw new Error(
      "Could not locate the favicon control wrapper."
    );
  }

  const coverTitleIndex =
    source.indexOf(
      'title="Cover image"',
      faviconIndex
    );

  if (coverTitleIndex < 0) {
    throw new Error(
      "Could not locate the Cover image card."
    );
  }

  const coverCardStart =
    source.lastIndexOf(
      "<UploadCard",
      coverTitleIndex
    );

  if (
    coverCardStart < 0 ||
    coverCardStart <= wrapperStart
  ) {
    throw new Error(
      "Could not determine the logo replacement boundary."
    );
  }

  const replacement = [
    "<BrandLogoControl",
    "                  logoUrl={form.logoUrl}",
    "                  faviconUrl={form.faviconUrl}",
    '                  busy={uploading === "logoUrl"}',
    "                  onUpload={(files) =>",
    '                    upload("logoUrl", files)',
    "                  }",
    "                  onUseAsFavicon={() =>",
    '                    update("faviconUrl", form.logoUrl)',
    "                  }",
    "                  onResetFavicon={() =>",
    '                    update("faviconUrl", "")',
    "                  }",
    "                />",
    "",
    "                ",
  ].join("\n");

  source =
    source.slice(0, wrapperStart) +
    replacement +
    source.slice(coverCardStart);
}

fs.writeFileSync(
  absolutePath,
  source,
  "utf8"
);

console.log(
  "TRAP Logo + Password UI V26.2 patch completed."
);
