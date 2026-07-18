import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function file(relativePath) {
  return path.join(
    root,
    relativePath
  );
}

function read(relativePath) {
  const target =
    file(relativePath);

  if (!fs.existsSync(target)) {
    throw new Error(
      `Required file is missing: ${relativePath}`
    );
  }

  return fs.readFileSync(
    target,
    "utf8"
  );
}

function write(
  relativePath,
  source
) {
  fs.writeFileSync(
    file(relativePath),
    source,
    "utf8"
  );

  console.log(
    `Updated ${relativePath}`
  );
}

function patchShopModel() {
  const relativePath =
    "server/models/Shop.js";

  let source =
    read(relativePath);

  if (
    source.includes(
      "faviconUrl:"
    )
  ) {
    return;
  }

  const marker =
    /(\n\s*logoUrl\s*:\s*\{[\s\S]*?\}\s*,)/;

  if (!marker.test(source)) {
    throw new Error(
      "Could not locate logoUrl in server/models/Shop.js."
    );
  }

  source =
    source.replace(
      marker,
      `$1
    faviconUrl: {
      type: String,
      default: "",
      trim: true,
    },`
    );

  write(
    relativePath,
    source
  );
}

function patchShopRoute() {
  const relativePath =
    "server/routes/shop.routes.js";

  let source =
    read(relativePath);

  if (
    source.includes(
      "faviconUrl: text(input.faviconUrl)"
    )
  ) {
    return;
  }

  const marker =
    /(\n\s*logoUrl\s*:\s*text\(input\.logoUrl\)[^\n]*,\s*)/;

  if (!marker.test(source)) {
    throw new Error(
      "Could not locate logoUrl cleanup in server/routes/shop.routes.js."
    );
  }

  source =
    source.replace(
      marker,
      `$1
    faviconUrl: text(input.faviconUrl),`
    );

  write(
    relativePath,
    source
  );
}

function patchApi() {
  const relativePath =
    "src/lib/api.js";

  let source =
    read(relativePath);

  if (
    source.includes(
      'changePassword(payload)'
    )
  ) {
    return;
  }

  const marker =
    /(\n\s*me\(\)\s*\{\s*return request\("\/auth\/me"\);\s*\},)/;

  if (!marker.test(source)) {
    throw new Error(
      "Could not locate api.auth.me() in src/lib/api.js."
    );
  }

  source =
    source.replace(
      marker,
      `$1

    changePassword(payload) {
      return request("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },`
    );

  write(
    relativePath,
    source
  );
}

function patchMain() {
  const relativePath =
    "src/main.jsx";

  let source =
    read(relativePath);

  if (
    !source.includes(
      'from "./components/SiteMeta.jsx"'
    )
  ) {
    const marker =
      /import App from "\.\/App\.jsx";/;

    if (!marker.test(source)) {
      throw new Error(
        "Could not locate App import in src/main.jsx."
      );
    }

    source =
      source.replace(
        marker,
        `import App from "./App.jsx";
import SiteMeta from "./components/SiteMeta.jsx";`
      );
  }

  if (
    !source.includes(
      "<SiteMeta />"
    )
  ) {
    const marker =
      /(<I18nProvider>)/;

    if (!marker.test(source)) {
      throw new Error(
        "Could not locate I18nProvider in src/main.jsx."
      );
    }

    source =
      source.replace(
        marker,
        `$1
        <SiteMeta />`
      );
  }

  write(
    relativePath,
    source
  );
}

