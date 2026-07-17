
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const requiredFiles = [
  "src/admin/features/resource-manager/ResourceManagerPage.jsx",
  "src/admin/features/resource-manager/copy.js",
  "src/admin/features/resource-manager/index.js",
  "src/admin/features/resource-manager/components/MediaEditor.jsx",
  "src/admin/features/resource-manager/components/ResourceCard.jsx",
  "src/admin/features/resource-manager/components/ResourceEditor.jsx",
  "src/admin/features/resource-manager/components/ResourceField.jsx",
  "src/admin/features/resource-manager/components/ResourceFilters.jsx",
  "src/admin/features/resource-manager/components/ResourceList.jsx",
  "src/admin/features/resource-manager/components/SizeEditor.jsx",
  "src/admin/features/resource-manager/components/ToggleField.jsx",
  "src/admin/features/resource-manager/hooks/useFilePreviews.js",
  "src/admin/features/resource-manager/hooks/useMobileEditorLock.js",
  "src/admin/features/resource-manager/hooks/useResourceData.js",
  "src/admin/features/resource-manager/services/resourceApi.js",
  "src/admin/features/resource-manager/utils/resource.js",
];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    errors.push(`Missing file: ${relativePath}`);
  }
}

const servicePath = path.join(
  root,
  "src/admin/features/resource-manager/services/resourceApi.js"
);

if (fs.existsSync(servicePath)) {
  const source = fs.readFileSync(servicePath, "utf8");

  if (!source.includes('../../../../lib/api.js')) {
    errors.push(
      "resourceApi.js has an incorrect api import path."
    );
  }
}

const editorPath = path.join(
  root,
  "src/admin/features/resource-manager/components/ResourceEditor.jsx"
);

if (fs.existsSync(editorPath)) {
  const source = fs.readFileSync(editorPath, "utf8");

  for (const expected of [
    "onSubmit={submit}",
    "onClick={clickSave}",
    "onSave();",
    "92dvh",
    "safe-area-inset-bottom",
    "xl:sticky",
  ]) {
    if (!source.includes(expected)) {
      errors.push(
        `ResourceEditor.jsx is missing: ${expected}`
      );
    }
  }
}

function findManager() {
  const matches = [];

  function walk(directory) {
    if (!fs.existsSync(directory)) {
      return;
    }

    for (const entry of fs.readdirSync(directory, {
      withFileTypes: true,
    })) {
      const absolute = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (entry.name !== "features") {
          walk(absolute);
        }

        continue;
      }

      if (entry.name === "ResourceManager.jsx") {
        matches.push(absolute);
      }
    }
  }

  walk(path.join(root, "src/admin"));
  return matches[0];
}

const managerPath = findManager();

if (!managerPath) {
  errors.push("ResourceManager.jsx was not found.");
} else {
  const source = fs.readFileSync(managerPath, "utf8");

  if (
    !source.includes(
      "features/resource-manager/ResourceManagerPage.jsx"
    )
  ) {
    errors.push(
      "ResourceManager.jsx is not a thin feature entry point."
    );
  }

  if (source.split("\n").length > 5) {
    errors.push(
      "ResourceManager.jsx is still too large."
    );
  }
}

if (errors.length) {
  console.error("Resource Manager Clean V20 check failed:\n");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("Resource Manager Clean V20 check passed.");
