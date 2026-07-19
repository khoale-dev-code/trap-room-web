import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const relativePath = "index.html";
const absolutePath =
  path.join(root, relativePath);

if (!fs.existsSync(absolutePath)) {
  throw new Error(
    "Required file is missing: index.html"
  );
}

let source =
  fs.readFileSync(
    absolutePath,
    "utf8"
  );

const marker =
  '    <script>\n      document.documentElement.classList.add("js");\n    </script>';

const bootScript = [
  "    <script>",
  "      if (",
  '        "scrollRestoration" in window.history',
  "      ) {",
  "        window.history.scrollRestoration =",
  '          "manual";',
  "      }",
  "    </script>",
].join("\n");

if (
  !source.includes(
    "window.history.scrollRestoration"
  )
) {
  const markerIndex =
    source.indexOf(marker);

  if (markerIndex < 0) {
    throw new Error(
      "Could not locate the existing index.html boot script."
    );
  }

  source =
    source.slice(
      0,
      markerIndex
    ) +
    bootScript +
    "\n" +
    source.slice(
      markerIndex
    );
}

fs.writeFileSync(
  absolutePath,
  source,
  "utf8"
);

console.log(
  "index.html scroll restoration boot guard is ready."
);
