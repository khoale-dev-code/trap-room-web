
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const shellPath = path.join(root, "src/admin/AdminShell.jsx");
const patcherPath = path.join(
  root,
  "scripts/patch-admin-sidebar-actions-v15.mjs"
);

if (!fs.existsSync(shellPath)) {
  throw new Error("Missing src/admin/AdminShell.jsx");
}

let shell = fs.readFileSync(shellPath, "utf8");

function cleanSidebarActionOpeningTag(match) {
  if (!match.includes("data-sidebar-action=")) {
    return match;
  }

  /*
   * Keep aria-label and the custom data-sidebar-tooltip.
   * Remove every native title attribute from these action tags so the JSX
   * can never contain duplicate title props.
   */
  return match.replace(
    /\s+title\s*=\s*(?:"[^"]*"|'[^']*'|\{[^}]*\})/g,
    ""
  );
}

shell = shell.replace(
  /<(?:a|button)\b[\s\S]*?>/g,
  cleanSidebarActionOpeningTag
);

fs.writeFileSync(shellPath, shell, "utf8");

if (fs.existsSync(patcherPath)) {
  let patcher = fs.readFileSync(patcherPath, "utf8");

  patcher = patcher
    .replace(/\n\s*title="Open website"/g, "")
    .replace(/\n\s*title="Sign out"/g, "");

  fs.writeFileSync(patcherPath, patcher, "utf8");
}

console.log(
  "Removed native title attributes from compact sidebar action tags."
);
console.log(
  "Preserved aria-label and data-sidebar-tooltip for accessibility and custom tooltips."
);
