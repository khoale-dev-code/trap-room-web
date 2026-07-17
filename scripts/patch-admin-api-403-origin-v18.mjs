
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const currentOrigin = process.argv[2];

if (!currentOrigin) {
  throw new Error(
    "Current LAN origin argument is required."
  );
}

const serverRoot = path.join(root, "server");

if (!fs.existsSync(serverRoot)) {
  throw new Error("The server directory was not found.");
}

const textExtensions = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".mts",
  ".cts",
]);

const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    const absolute = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name !== "node_modules" &&
        entry.name !== "dist"
      ) {
        walk(absolute);
      }

      continue;
    }

    if (
      textExtensions.has(
        path.extname(entry.name).toLowerCase()
      )
    ) {
      files.push(absolute);
    }
  }
}

walk(serverRoot);

const helperImportPath =
  "./config/developmentOrigins.js";

let modifiedCount = 0;
let dynamicGuardCount = 0;
let currentOriginCount = 0;

for (const filePath of files) {
  let source = fs.readFileSync(filePath, "utf8");
  const original = source;

  /*
   * Replace stale private-network Vite origins with the machine's
   * current LAN origin. Localhost and 127.0.0.1 are preserved.
   */
  source = source.replace(
    /http:\/\/(?!(?:localhost|127\.0\.0\.1))(?:(?:10|192\.168|172\.(?:1[6-9]|2\d|3[01]))(?:\.\d{1,3}){1,3}):5173/g,
    currentOrigin
  );

  const usesOriginIncludes =
    /\b[A-Za-z_$][\w$]*(?:Origins?|ORIGINS?)\s*\.\s*includes\s*\(\s*(?:origin|requestOrigin|clientOrigin)\s*\)/.test(
      source
    );

  if (usesOriginIncludes) {
    const relativeImport = path
      .relative(
        path.dirname(filePath),
        path.join(
          serverRoot,
          "config/developmentOrigins.js"
        )
      )
      .replaceAll("\\", "/");

    const normalizedImport =
      relativeImport.startsWith(".")
        ? relativeImport
        : `./${relativeImport}`;

    const importLine =
      `import { isPrivateDevelopmentOrigin } from "${normalizedImport}";`;

    if (!source.includes(importLine)) {
      const imports = [
        ...source.matchAll(/^import .*;$/gm),
      ];

      if (imports.length) {
        const last = imports.at(-1);
        const insertAt =
          last.index + last[0].length;

        source =
          source.slice(0, insertAt) +
          `\n${importLine}` +
          source.slice(insertAt);
      } else {
        source =
          `${importLine}\n${source}`;
      }
    }

    source = source.replace(
      /\b((?:[A-Za-z_$][\w$]*\.)*[A-Za-z_$][\w$]*(?:Origins?|ORIGINS?))\s*\.\s*includes\s*\(\s*(origin|requestOrigin|clientOrigin)\s*\)/g,
      "($1.includes($2) || isPrivateDevelopmentOrigin($2))"
    );

    dynamicGuardCount += 1;
  }

  /*
   * Add the current origin to common literal origin arrays when the
   * project uses a static list but no includes(origin) callback appears.
   */
  if (
    !source.includes(currentOrigin) &&
    /(?:allowedOrigins|clientOrigins|corsOrigins)\s*=\s*\[/.test(
      source
    )
  ) {
    source = source.replace(
      /((?:allowedOrigins|clientOrigins|corsOrigins)\s*=\s*\[)/,
      `$1\n  "${currentOrigin}",`
    );
  }

  if (source.includes(currentOrigin)) {
    currentOriginCount += 1;
  }

  if (source !== original) {
    fs.writeFileSync(filePath, source, "utf8");
    modifiedCount += 1;

    console.log(
      `Updated ${path.relative(root, filePath)}`
    );
  }
}

if (
  modifiedCount === 0 &&
  currentOriginCount === 0
) {
  throw new Error(
    "No server CORS/origin configuration could be updated."
  );
}

console.log(
  `Server origin files modified: ${modifiedCount}`
);
console.log(
  `Dynamic private-LAN guards connected: ${dynamicGuardCount}`
);
console.log(
  `Files containing current origin: ${currentOriginCount}`
);
