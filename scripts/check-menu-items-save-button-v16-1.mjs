
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
  "src/admin/features/menu-items/MenuItemsPage.jsx"
);

const editor = read(
  "src/admin/features/menu-items/components/MenuItemEditor.jsx"
);

for (const expected of [
  "useRef",
  "const editorFormRef = useRef(null);",
  "function requestEditorSubmit()",
  "formElement.requestSubmit()",
  "formRef={editorFormRef}",
  "onRequestSubmit={requestEditorSubmit}",
]) {
  if (!page.includes(expected)) {
    errors.push(
      `MenuItemsPage.jsx is missing: ${expected}`
    );
  }
}

for (const expected of [
  "formRef,",
  "onRequestSubmit,",
  "ref={formRef}",
  'type="button"',
  "onClick={onRequestSubmit}",
  "pointer-events-auto",
]) {
  if (!editor.includes(expected)) {
    errors.push(
      `MenuItemEditor.jsx is missing: ${expected}`
    );
  }
}

const saveButtonMatch =
  /<button[\s\S]*?onClick=\{onRequestSubmit\}[\s\S]*?>/.exec(
    editor
  );

if (!saveButtonMatch) {
  errors.push(
    "Could not locate the explicit Save button."
  );
} else if (
  saveButtonMatch[0].includes('type="submit"')
) {
  errors.push(
    "Save button must be type=button when using requestSubmit()."
  );
}

if (errors.length) {
  console.error(
    "Menu Items Save Button V16.1 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Menu Items Save Button V16.1 check passed."
);
