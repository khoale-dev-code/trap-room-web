
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const indexPath = path.join(
  root,
  "server/index.js"
);

if (!fs.existsSync(indexPath)) {
  errors.push("Missing server/index.js");
} else {
  const source = fs.readFileSync(
    indexPath,
    "utf8"
  );

  const forbiddenPatterns = [
    /env\s*\.\s*\(/,
    /clientOrigins\s*\.\s*includes\s*\([^)]*\)\s*\|\|\s*isPrivateDevelopmentOrigin[^;\n]*\)\s*\)/,
  ];

  if (forbiddenPatterns[0].test(source)) {
    errors.push(
      "server/index.js still contains an invalid env.(...) expression."
    );
  }

  if (
    !/env\s*\.\s*clientOrigins\s*\.\s*includes\s*\(\s*origin\s*\)/.test(
      source
    )
  ) {
    errors.push(
      "server/index.js is missing env.clientOrigins.includes(origin)."
    );
  }

  if (
    !/isPrivateDevelopmentOrigin\s*\(\s*origin\s*\)/.test(
      source
    )
  ) {
    errors.push(
      "server/index.js is missing isPrivateDevelopmentOrigin(origin)."
    );
  }
}

const developmentOriginsPath = path.join(
  root,
  "server/config/developmentOrigins.js"
);

if (
  !fs.existsSync(
    developmentOriginsPath
  )
) {
  errors.push(
    "Missing server/config/developmentOrigins.js"
  );
}

if (errors.length) {
  console.error(
    "Admin API Origin Syntax V18.1 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Admin API Origin Syntax V18.1 check passed."
);
