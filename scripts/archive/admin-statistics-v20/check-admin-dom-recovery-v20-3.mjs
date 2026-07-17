
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const mainPath = path.join(root, "src/main.jsx");

if (!fs.existsSync(mainPath)) {
  errors.push("Missing src/main.jsx");
} else {
  const source = fs.readFileSync(mainPath, "utf8");

  if (
    source.includes(
      "features/live-statistics/index.js"
    )
  ) {
    errors.push(
      "src/main.jsx still imports the DOM-mutating live statistics runtime."
    );
  }
}

const runtimePath = path.join(
  root,
  "src/admin/features/live-statistics/runtime/adminLiveStatisticsRuntime.js"
);

if (fs.existsSync(runtimePath)) {
  errors.push(
    "The live statistics runtime folder still exists."
  );
}

if (errors.length) {
  console.error(
    "Admin DOM Recovery V20.3 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Admin DOM Recovery V20.3 check passed."
);
