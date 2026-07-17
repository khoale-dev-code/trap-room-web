
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const patcherPath = path.join(
  root,
  "scripts/patch-admin-api-403-origin-v18.mjs"
);

if (!fs.existsSync(patcherPath)) {
  console.log(
    "The V18 patcher is not present; no recurrence guard was needed."
  );
  process.exit(0);
}

let source = fs.readFileSync(
  patcherPath,
  "utf8"
);

const oldRegexText =
  String.raw`/\b([A-Za-z_$][\w$]*(?:Origins?|ORIGINS?))\s*\.\s*includes\s*\(\s*(origin|requestOrigin|clientOrigin)\s*\)/g`;

const newRegexText =
  String.raw`/\b((?:[A-Za-z_$][\w$]*\.)*[A-Za-z_$][\w$]*(?:Origins?|ORIGINS?))\s*\.\s*includes\s*\(\s*(origin|requestOrigin|clientOrigin)\s*\)/g`;

if (source.includes(oldRegexText)) {
  source = source.replace(
    oldRegexText,
    newRegexText
  );

  fs.writeFileSync(
    patcherPath,
    source,
    "utf8"
  );

  console.log(
    "Updated the V18 patcher so object paths such as env.clientOrigins are preserved."
  );
} else {
  console.log(
    "The V18 patcher no longer contains the unsafe origin regex."
  );
}
