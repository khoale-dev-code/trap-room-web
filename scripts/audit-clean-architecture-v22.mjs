import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const reportDirectory =
  path.join(root, "reports");

fs.mkdirSync(reportDirectory, {
  recursive: true,
});

const sourceExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
]);

const ignoredDirectories = new Set([
  "node_modules",
  "dist",
  ".git",
  ".vite",
  "coverage",
  "trap-room-backups",
]);

function walk(directory) {
  const result = [];

  if (!fs.existsSync(directory)) {
    return result;
  }

  for (
    const entry of
    fs.readdirSync(directory, {
      withFileTypes: true,
    })
  ) {
    if (
      entry.isDirectory() &&
      ignoredDirectories.has(entry.name)
    ) {
      continue;
    }

    const absolute =
      path.join(directory, entry.name);

    if (entry.isDirectory()) {
      result.push(...walk(absolute));
      continue;
    }

    if (
      sourceExtensions.has(
        path.extname(entry.name)
          .toLowerCase()
      )
    ) {
      result.push(absolute);
    }
  }

  return result;
}

function relative(filePath) {
  return path
    .relative(root, filePath)
    .replaceAll("\\", "/");
}

function read(relativePath) {
  const absolute =
    path.join(root, relativePath);

  return fs.existsSync(absolute)
    ? fs.readFileSync(absolute, "utf8")
    : "";
}

function resolveImport(
  filePath,
  specifier
) {
  if (!specifier.startsWith(".")) {
    return true;
  }

  const base = path.resolve(
    path.dirname(filePath),
    specifier
  );

  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    `${base}.cjs`,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.js"),
    path.join(base, "index.jsx"),
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];

  return candidates.some(
    (candidate) =>
      fs.existsSync(candidate)
  );
}

const findings = [];
const warnings = [];
const passed = [];

function finding(
  id,
  severity,
  message,
  files = []
) {
  findings.push({
    id,
    severity,
    message,
    files,
  });
}

const allSourceFiles = [
  ...walk(path.join(root, "src")),
  ...walk(path.join(root, "server")),
];

const brokenImports = [];

for (const filePath of allSourceFiles) {
  const source =
    fs.readFileSync(filePath, "utf8");

  const patterns = [
    /^\s*import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/gm,
    /^\s*export\s+[\s\S]*?\s+from\s+["']([^"']+)["']/gm,
    /import\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (
      const match of
      source.matchAll(pattern)
    ) {
      const specifier = match[1];

      if (
        specifier?.startsWith(".") &&
        !resolveImport(
          filePath,
          specifier
        )
      ) {
        brokenImports.push({
          file: relative(filePath),
          specifier,
        });
      }
    }
  }
}

if (brokenImports.length) {
  finding(
    "BROKEN_RELATIVE_IMPORTS",
    "critical",
    `${brokenImports.length} relative import(s) do not resolve.`,
    brokenImports.map(
      (item) =>
        `${item.file} -> ${item.specifier}`
    )
  );
} else {
  passed.push(
    "All scanned relative imports resolve."
  );
}

const envSource =
  read("server/config/env.js");

if (
  !envSource.includes(
    "CLIENT_ORIGINS"
  )
) {
  finding(
    "ENV_CLIENT_ORIGINS",
    "high",
    "Backend environment loader does not read CLIENT_ORIGINS.",
    ["server/config/env.js"]
  );
} else {
  passed.push(
    "CLIENT_ORIGINS is supported."
  );
}

const apiSource =
  read("src/lib/api.js");

if (
  !apiSource.includes("ApiError") ||
  !apiSource.includes(
    "response.status"
  )
) {
  finding(
    "CLIENT_API_ERROR_METADATA",
    "high",
    "API client still loses HTTP status, error code or request metadata.",
    ["src/lib/api.js"]
  );
} else {
  passed.push(
    "API client preserves structured error metadata."
  );
}

const languageTools =
  read(
    "src/i18n/GlobalLanguageTools.jsx"
  );

if (
  languageTools.includes(
    "AutoTranslate"
  )
) {
  finding(
    "REACT_DOM_MUTATION_TRANSLATION",
    "critical",
    "AutoTranslate is still mounted and may mutate React-managed DOM.",
    [
      "src/i18n/GlobalLanguageTools.jsx",
      "src/i18n/AutoTranslate.jsx",
    ]
  );
} else {
  passed.push(
    "DOM-mutating AutoTranslate is not mounted."
  );
}

const publicStoreHook =
  read("src/hooks/usePublicStore.js");

