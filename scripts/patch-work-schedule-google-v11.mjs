import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const candidates = [
  "src/admin/pages/operations/WorkScheduleManager.jsx",
  "src/admin/WorkScheduleManager.jsx",
];
const managerPath = candidates.find((candidate) => fs.existsSync(path.join(root, candidate)));
if (!managerPath) throw new Error("Could not find WorkScheduleManager.jsx.");

const managerAbs = path.join(root, managerPath);
const apiAbs = path.join(root, "src/lib/api.js");
const i18nAbs = path.join(root, "src/i18n/I18nProvider.jsx");
const cssAbs = path.join(root, "src/admin/styles/work-schedule-google-v11.css");
const templateAbs = path.join(root, "scripts/templates/WorkScheduleManager.v11.jsx");

for (const required of [apiAbs, i18nAbs, cssAbs, templateAbs]) {
  if (!fs.existsSync(required)) throw new Error(`Missing required file: ${path.relative(root, required)}`);
}

function relativeImport(fromFile, targetFile) {
  let value = path.relative(path.dirname(fromFile), targetFile).replaceAll("\\", "/");
  if (!value.startsWith(".")) value = `./${value}`;
  return value;
}

const template = fs.readFileSync(templateAbs, "utf8");
const output = template
  .replace("__API_IMPORT__", relativeImport(managerAbs, apiAbs))
  .replace("__I18N_IMPORT__", relativeImport(managerAbs, i18nAbs))
  .replace("__CSS_IMPORT__", relativeImport(managerAbs, cssAbs));

fs.writeFileSync(managerAbs, output, "utf8");
console.log(`Replaced ${managerPath} with Work Schedule V11.`);
