import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const absolutePath =
    path.join(
      root,
      relativePath
    );

  if (
    !fs.existsSync(
      absolutePath
    )
  ) {
    errors.push(
      `Missing file: ${relativePath}`
    );

    return "";
  }

  return fs.readFileSync(
    absolutePath,
    "utf8"
  );
}

const layout =
  read(
    "src/layouts/PublicLayout.jsx"
  );

const scroll =
  read(
    "src/components/navigation/RouteScrollManager.jsx"
  );

const styles =
  read(
    "src/styles/public-mobile-layout-v27.css"
  );

const index =
  read("index.html");

for (
  const marker of
  [
    'data-public-layout="true"',
    'data-public-main="true"',
    "public-site-layout",
    "public-mobile-layout-v27.css",
  ]
) {
  if (!layout.includes(marker)) {
    errors.push(
      `PublicLayout missing: ${marker}`
    );
  }
}

for (
  const marker of
  [
    "INITIAL_RESET_DELAYS",
    "window.history.scrollRestoration",
    '"manual"',
    '"pageshow"',
    "event.persisted",
    "cancelDelayedReset",
  ]
) {
  if (!scroll.includes(marker)) {
    errors.push(
      `RouteScrollManager missing: ${marker}`
    );
  }
}

for (
  const marker of
  [
    ".public-site-layout",
    "display: flex",
    "flex-direction: column",
    ".public-site-main",
    "flex: 1 0 auto",
    'footer[data-trap-public-footer="true"]',
    "min-height: 100svh",
    "env(safe-area-inset-bottom)",
  ]
) {
  if (!styles.includes(marker)) {
    errors.push(
      `Public layout CSS missing: ${marker}`
    );
  }
}

if (
  !index.includes(
    "window.history.scrollRestoration"
  ) ||
  !index.includes(
    '"manual"'
  )
) {
  errors.push(
    "index.html is missing the early scroll-restoration guard."
  );
}

if (
  scroll.includes(
    "MutationObserver"
  )
) {
  errors.push(
    "RouteScrollManager must not use MutationObserver."
  );
}

if (errors.length) {
  console.error(
    "TRAP Chrome mobile footer gap V27 check failed:"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "TRAP Chrome mobile footer gap V27 check passed."
);
