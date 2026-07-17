
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const candidates = [
  "vite.config.js",
  "vite.config.mjs",
  "vite.config.ts",
  "vite.config.mts",
];

const configPath = candidates
  .map((candidate) =>
    path.join(root, candidate)
  )
  .find((candidate) =>
    fs.existsSync(candidate)
  );

if (!configPath) {
  throw new Error(
    "Could not find vite.config.js, vite.config.mjs, vite.config.ts or vite.config.mts."
  );
}

let source = fs.readFileSync(
  configPath,
  "utf8"
);

const importLine =
  'import apiReadinessPlugin from "./scripts/vite-api-readiness-plugin.mjs";';

if (!source.includes(importLine)) {
  const imports = [
    ...source.matchAll(
      /^import[\s\S]*?;$/gm
    ),
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

if (
  !source.includes(
    "apiReadinessPlugin()"
  )
) {
  const pluginsMatch =
    /plugins\s*:\s*\[/.exec(
      source
    );

  if (pluginsMatch) {
    const insertAt =
      pluginsMatch.index +
      pluginsMatch[0].length;

    source =
      source.slice(0, insertAt) +
      "\n      apiReadinessPlugin()," +
      source.slice(insertAt);
  } else {
    const defineConfigMatch =
      /defineConfig\s*\(\s*\{/.exec(
        source
      );

    if (!defineConfigMatch) {
      throw new Error(
        "Could not locate defineConfig({ ... }) in the Vite config."
      );
    }

    const insertAt =
      defineConfigMatch.index +
      defineConfigMatch[0].length;

    source =
      source.slice(0, insertAt) +
      "\n  plugins: [apiReadinessPlugin()]," +
      source.slice(insertAt);
  }
}

fs.writeFileSync(
  configPath,
  source,
  "utf8"
);

console.log(
  `Connected API readiness middleware in ${path.basename(configPath)}.`
);