function patchShopManager() {
  const relativePath =
    "src/admin/pages/store/ShopManager.jsx";

  let source =
    read(relativePath);

  if (
    !source.includes(
      'AdminPasswordCard from "../../components/AdminPasswordCard.jsx"'
    )
  ) {
    const marker =
      /import HomepageMediaEditor from "\.\.\/\.\.\/components\/HomepageMediaEditor\.jsx";/;

    if (!marker.test(source)) {
      throw new Error(
        "Could not locate HomepageMediaEditor import in ShopManager.jsx."
      );
    }

    source =
      source.replace(
        marker,
        `import HomepageMediaEditor from "../../components/HomepageMediaEditor.jsx";
import AdminPasswordCard from "../../components/AdminPasswordCard.jsx";`
      );
  }

  for (
    const icon of
    [
      "CheckCircle2",
      "Globe2",
    ]
  ) {
    if (
      source.includes(
        `  ${icon},`
      )
    ) {
      continue;
    }

    const marker =
      /import \{\s*\n/;

    if (!marker.test(source)) {
      throw new Error(
        "Could not locate lucide-react icon import in ShopManager.jsx."
      );
    }

    source =
      source.replace(
        marker,
        `import {
  ${icon},
`
      );
  }

  if (
    !source.includes(
      'data-favicon-picker="true"'
    )
  ) {
    const logoCard =
      /<UploadCard\s+title="Store logo"\s+value=\{form\.logoUrl\}\s+busy=\{uploading === "logoUrl"\}\s+onFiles=\{\(files\) => upload\("logoUrl", files\)\}\s*\/>/;

    if (!logoCard.test(source)) {
      throw new Error(
        "Could not locate the Store logo UploadCard in ShopManager.jsx."
      );
    }

    source =
      source.replace(
        logoCard,
        `<div
                  data-favicon-picker="true"
                  className="grid gap-3"
                >
                  <UploadCard
                    title="Store logo"
                    value={form.logoUrl}
                    busy={uploading === "logoUrl"}
                    onFiles={(files) => upload("logoUrl", files)}
                  />

                  <button
                    type="button"
                    className={[
                      "flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-[9px] font-extrabold uppercase tracking-[0.12em] transition",
                      form.logoUrl &&
                      form.faviconUrl === form.logoUrl
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-trap-blue/15 bg-white text-trap-blue hover:bg-[#eef1ff]",
                    ].join(" ")}
                    disabled={!form.logoUrl}
                    onClick={() =>
                      update("faviconUrl", form.logoUrl)
                    }
                  >
                    {form.logoUrl &&
                    form.faviconUrl === form.logoUrl ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Globe2 size={16} />
                    )}

                    {form.logoUrl &&
                    form.faviconUrl === form.logoUrl
                      ? "Selected as browser icon"
                      : "Use logo as browser icon"}
                  </button>

                  <div className="flex items-center gap-3 rounded-2xl border border-trap-blue/10 bg-[#f8f9fd] p-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-sm">
                      <img
                        src={form.faviconUrl || "/favicon.svg"}
                        alt="Browser tab icon preview"
                        className="h-full w-full object-contain p-1.5"
                      />
                    </span>

                    <span className="min-w-0">
                      <b className="block text-xs text-trap-blue">
                        Browser tab preview
                      </b>

                      <small className="mt-1 block text-[10px] font-medium leading-4 text-trap-ink/45">
                        A square PNG, WEBP or SVG gives the clearest result. Save changes after selecting.
                      </small>
                    </span>
                  </div>

                  {form.faviconUrl ? (
                    <button
                      type="button"
                      className="justify-self-start text-[10px] font-extrabold uppercase tracking-[0.1em] text-trap-orange underline underline-offset-4"
                      onClick={() =>
                        update("faviconUrl", "")
                      }
                    >
                      Use default browser icon
                    </button>
                  ) : null}
                </div>`
      );
  }

  if (
    !source.includes(
      "<AdminPasswordCard />"
    )
  ) {
    const marker =
      /(\n\s*<div\s*\n\s*data-store-homepage-media)/;

    if (!marker.test(source)) {
      throw new Error(
        "Could not locate Homepage Media section in ShopManager.jsx."
      );
    }

    source =
      source.replace(
        marker,
        `
            <AdminPasswordCard />
$1`
      );
  }

  write(
    relativePath,
    source
  );
}

patchShopModel();
patchShopRoute();
patchApi();
patchMain();
patchShopManager();

console.log(
  "TRAP favicon and owner password patch V26 completed."
);
