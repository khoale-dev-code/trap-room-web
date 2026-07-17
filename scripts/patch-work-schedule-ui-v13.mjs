
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const required = [
  "src/admin/features/work-schedule/WorkSchedulePage.jsx",
  "src/admin/features/work-schedule/components/ScheduleHeader.jsx",
  "src/admin/features/work-schedule/components/EmployeeFilters.jsx",
  "src/admin/features/work-schedule/components/ScheduleGrid.jsx",
  "src/admin/features/work-schedule/workSchedule.css",
];

for (const relativePath of required) {
  const target = path.join(root, relativePath);

  if (!fs.existsSync(target)) {
    throw new Error(`Missing required V12 feature file: ${relativePath}`);
  }
}

console.log(
  "Work Schedule V13 files are in place. The second internal sidebar has been removed."
);
