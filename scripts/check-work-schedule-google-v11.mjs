import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const candidates = [
  "src/admin/pages/operations/WorkScheduleManager.jsx",
  "src/admin/WorkScheduleManager.jsx",
];
const managerPath = candidates.find((candidate) => fs.existsSync(path.join(root, candidate)));

if (!managerPath) {
  errors.push("WorkScheduleManager.jsx was not found.");
} else {
  const source = fs.readFileSync(path.join(root, managerPath), "utf8");
  for (const expected of [
    "data-work-calendar",
    "work-calendar-board",
    "pointerDown",
    "pointerMove",
    "pointerUp",
    "swipeStart",
    "swipeEnd",
    "createPortal",
    "/work-shifts",
    "/employees",
    "work-schedule-google-v11.css",
  ]) {
    if (!source.includes(expected)) errors.push(`${managerPath} is missing: ${expected}`);
  }
  if (/<\s+size=\{/.test(source)) errors.push(`${managerPath} contains malformed JSX.`);
}

const cssPath = path.join(root, "src/admin/styles/work-schedule-google-v11.css");
if (!fs.existsSync(cssPath)) {
  errors.push("work-schedule-google-v11.css is missing.");
} else {
  const css = fs.readFileSync(cssPath, "utf8");
  for (const expected of [
    ".work-calendar-day-header",
    ".work-calendar-shift",
    "touch-action: pan-y",
    ".admin-schedule-dragging",
    "@media (max-width: 47.999rem)",
    "-webkit-overflow-scrolling: touch",
  ]) {
    if (!css.includes(expected)) errors.push(`Work Schedule CSS is missing: ${expected}`);
  }
}

const modelPath = path.join(root, "server/models/WorkShift.js");
if (fs.existsSync(modelPath)) {
  const model = fs.readFileSync(modelPath, "utf8");
  for (const expected of ["date:", "startTime:", "endTime:", "employeeIds:", "requiredStaff:"]) {
    if (!model.includes(expected)) errors.push(`WorkShift model is missing: ${expected}`);
  }
}

if (errors.length) {
  console.error("Work Schedule V11 check failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log("Work Schedule V11 check passed.");
