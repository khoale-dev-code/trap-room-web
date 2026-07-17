
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const pagePath = path.join(
  root,
  "src/admin/features/menu-items/MenuItemsPage.jsx"
);

const editorPath = path.join(
  root,
  "src/admin/features/menu-items/components/MenuItemEditor.jsx"
);

for (const target of [pagePath, editorPath]) {
  if (!fs.existsSync(target)) {
    throw new Error(`Missing required file: ${path.relative(root, target)}`);
  }
}

let page = fs.readFileSync(pagePath, "utf8");
let editor = fs.readFileSync(editorPath, "utf8");

/*
 * PAGE
 * Add a stable form ref and pass an explicit requestSubmit callback.
 */
page = page.replace(
  /import\s*\{\s*useMemo,\s*useState,\s*\}\s*from\s*"react";/,
  'import {\n  useMemo,\n  useRef,\n  useState,\n} from "react";'
);

if (!page.includes("useRef")) {
  throw new Error(
    "Could not add useRef to MenuItemsPage.jsx."
  );
}

if (!page.includes("const editorFormRef = useRef(null);")) {
  page = page.replace(
    /const\s+\[form,\s*setForm\]\s*=\s*useState\(\(\)\s*=>\s*\n?\s*createEmptyMenuItemForm\(1\)\s*\n?\s*\);/,
    (match) =>
      `${match}\n\n  const editorFormRef = useRef(null);`
  );
}

if (!page.includes("const editorFormRef = useRef(null);")) {
  throw new Error(
    "Could not insert editorFormRef into MenuItemsPage.jsx."
  );
}

if (!page.includes("function requestEditorSubmit()")) {
  page = page.replace(
    /function\s+updateForm\(name,\s*value\)\s*\{/,
    `function requestEditorSubmit() {
    const formElement = editorFormRef.current;

    if (!formElement || data.saving) {
      return;
    }

    /*
     * requestSubmit() follows the same validation and submit path as Enter,
     * while still being triggered explicitly by the Save button.
     */
    if (typeof formElement.requestSubmit === "function") {
      formElement.requestSubmit();
      return;
    }

    formElement.dispatchEvent(
      new Event("submit", {
        bubbles: true,
        cancelable: true,
      })
    );
  }

  function updateForm(name, value) {`
  );
}

page = page.replace(
  /<MenuItemEditor\s*\n/,
  `<MenuItemEditor\n          formRef={editorFormRef}\n`
);

if (!page.includes("onRequestSubmit={requestEditorSubmit}")) {
  page = page.replace(
    /onSubmit=\{handleSubmit\}\s*\/>/,
    `onSubmit={handleSubmit}
          onRequestSubmit={requestEditorSubmit}
        />`
  );
}

if (!page.includes("formRef={editorFormRef}")) {
  throw new Error(
    "MenuItemsPage.jsx is missing formRef={editorFormRef}."
  );
}

if (!page.includes("onRequestSubmit={requestEditorSubmit}")) {
  throw new Error(
    "MenuItemsPage.jsx is missing the explicit submit callback."
  );
}

/*
 * EDITOR
 * Save button becomes a normal button that explicitly asks the form to submit.
 * Enter remains supported because the wrapping <form> still has onSubmit.
 */
editor = editor.replace(
  /export\s+default\s+function\s+MenuItemEditor\(\{\s*\n/,
  `export default function MenuItemEditor({\n  formRef,\n`
);

if (!editor.includes("onRequestSubmit,")) {
  editor = editor.replace(
    /onSubmit,\s*\n\}\)\s*\{/,
    `onSubmit,
  onRequestSubmit,
}) {`
  );
}

editor = editor.replace(
  /<form\s*\n\s*id="menu-item-editor"/,
  `<form
      ref={formRef}
      id="menu-item-editor"`
);

editor = editor.replace(
  /<div className="grid gap-2 border-t border-trap-blue\/10 bg-\[#f8f9fd\] p-4 sm:grid-cols-2">/,
  `<div className="relative z-20 grid gap-2 border-t border-trap-blue/10 bg-[#f8f9fd] p-4 sm:grid-cols-2">`
);

editor = editor.replace(
  /<button\s*\n\s*type="submit"\s*\n\s*className="admin-button-primary"\s*\n\s*disabled=\{saving\}>/,
  `<button
              type="button"
              className="admin-button-primary relative z-10 pointer-events-auto"
              disabled={saving}
              onClick={onRequestSubmit}>`
);

if (!editor.includes("ref={formRef}")) {
  throw new Error(
    "MenuItemEditor.jsx is missing ref={formRef}."
  );
}

if (!editor.includes("onClick={onRequestSubmit}")) {
  throw new Error(
    "MenuItemEditor.jsx is missing onClick={onRequestSubmit}."
  );
}

if (editor.includes('type="submit"\n              className="admin-button-primary"')) {
  throw new Error(
    "The old Save submit button is still present."
  );
}

fs.writeFileSync(pagePath, page, "utf8");
fs.writeFileSync(editorPath, editor, "utf8");

console.log(
  "Connected the Save button to form.requestSubmit()."
);
console.log(
  "Enter submission remains available through the form onSubmit handler."
);
