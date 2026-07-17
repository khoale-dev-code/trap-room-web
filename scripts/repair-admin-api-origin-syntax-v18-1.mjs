
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const serverRoot = path.join(root, "server");

if (!fs.existsSync(serverRoot)) {
  throw new Error("The server directory was not found.");
}

const extensions = new Set([
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
      extensions.has(
        path.extname(entry.name).toLowerCase()
      )
    ) {
      files.push(absolute);
    }
  }
}

walk(serverRoot);

const malformedPattern =
  /\b([A-Za-z_$][\w$]*)\s*\.\s*\(\s*([A-Za-z_$][\w$]*(?:Origins?|ORIGINS?))\s*\.\s*includes\s*\(\s*(origin|requestOrigin|clientOrigin)\s*\)\s*\|\|\s*isPrivateDevelopmentOrigin\s*\(\s*\3\s*\)\s*\)/g;

let repairedFiles = 0;
let repairedOccurrences = 0;

for (const filePath of files) {
  const original = fs.readFileSync(filePath, "utf8");
  let count = 0;

  const repaired = original.replace(
    malformedPattern,
    (
      _match,
      objectName,
      originsName,
      originVariable
    ) => {
      count += 1;

      return (
        `(${objectName}.${originsName}.includes(${originVariable}) ` +
        `|| isPrivateDevelopmentOrigin(${originVariable}))`
      );
    }
  );

  if (count > 0) {
    fs.writeFileSync(filePath, repaired, "utf8");
    repairedFiles += 1;
    repairedOccurrences += count;

    console.log(
      `Repaired ${count} malformed origin check(s) in ` +
      path.relative(root, filePath)
    );
  }
}

const indexPath = path.join(
  root,
  "server/index.js"
);

if (!fs.existsSync(indexPath)) {
  throw new Error("Missing server/index.js");
}

const indexSource = fs.readFileSync(indexPath, "utf8");

if (
  /env\s*\.\s*\(\s*clientOrigins\s*\.\s*includes/.test(
    indexSource
  )
) {
  throw new Error(
    "server/index.js still contains env.(clientOrigins.includes(...))."
  );
}

if (
  !indexSource.includes(
    "isPrivateDevelopmentOrigin(origin)"
  )
) {
  throw new Error(
    "server/index.js is missing isPrivateDevelopmentOrigin(origin)."
  );
}

if (repairedOccurrences === 0) {
  console.log(
    "No malformed origin expression remained; server/index.js was already repaired."
  );
}

console.log(
  `Repair summary: ${repairedOccurrences} occurrence(s) across ${repairedFiles} file(s).`
);
