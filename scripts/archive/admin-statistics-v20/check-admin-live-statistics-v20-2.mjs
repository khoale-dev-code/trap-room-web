
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const required = [
  "src/admin/features/live-statistics/index.js",
  "src/admin/features/live-statistics/api/liveStatisticsApi.js",
  "src/admin/features/live-statistics/runtime/adminLiveStatisticsRuntime.js",
  "src/admin/features/live-statistics/utils/statistics.js",
  "src/main.jsx",
];

for (
  const relativePath of
  required
) {
  if (
    !fs.existsSync(
      path.join(
        root,
        relativePath
      )
    )
  ) {
    errors.push(
      `Missing file: ${relativePath}`
    );
  }
}

const mainPath =
  path.join(
    root,
    "src/main.jsx"
  );

if (
  fs.existsSync(mainPath)
) {
  const source =
    fs.readFileSync(
      mainPath,
      "utf8"
    );

  if (
    !source.includes(
      'admin/features/live-statistics/index.js'
    )
  ) {
    errors.push(
      "src/main.jsx does not load the live statistics runtime."
    );
  }
}

const runtimePath =
  path.join(
    root,
    "src/admin/features/live-statistics/runtime/adminLiveStatisticsRuntime.js"
  );

if (
  fs.existsSync(runtimePath)
) {
  const source =
    fs.readFileSync(
      runtimePath,
      "utf8"
    );

  for (
    const expected of
    [
      "MutationObserver",
      "fetchLiveCollection",
      "buildStatistics",
      "applyStatisticCards",
      "applyShowingText",
      "setInterval",
      "trap:admin-data-changed",
    ]
  ) {
    if (
      !source.includes(
        expected
      )
    ) {
      errors.push(
        `Runtime is missing: ${expected}`
      );
    }
  }
}

if (errors.length) {
  console.error(
    "Admin Live Statistics V20.2 check failed:\n"
  );

  errors.forEach(
    (error) =>
      console.error(
        `- ${error}`
      )
  );

  process.exit(1);
}

console.log(
  "Admin Live Statistics V20.2 check passed."
);
