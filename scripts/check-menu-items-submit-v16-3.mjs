
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const target = path.join(
    root,
    relativePath
  );

  if (!fs.existsSync(target)) {
    errors.push(
      `Missing file: ${relativePath}`
    );
    return "";
  }

  return fs.readFileSync(
    target,
    "utf8"
  );
}

const page = read(
  "src/admin/features/menu-items/MenuItemsPage.jsx"
);

const editor = read(
  "src/admin/features/menu-items/components/MenuItemEditor.jsx"
);

for (const expected of [
  "async function handleSave(event)",
  "event?.preventDefault?.()",
  "await persist(null)",
  "onSave={handleSave}",
]) {
  if (!page.includes(expected)) {
    errors.push(
      `MenuItemsPage.jsx is missing: ${expected}`
    );
  }
}

for (const expected of [
  "onSubmit={onSave}",
  "function submitFromButton",
  "onSave();",
  'data-menu-item-save="true"',
  "onClick={",
  "submitFromButton",
  'type="button"',
]) {
  if (!editor.includes(expected)) {
    errors.push(
      `MenuItemEditor.jsx is missing: ${expected}`
    );
  }
}

for (const forbidden of [
  "requestSubmit",
  "onRequestSubmit",
  "requestSave",
]) {
  if (
    page.includes(forbidden) ||
    editor.includes(forbidden)
  ) {
    errors.push(
      `Old submit patch remains: ${forbidden}`
    );
  }
}

if (errors.length) {
  console.error(
    "Menu Items Submit V16.3 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Menu Items Submit V16.3 check passed."
);
