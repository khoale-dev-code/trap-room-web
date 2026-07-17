
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const relativePath =
  "src/admin/features/menu-items/components/MenuItemEditor.jsx";
const target = path.join(root, relativePath);
const errors = [];

if (!fs.existsSync(target)) {
  errors.push(`Missing file: ${relativePath}`);
} else {
  const source = fs.readFileSync(target, "utf8");

  for (const expected of [
    "function requestSave(event)",
    "event.currentTarget.form",
    'document.getElementById("menu-item-editor")',
    "formElement.requestSubmit()",
    'data-menu-item-save="true"',
    'type="button"',
    "onClick={requestSave}",
    'pointerEvents: "auto"',
    'touchAction: "manipulation"',
  ]) {
    if (!source.includes(expected)) {
      errors.push(
        `MenuItemEditor.jsx is missing: ${expected}`
      );
    }
  }

  if (source.includes("onClick={onRequestSubmit}")) {
    errors.push(
      "The abandoned onRequestSubmit click handler is still present."
    );
  }

  const saveOpening =
    /<button[\s\S]*?data-menu-item-save="true"[\s\S]*?>/.exec(
      source
    );

  if (!saveOpening) {
    errors.push(
      "Could not locate the tagged Save button."
    );
  } else {
    if (
      !saveOpening[0].includes(
        'type="button"'
      )
    ) {
      errors.push(
        "The Save button is not type=button."
      );
    }

    if (
      !saveOpening[0].includes(
        "onClick={requestSave}"
      )
    ) {
      errors.push(
        "The Save button is not connected to requestSave."
      );
    }
  }
}

if (errors.length) {
  console.error(
    "Menu Items Save Button V16.2 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Menu Items Save Button V16.2 check passed."
);
