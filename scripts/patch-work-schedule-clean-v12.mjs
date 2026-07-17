
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const candidates = [
  "src/admin/pages/operations/WorkScheduleManager.jsx",
  "src/admin/WorkScheduleManager.jsx",
];

const managerPath = candidates.find((candidate) =>
  fs.existsSync(path.join(root, candidate))
);

if (!managerPath) {
  throw new Error("WorkScheduleManager.jsx was not found.");
}

const relativeTarget = managerPath.includes("/pages/operations/")
  ? "../../features/work-schedule/WorkSchedulePage.jsx"
  : "./features/work-schedule/WorkSchedulePage.jsx";

fs.writeFileSync(
  path.join(root, managerPath),
  `export { default } from "${relativeTarget}";\n`,
  "utf8"
);

console.log(
  `Replaced ${managerPath} with a thin feature entry point.`
);
