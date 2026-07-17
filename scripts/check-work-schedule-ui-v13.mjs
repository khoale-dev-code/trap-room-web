
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const target = path.join(root, relativePath);

  if (!fs.existsSync(target)) {
    errors.push(`Missing file: ${relativePath}`);
    return "";
  }

  return fs.readFileSync(target, "utf8");
}

const page = read(
  "src/admin/features/work-schedule/WorkSchedulePage.jsx"
);
const filters = read(
  "src/admin/features/work-schedule/components/EmployeeFilters.jsx"
);
const header = read(
  "src/admin/features/work-schedule/components/ScheduleHeader.jsx"
);
const css = read(
  "src/admin/features/work-schedule/workSchedule.css"
);

for (const expected of [
  "ScheduleHeader",
  "EmployeeFilters",
  "ScheduleGrid",
  "commitMove",
  "data-work-schedule-page",
]) {
  if (!page.includes(expected)) {
    errors.push(`WorkSchedulePage.jsx is missing: ${expected}`);
  }
}

if (page.includes("<section className=\"ws-stats\">")) {
  errors.push("The old large statistics row still exists.");
}

for (const expected of [
  "ws-filter-row",
  "ws-filter-search",
  "ws-filter-chips",
]) {
  if (!filters.includes(expected)) {
    errors.push(`EmployeeFilters.jsx is missing: ${expected}`);
  }
}

for (const expected of [
  "ws-calendar-topbar",
  "ws-calendar-controls",
  "ws-calendar-summary",
]) {
  if (!header.includes(expected)) {
    errors.push(`ScheduleHeader.jsx is missing: ${expected}`);
  }
}

for (const expected of [
  ".ws-filter-row",
  ".ws-calendar-panel",
  "minmax(7.5rem, 1fr)",
  "position: sticky",
  "100dvh",
  "env(safe-area-inset-bottom)",
  "-webkit-overflow-scrolling: touch",
]) {
  if (!css.includes(expected)) {
    errors.push(`workSchedule.css is missing: ${expected}`);
  }
}

if (errors.length) {
  console.error("Work Schedule V13 check failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Work Schedule V13 check passed.");
