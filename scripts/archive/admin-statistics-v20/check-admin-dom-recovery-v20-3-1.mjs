
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const mainPath = path.join(root, "src/main.jsx");

if (!fs.existsSync(mainPath)) {
  errors.push("Missing src/main.jsx");
} else {
  const source = fs.readFileSync(mainPath, "utf8");

  if (
    source.includes(
      "features/live-statistics/index.js"
    )
  ) {
    errors.push(
      "src/main.jsx still imports the removed live statistics runtime."
    );
  }
}

const runtimeFolder = path.join(
  root,
  "src/admin/features/live-statistics"
);

if (fs.existsSync(runtimeFolder)) {
  errors.push(
    "src/admin/features/live-statistics still exists."
  );
}

const sourceRoot = path.join(root, "src");
const extensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
]);

function walk(directory) {
  if (!fs.existsSync(directory)) {
    return;
  }

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    const absolute = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(absolute);
      continue;
    }

    if (
      !extensions.has(
        path.extname(entry.name).toLowerCase()
      )
    ) {
      continue;
    }

    const source = fs.readFileSync(absolute, "utf8");

    if (
      source.includes(
        "features/live-statistics"
      )
    ) {
      errors.push(
        `Stale live-statistics reference: ${path.relative(root, absolute)}`
      );
    }
  }
}

walk(sourceRoot);

if (errors.length) {
  console.error(
    "Admin DOM Recovery V20.3.1 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Admin DOM Recovery V20.3.1 check passed."
);