if (
  /setInterval\s*\(/.test(
    publicStoreHook
  )
) {
  finding(
    "PUBLIC_STORE_POLLING",
    "medium",
    "Public store hook still contains interval polling.",
    ["src/hooks/usePublicStore.js"]
  );
} else {
  passed.push(
    "Public store hook has no interval polling."
  );
}

const publicStoreRoute =
  read(
    "server/routes/publicStore.routes.js"
  );

if (
  !publicStoreRoute.includes(
    "publicProducts"
  ) ||
  !publicStoreRoute.includes(
    "categoryId.isActive"
  )
) {
  finding(
    "HIDDEN_CATEGORY_PRODUCTS",
    "high",
    "Public store may expose products whose category is hidden.",
    [
      "server/routes/publicStore.routes.js",
    ]
  );
} else {
  passed.push(
    "Public product output filters hidden categories."
  );
}

const indexSource =
  read("server/index.js");

if (
  !indexSource.includes(
    'app.use("/api/v1", v1Routes);'
  )
) {
  finding(
    "API_V1_FOUNDATION",
    "medium",
    "A stable /api/v1 migration boundary is not mounted.",
    ["server/index.js"]
  );
} else {
  passed.push(
    "/api/v1 foundation is mounted."
  );
}

if (
  !indexSource.includes(
    "requestIdMiddleware"
  )
) {
  finding(
    "REQUEST_ID",
    "medium",
    "API requests do not have a shared request ID middleware.",
    ["server/index.js"]
  );
} else {
  passed.push(
    "Request ID middleware is connected."
  );
}

const responseKeyFiles = [];
const compatibilityFiles = [];

for (const filePath of allSourceFiles) {
  const source =
    fs.readFileSync(filePath, "utf8");

  if (
    source.includes("responseKey") ||
    source.includes("itemKey")
  ) {
    responseKeyFiles.push(
      relative(filePath)
    );
  }

  if (
    source.includes(
      "apiCompatibility"
    )
  ) {
    compatibilityFiles.push(
      relative(filePath)
    );
  }
}

if (responseKeyFiles.length) {
  warnings.push({
    id: "LEGACY_RESPONSE_KEYS",
    message:
      "Legacy responseKey/itemKey adapters remain. Migrate one domain at a time after the foundation is stable.",
    files:
      [...new Set(responseKeyFiles)],
  });
}

if (compatibilityFiles.length) {
  warnings.push({
    id: "COMPATIBILITY_ROUTES",
    message:
      "Compatibility routes remain. Do not delete them until every frontend service has moved to /api/v1.",
    files:
      [...new Set(compatibilityFiles)],
  });
}

const obsoleteStats = [];

for (const candidate of [
  "scripts/check-admin-live-statistics-v20-2.mjs",
  "scripts/patch-admin-live-statistics-v20-2.mjs",
  "scripts/test-admin-live-statistics-v20-2.mjs",
  "scripts/check-admin-statistics-v20-1.mjs",
  "scripts/test-admin-statistics-v20-1.mjs",
  "scripts/check-admin-dom-recovery-v20-3.mjs",
  "scripts/check-admin-dom-recovery-v20-3-1.mjs",
  "scripts/remove-admin-live-statistics-v20-3.mjs",
]) {
  if (
    fs.existsSync(
      path.join(root, candidate)
    )
  ) {
    obsoleteStats.push(candidate);
  }
}

if (obsoleteStats.length) {
  finding(
    "CONFLICTING_STATISTICS_SCRIPTS",
    "medium",
    "Old statistics scripts encode conflicting desired states.",
    obsoleteStats
  );
} else {
  passed.push(
    "Conflicting V20 statistics scripts are archived."
  );
}

const summary = {
  createdAt:
    new Date().toISOString(),
  counts: {
    critical:
      findings.filter(
        (item) =>
          item.severity ===
          "critical"
      ).length,
    high:
      findings.filter(
        (item) =>
          item.severity === "high"
      ).length,
    medium:
      findings.filter(
        (item) =>
          item.severity ===
          "medium"
      ).length,
    warnings: warnings.length,
    passed: passed.length,
  },
  findings,
  warnings,
  passed,
};

const jsonPath =
  path.join(
    reportDirectory,
    `architecture-audit-v22-${timestamp}.json`
  );

const markdownPath =
  path.join(
    reportDirectory,
    `architecture-audit-v22-${timestamp}.md`
  );

fs.writeFileSync(
  jsonPath,
  JSON.stringify(
    summary,
    null,
    2
  ),
  "utf8"
);

const lines = [
  "# TRAP Room Architecture Audit V22",
  "",
  `Created: ${summary.createdAt}`,
  "",
  "## Summary",
  "",
  `- Critical: ${summary.counts.critical}`,
  `- High: ${summary.counts.high}`,
  `- Medium: ${summary.counts.medium}`,
  `- Migration warnings: ${summary.counts.warnings}`,
  `- Passed checks: ${summary.counts.passed}`,
  "",
  "## Findings",
  "",
];

if (!findings.length) {
  lines.push(
    "No blocking foundation finding was detected.",
    ""
  );
}

for (const item of findings) {
  lines.push(
    `### [${item.severity.toUpperCase()}] ${item.id}`,
    "",
    item.message,
    ""
  );

  for (const file of item.files) {
    lines.push(`- \`${file}\``);
  }

  lines.push("");
}

lines.push(
  "## Migration warnings",
  ""
);

if (!warnings.length) {
  lines.push(
    "No migration warning.",
    ""
  );
}

for (const item of warnings) {
  lines.push(
    `### ${item.id}`,
    "",
    item.message,
    ""
  );

  for (const file of item.files) {
    lines.push(`- \`${file}\``);
  }

  lines.push("");
}

lines.push(
  "## Passed",
  ""
);

for (const item of passed) {
  lines.push(`- ${item}`);
}

lines.push(
  "",
  "## Safety boundary",
  "",
  "V22 intentionally does not delete compatibility routes, rewrite every CRUD route, or split the generic Resource Manager in one operation. Those migrations require per-domain contract tests so existing Admin screens do not break together.",
  ""
);

fs.writeFileSync(
  markdownPath,
  lines.join("\n"),
  "utf8"
);

console.log(
  `Audit report: ${path.relative(root, markdownPath)}`
);
console.log(
  JSON.stringify(
    summary.counts
  )
);

if (
  summary.counts.critical > 0
) {
  process.exitCode = 2;
}
