
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const relativePath = "src/admin/AdminShell.jsx";
const target = path.join(root, relativePath);

if (!fs.existsSync(target)) {
  throw new Error(`Missing required file: ${relativePath}`);
}

let source = fs.readFileSync(target, "utf8");

function ensureImport(input, importLine) {
  if (input.includes(importLine)) {
    return input;
  }

  const imports = [...input.matchAll(/^import .*;$/gm)];

  if (!imports.length) {
    return `${importLine}\n${input}`;
  }

  const last = imports.at(-1);
  const insertAt = last.index + last[0].length;

  return input.slice(0, insertAt) + `\n${importLine}` + input.slice(insertAt);
}

function addAttributeToOpeningTag(input, textPattern, tagName, attributes) {
  const textMatch = textPattern.exec(input);

  if (!textMatch) {
    return {
      source: input,
      changed: false,
    };
  }

  const textIndex = textMatch.index;
  const openingIndex = input.lastIndexOf(`<${tagName}`, textIndex);

  if (openingIndex < 0) {
    return {
      source: input,
      changed: false,
    };
  }

  const openingEnd = input.indexOf(">", openingIndex);

  if (openingEnd < 0 || openingEnd > textIndex) {
    return {
      source: input,
      changed: false,
    };
  }

  const opening = input.slice(openingIndex, openingEnd + 1);

  if (opening.includes(attributes.split("=")[0])) {
    return {
      source: input,
      changed: false,
    };
  }

  const updatedOpening =
    opening.slice(0, -1) +
    `\n                ${attributes}` +
    opening.slice(-1);

  return {
    source:
      input.slice(0, openingIndex) +
      updatedOpening +
      input.slice(openingEnd + 1),
    changed: true,
  };
}

function tagWebsiteAction(input) {
  const patterns = [
    />\s*(?:WEBSITE|Website|website)\s*</,
    /(?:WEBSITE|Website|website)/,
  ];

  for (const pattern of patterns) {
    const result = addAttributeToOpeningTag(
      input,
      pattern,
      "a",
      'data-sidebar-action="website"\n                data-sidebar-tooltip="Open website"\n                aria-label="Open website"\n                '
    );

    if (result.changed) {
      return result.source;
    }
  }

  /*
   * Fallback: locate an external root website link in the footer.
   */
  return input.replace(
    /<a([^>]*href=\{?["']\/["']\}?[^>]*)>/,
    (match, attributes) => {
      if (match.includes("data-sidebar-action")) {
        return match;
      }

      return `<a${attributes}
                data-sidebar-action="website"
                data-sidebar-tooltip="Open website"
                aria-label="Open website">`;
    }
  );
}

function tagSignOutAction(input) {
  const patterns = [
    />\s*(?:SIGN\s*OUT|Sign\s*out|Log\s*out|Logout)\s*</i,
    /(?:SIGN\s*OUT|Sign\s*out|Log\s*out|Logout)/i,
  ];

  for (const pattern of patterns) {
    const result = addAttributeToOpeningTag(
      input,
      pattern,
      "button",
      'data-sidebar-action="signout"\n                data-sidebar-tooltip="Sign out"\n                aria-label="Sign out"\n                '
    );

    if (result.changed) {
      return result.source;
    }
  }

  /*
   * Fallback: find the button using a logout/signout handler.
   */
  return input.replace(
    /<button([^>]*(?:onClick=\{[^}]*(?:logout|signOut|handleLogout)[^}]*\})[^>]*)>/i,
    (match, attributes) => {
      if (match.includes("data-sidebar-action")) {
        return match;
      }

      return `<button${attributes}
                data-sidebar-action="signout"
                data-sidebar-tooltip="Sign out"
                aria-label="Sign out">`;
    }
  );
}

function tagAccountCard(input) {
  if (input.includes('data-sidebar-account="true"')) {
    return input;
  }

  const accountPatterns = [
    />\s*admin\s*</i,
    />\s*SIGNED\s+IN\s*</i,
  ];

  for (const pattern of accountPatterns) {
    const match = pattern.exec(input);

    if (!match) {
      continue;
    }

    const textIndex = match.index;
    const tags = ["div", "button", "a"];

    for (const tagName of tags) {
      const openingIndex = input.lastIndexOf(`<${tagName}`, textIndex);

      if (openingIndex < 0) {
        continue;
      }

      const openingEnd = input.indexOf(">", openingIndex);

      if (openingEnd < 0 || openingEnd > textIndex) {
        continue;
      }

      const opening = input.slice(openingIndex, openingEnd + 1);

      if (opening.includes("data-sidebar-account")) {
        return input;
      }

      const updated =
        opening.slice(0, -1) +
        '\n                data-sidebar-account="true"' +
        opening.slice(-1);

      return (
        input.slice(0, openingIndex) +
        updated +
        input.slice(openingEnd + 1)
      );
    }
  }

  return input;
}

source = ensureImport(
  source,
  'import "./styles/admin-sidebar-actions-v15.css";'
);

source = tagWebsiteAction(source);
source = tagSignOutAction(source);
source = tagAccountCard(source);

if (!source.includes('data-sidebar-action="website"')) {
  throw new Error(
    "Could not identify the Website action in AdminShell.jsx."
  );
}

if (!source.includes('data-sidebar-action="signout"')) {
  throw new Error(
    "Could not identify the Sign out action in AdminShell.jsx."
  );
}

fs.writeFileSync(target, source, "utf8");

console.log("Tagged Website and Sign out actions.");
console.log("Connected Admin collapsed footer actions V15.");

