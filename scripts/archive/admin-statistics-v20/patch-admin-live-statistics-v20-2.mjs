
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mainPath = path.join(
  root,
  "src/main.jsx"
);

if (!fs.existsSync(mainPath)) {
  throw new Error(
    "Missing src/main.jsx"
  );
}

let source =
  fs.readFileSync(
    mainPath,
    "utf8"
  );

const importLine =
  'import "./admin/features/live-statistics/index.js";';

if (!source.includes(importLine)) {
  const imports = [
    ...source.matchAll(
      /^import[\s\S]*?;$/gm
    ),
  ];

  if (imports.length > 0) {
    const last =
      imports.at(-1);

    const insertAt =
      last.index +
      last[0].length;

    source =
      source.slice(
        0,
        insertAt
      ) +
      `\n${importLine}` +
      source.slice(
        insertAt
      );
  } else {
    source =
      `${importLine}\n${source}`;
  }
}

fs.writeFileSync(
  mainPath,
  source,
  "utf8"
);

console.log(
  "Connected Admin live statistics runtime in src/main.jsx."
);
