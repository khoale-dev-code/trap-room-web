
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const requiredFiles = [
  "src/admin/features/work-schedule/WorkSchedulePage.jsx",
  "src/admin/features/work-schedule/components/ScheduleHeader.jsx",
  "src/admin/features/work-schedule/components/EmployeeFilters.jsx",
  "src/admin/features/work-schedule/components/ScheduleGrid.jsx",
  "src/admin/features/work-schedule/components/ShiftCard.jsx",
  "src/admin/features/work-schedule/components/ShiftEditorSheet.jsx",
  "src/admin/features/work-schedule/hooks/useWorkSchedule.js",
  "src/admin/features/work-schedule/hooks/useShiftDrag.js",
  "src/admin/features/work-schedule/services/workScheduleApi.js",
  "src/admin/features/work-schedule/utils/dateTime.js",
  "src/admin/features/work-schedule/utils/schedule.js",
  "src/admin/features/work-schedule/workSchedule.css",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    errors.push(`Missing file: ${file}`);
  }
}

const managerCandidates = [
  "src/admin/pages/operations/WorkScheduleManager.jsx",
  "src/admin/WorkScheduleManager.jsx",
];

const managerPath = managerCandidates.find((candidate) =>
  fs.existsSync(path.join(root, candidate))
);

if (!managerPath) {
  errors.push("WorkScheduleManager.jsx was not found.");
} else {
  const source = fs.readFileSync(path.join(root, managerPath), "utf8");

  if (!source.includes("features/work-schedule/WorkSchedulePage.jsx")) {
    errors.push("WorkScheduleManager.jsx is not a thin feature entry point.");
  }

  if (source.split("\n").length > 5) {
    errors.push("WorkScheduleManager.jsx is still too large.");
  }
}

const pagePath = path.join(
  root,
  "src/admin/features/work-schedule/WorkSchedulePage.jsx"
);

if (fs.existsSync(pagePath)) {
  const source = fs.readFileSync(pagePath, "utf8");

  for (const expected of [
    "useWorkSchedule",
    "useShiftDrag",
    "ScheduleGrid",
    "ShiftEditorSheet",
    "data-work-schedule-page",
  ]) {
    if (!source.includes(expected)) {
      errors.push(`WorkSchedulePage.jsx is missing: ${expected}`);
    }
  }
}

const cssPath = path.join(
  root,
  "src/admin/features/work-schedule/workSchedule.css"
);

if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, "utf8");

  for (const expected of [
    "touch-action: pan-y",
    "100dvh",
    "env(safe-area-inset-bottom)",
    "-webkit-overflow-scrolling: touch",
    "@media (max-width: 767px)",
  ]) {
    if (!css.includes(expected)) {
      errors.push(`workSchedule.css is missing: ${expected}`);
    }
  }
}

if (errors.length) {
  console.error("Work Schedule Clean V12 check failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Work Schedule Clean V12 check passed.");
