
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const pluginPath = path.join(
  root,
  "scripts/vite-api-readiness-plugin.mjs"
);

if (!fs.existsSync(pluginPath)) {
  errors.push(
    "Missing scripts/vite-api-readiness-plugin.mjs"
  );
} else {
  const source = fs.readFileSync(
    pluginPath,
    "utf8"
  );

  for (const expected of [
    'name: "trap-api-readiness"',
    'url.startsWith("/api/")',
    "waitForTcp",
    "127.0.0.1",
    "4000",
    "response.statusCode = 503",
  ]) {
    if (!source.includes(expected)) {
      errors.push(
        `Readiness plugin is missing: ${expected}`
      );
    }
  }
}

const configCandidates = [
  "vite.config.js",
  "vite.config.mjs",
  "vite.config.ts",
  "vite.config.mts",
];

const configPath = configCandidates
  .map((candidate) =>
    path.join(root, candidate)
  )
  .find((candidate) =>
    fs.existsSync(candidate)
  );

if (!configPath) {
  errors.push("Vite config was not found.");
} else {
  const source = fs.readFileSync(
    configPath,
    "utf8"
  );

  for (const expected of [
    "vite-api-readiness-plugin.mjs",
    "apiReadinessPlugin()",
  ]) {
    if (!source.includes(expected)) {
      errors.push(
        `${path.basename(configPath)} is missing: ${expected}`
      );
    }
  }
}

if (errors.length) {
  console.error(
    "API readiness V17 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "API readiness V17 check passed."
);
