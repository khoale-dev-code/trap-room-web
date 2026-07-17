
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const relativePath =
  "src/admin/features/menu-items/components/MenuItemEditor.jsx";
const target = path.join(root, relativePath);

if (!fs.existsSync(target)) {
  throw new Error(`Missing required file: ${relativePath}`);
}

let source = fs.readFileSync(target, "utf8");

function findComponentBodyStart(input) {
  const marker =
    /export\s+default\s+function\s+MenuItemEditor\s*\(\s*\{[\s\S]*?\}\s*\)\s*\{/m;

  const match = marker.exec(input);

  if (!match) {
    throw new Error(
      "Could not locate the MenuItemEditor component declaration."
    );
  }

  return match.index + match[0].length;
}

function insertRequestSaveHandler(input) {
  if (input.includes("function requestSave(event)")) {
    return input;
  }

  const insertAt = findComponentBodyStart(input);

  const handler = `

  function requestSave(event) {
    event.preventDefault();
    event.stopPropagation();

    const formElement =
      event.currentTarget.form ||
      document.getElementById("menu-item-editor");

    if (!formElement || saving) {
      return;
    }

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
  }`;

  return (
    input.slice(0, insertAt) +
    handler +
    input.slice(insertAt)
  );
}

function collectButtonBlocks(input) {
  const blocks = [];
  let cursor = 0;

  while (cursor < input.length) {
    const start = input.indexOf("<button", cursor);

    if (start < 0) {
      break;
    }

    const openEnd = input.indexOf(">", start);

    if (openEnd < 0) {
      break;
    }

    const close = input.indexOf("</button>", openEnd);

    if (close < 0) {
      break;
    }

    blocks.push({
      start,
      openEnd,
      closeEnd: close + "</button>".length,
      opening: input.slice(start, openEnd + 1),
      block: input.slice(start, close + "</button>".length),
    });

    cursor = close + "</button>".length;
  }

  return blocks;
}

function findSaveButton(input) {
  const candidates = collectButtonBlocks(input)
    .map((entry) => {
      let score = 0;

      if (entry.block.includes("copy.save")) score += 5;
      if (entry.block.includes("copy.create")) score += 4;
      if (entry.block.includes("copy.saving")) score += 3;
      if (entry.block.includes("<Save")) score += 3;
      if (entry.opening.includes('type="submit"')) score += 2;
      if (entry.opening.includes("data-menu-item-save")) score += 10;

      return {
        ...entry,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];

  if (!best || best.score < 5) {
    throw new Error(
      "Could not reliably identify the Save button in MenuItemEditor.jsx."
    );
  }

  return best;
}

function removeSimpleAttribute(opening, attributeName) {
  const patterns = [
    new RegExp(
      `\\s+${attributeName}\\s*=\\s*"[^"]*"`,
      "g"
    ),
    new RegExp(
      `\\s+${attributeName}\\s*=\\s*'[^']*'`,
      "g"
    ),
    new RegExp(
      `\\s+${attributeName}\\s*=\\s*\\{[A-Za-z_$][\\w$]*\\}`,
      "g"
    ),
  ];

  return patterns.reduce(
    (current, pattern) =>
      current.replace(pattern, ""),
    opening
  );
}

function updateSaveOpening(opening) {
  let next = opening;

  next = next.replace(
    /\s+type\s*=\s*(?:"[^"]*"|'[^']*'|\{[^}]*\})/g,
    ""
  );

  next = removeSimpleAttribute(next, "onClick");

  if (
    !next.includes(
      'data-menu-item-save="true"'
    )
  ) {
    next = next.replace(
      /^<button/,
      '<button\n              data-menu-item-save="true"'
    );
  }

  next = next.replace(
    /^<button([\s\S]*?)>/,
    (match, attributes) => {
      const additions = [];

      if (!attributes.includes('type="button"')) {
        additions.push('type="button"');
      }

      if (
        !attributes.includes(
          "onClick={requestSave}"
        )
      ) {
        additions.push(
          "onClick={requestSave}"
        );
      }

      if (!attributes.includes("style={{")) {
        additions.push(
          'style={{ position: "relative", zIndex: 30, pointerEvents: "auto", touchAction: "manipulation" }}'
        );
      }

      if (!additions.length) {
        return match;
      }

      return `<button${attributes}
              ${additions.join("\n              ")}>`;
    }
  );

  return next;
}

source = insertRequestSaveHandler(source);

const saveButton = findSaveButton(source);
const updatedOpening = updateSaveOpening(
  saveButton.opening
);

source =
  source.slice(0, saveButton.start) +
  updatedOpening +
  source.slice(saveButton.openEnd + 1);

/*
 * Remove the abandoned V16.1 prop dependency when it exists.
 * The new handler is fully local to MenuItemEditor.
 */
source = source
  .replace(
    /^\s*onRequestSubmit,\s*$/gm,
    ""
  )
  .replace(
    /onClick=\{onRequestSubmit\}/g,
    "onClick={requestSave}"
  );

fs.writeFileSync(target, source, "utf8");

console.log(
  "Menu item Save now calls form.requestSubmit() through a local click handler."
);
console.log(
  "The Enter key continues to use the existing form onSubmit handler."
);
