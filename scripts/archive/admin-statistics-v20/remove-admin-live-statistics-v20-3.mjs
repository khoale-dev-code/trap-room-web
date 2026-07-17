
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mainPath = path.join(root, "src/main.jsx");

if (!fs.existsSync(mainPath)) {
  throw new Error("Missing src/main.jsx");
}

let source = fs.readFileSync(mainPath, "utf8");
const original = source;

/*
 * Remove every side-effect import that starts the DOM-mutating live statistics
 * runtime. React must remain the only owner of nodes under #root.
 */
source = source.replace(
  /^\s*import\s+["'][^"']*admin\/features\/live-statistics\/index\.js["'];?\s*$/gm,
  ""
);

source = source.replace(
  /^\s*import\s+["'][^"']*features\/live-statistics\/index\.js["'];?\s*$/gm,
  ""
);

source = source
  .replace(/\n{3,}/g, "\n\n")
  .trimStart();

fs.writeFileSync(mainPath, source, "utf8");

if (source === original) {
  console.log(
    "No live statistics import remained in src/main.jsx."
  );
} else {
  console.log(
    "Removed the live statistics side-effect import from src/main.jsx."
  );
}
