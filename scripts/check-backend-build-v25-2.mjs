import fs from "node:fs";
import path from "node:path";
import {
  spawnSync,
} from "node:child_process";

const root = process.cwd();
const serverRoot =
  path.join(root, "server");

if (!fs.existsSync(serverRoot)) {
  console.error(
    "Missing server directory."
  );
  process.exit(1);
}

const files = [];

function walk(directory) {
  for (
    const entry of
    fs.readdirSync(
      directory,
      {
        withFileTypes: true,
      }
    )
  ) {
    const target =
      path.join(
        directory,
        entry.name
      );

    if (entry.isDirectory()) {
      walk(target);
      continue;
    }

    if (
      entry.isFile() &&
      /\.(?:js|mjs|cjs)$/i.test(
        entry.name
      )
    ) {
      files.push(target);
    }
  }
}

walk(serverRoot);

const failures = [];

for (const file of files) {
  const result = spawnSync(
    process.execPath,
    ["--check", file],
    {
      cwd: root,
      encoding: "utf8",
    }
  );

  if (result.status !== 0) {
    failures.push({
      file:
        path.relative(root, file),
      output:
        result.stderr ||
        result.stdout ||
        "Unknown syntax error",
    });
  }
}

if (failures.length) {
  console.error(
    "Backend syntax validation failed:\n"
  );

  for (const failure of failures) {
    console.error(
      `--- ${failure.file} ---`
    );
    console.error(
      failure.output.trim()
    );
  }

  process.exit(1);
}

console.log(
  `Backend syntax validation passed (${files.length} files).`
);
