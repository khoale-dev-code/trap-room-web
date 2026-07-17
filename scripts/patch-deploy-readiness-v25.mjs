import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function filePath(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  const target = filePath(relativePath);

  if (!fs.existsSync(target)) {
    throw new Error(
      `Required file is missing: ${relativePath}`
    );
  }

  return fs.readFileSync(target, "utf8");
}

function write(relativePath, source) {
  fs.writeFileSync(
    filePath(relativePath),
    source,
    "utf8"
  );

  console.log(`Updated ${relativePath}`);
}

function patchPackageJson() {
  const relativePath = "package.json";
  const packageJson = JSON.parse(
    read(relativePath)
  );

  packageJson.scripts ||= {};
  packageJson.scripts.start =
    "node server/index.js";
  packageJson.scripts["deploy:check"] =
    "node scripts/check-deploy-readiness-v25.mjs && vite build";
  packageJson.scripts["deploy:smoke"] =
    "node scripts/smoke-test-deployment-v25.mjs";

  packageJson.engines ||= {};
  packageJson.engines.node = "22.x";

  write(
    relativePath,
    `${JSON.stringify(
      packageJson,
      null,
      2
    )}\n`
  );
}

function patchEnvironment() {
  const relativePath =
    "server/config/env.js";

  let source = read(relativePath);

  if (
    !source.includes(
      "process.env.CLIENT_ORIGINS"
    )
  ) {
    source = source.replace(
      /process\.env\.CLIENT_ORIGIN\s*\|\|/g,
      "process.env.CLIENT_ORIGINS ||\n    process.env.CLIENT_ORIGIN ||"
    );
  }

  if (
    !source.includes(
      "serveFrontend:"
    )
  ) {
    const marker =
      /(\s+mongodbUri\s*:)/;

    if (!marker.test(source)) {
      throw new Error(
        "Could not locate mongodbUri in server/config/env.js."
      );
    }

    source = source.replace(
      marker,
      `
  serveFrontend:
    String(
      process.env.SERVE_FRONTEND || "false"
    ).toLowerCase() === "true",
  allowVercelPreviews:
    String(
      process.env.ALLOW_VERCEL_PREVIEWS || "false"
    ).toLowerCase() === "true",
$1`
    );
  } else if (
    !source.includes(
      "allowVercelPreviews:"
    )
  ) {
    source = source.replace(
      /(\s+serveFrontend\s*:[\s\S]*?,\s*)(\n\s+[A-Za-z_$][\w$]*\s*:)/,
      `$1
  allowVercelPreviews:
    String(
      process.env.ALLOW_VERCEL_PREVIEWS || "false"
    ).toLowerCase() === "true",$2`
    );
  }

  if (
    source.includes(
      'cookieName: "trap_admin_token"'
    )
  ) {
    source = source.replace(
      'cookieName: "trap_admin_token"',
      'cookieName:\n      process.env.ADMIN_COOKIE_NAME ||\n      "trap_admin_token"'
    );
  }

  if (
    !source.includes(
      "process.env.PORT"
    ) ||
    !source.includes(
      "CLIENT_ORIGINS"
    ) ||
    !source.includes(
      "serveFrontend:"
    )
  ) {
    throw new Error(
      "Environment deployment fields were not connected safely."
    );
  }

  write(relativePath, source);
}

function patchServerIndex() {
  const relativePath =
    "server/index.js";

  let source = read(relativePath);

  if (
    !source.includes(
      'app.set("trust proxy", 1);'
    )
  ) {
    const marker =
      'app.disable("x-powered-by");';

    if (!source.includes(marker)) {
      throw new Error(
        "Could not locate the Express security setup."
      );
    }

    source = source.replace(
      marker,
      `${marker}
app.set("trust proxy", 1);`
    );
  }

  if (
    !source.includes(
      "function isAllowedClientOrigin("
    )
  ) {
    const corsMarker =
      "app.use(\n  cors({";

    if (!source.includes(corsMarker)) {
      throw new Error(
        "Could not locate the Express CORS middleware."
      );
    }

    const helper = `function isAllowedClientOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (env.clientOrigins.includes(origin)) {
    return true;
  }

  if (isPrivateDevelopmentOrigin(origin)) {
    return true;
  }

  if (!env.allowVercelPreviews) {
    return false;
  }

  try {
    const url = new URL(origin);

    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

`;

    source = source.replace(
      corsMarker,
      helper + corsMarker
    );
  }

  source = source.replace(
    /if\s*\(\s*!origin\s*\|\|\s*\(\s*env\.clientOrigins\.includes\(origin\)\s*\|\|\s*isPrivateDevelopmentOrigin\(origin\)\s*\)\s*\)/g,
    "if (isAllowedClientOrigin(origin))"
  );

  source = source.replace(
    /if\s*\(\s*!origin\s*\|\|\s*env\.clientOrigins\.includes\(origin\)\s*\|\|\s*isPrivateDevelopmentOrigin\(origin\)\s*\)/g,
    "if (isAllowedClientOrigin(origin))"
  );

  if (
    !source.includes(
      "isAllowedClientOrigin(origin)"
    )
  ) {
    throw new Error(
      "The deployment-safe CORS origin guard was not connected."
    );
  }

  source = source.replace(
    /if\s*\(\s*env\.nodeEnv\s*===\s*["']production["']\s*\)\s*\{/,
    'if (\n  env.nodeEnv === "production" &&\n  env.serveFrontend\n) {'
  );

  if (
    !source.includes(
      "env.serveFrontend"
    )
  ) {
    throw new Error(
      "The backend-only production guard was not connected."
    );
  }

  const listensOnRailwayPort =
    /app\.listen\(\s*env\.port\s*,\s*["']0\.0\.0\.0["']/m.test(
      source
    ) ||
    /app\.listen\(\s*(?:port|PORT)\s*,\s*["']0\.0\.0\.0["']/m.test(
      source
    );

  if (!listensOnRailwayPort) {
    source = source.replace(
      /app\.listen\(\s*env\.port\s*,\s*\(\s*\)\s*=>/,
      'app.listen(env.port, "0.0.0.0", () =>'
    );
  }

  const verifiedListen =
    /app\.listen\(\s*env\.port\s*,\s*["']0\.0\.0\.0["']/m.test(
      source
    ) ||
    /app\.listen\(\s*(?:port|PORT)\s*,\s*["']0\.0\.0\.0["']/m.test(
      source
    );

  if (!verifiedListen) {
    throw new Error(
      'server/index.js must listen on "0.0.0.0" using env.port or PORT.'
    );
  }

  if (
    !source.includes(
      'app.get("/api/health"'
    ) &&
    !source.includes(
      'app.get("/api/v1/health"'
    )
  ) {
    throw new Error(
      "A Railway health-check endpoint is missing."
    );
  }

  write(relativePath, source);
}

patchPackageJson();
patchEnvironment();
patchServerIndex();

console.log(
  "TRAP Room deployment source patch V25 completed."
);
