
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const relativePath = "src/admin/AdminShell.jsx";
const target = path.join(root, relativePath);

if (!fs.existsSync(target)) {
  throw new Error(`Missing required file: ${relativePath}`);
}

let source = fs.readFileSync(target, "utf8");

function findCollapsedStateVariable(input) {
  const candidates = [
    ...input.matchAll(
      /const\s*\[\s*([A-Za-z_$][\w$]*[Cc]ollaps[A-Za-z_$\w]*)\s*,\s*[A-Za-z_$][\w$]*\s*\]\s*=\s*useState\s*\(/g
    ),
  ];

  if (candidates.length) {
    return candidates[0][1];
  }

  const ternary = /\b([A-Za-z_$][\w$]*)\s*\?\s*["'][^"']*(?:w|grid-cols)-\[\d+px/g.exec(
    input
  );

  if (ternary) {
    return ternary[1];
  }

  const loose = /\b([A-Za-z_$][\w$]*Collapsed)\b/g.exec(input);

  return loose?.[1] || "";
}

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

function addRootAttributes(input, stateVariable) {
  if (
    input.includes('data-admin-shell="true"') &&
    input.includes("data-admin-sidebar-collapsed")
  ) {
    return input;
  }

  const componentIndex = Math.max(
    input.indexOf("export default function AdminShell"),
    input.indexOf("function AdminShell"),
    input.indexOf("const AdminShell")
  );

  if (componentIndex < 0) {
    throw new Error("Could not locate the AdminShell component.");
  }

  const returnIndex = input.indexOf("return (", componentIndex);

  if (returnIndex < 0) {
    throw new Error("Could not locate the AdminShell return block.");
  }

  const mainIndex = input.indexOf("<main", returnIndex);

  if (mainIndex < 0) {
    throw new Error("Could not locate the AdminShell root <main> element.");
  }

  const tagEnd = input.indexOf(">", mainIndex);

  if (tagEnd < 0) {
    throw new Error("AdminShell root <main> opening tag is incomplete.");
  }

  const opening = input.slice(mainIndex, tagEnd + 1);
  const additions = [];

  if (!opening.includes("data-admin-shell")) {
    additions.push('data-admin-shell="true"');
  }

  if (!opening.includes("data-admin-sidebar-collapsed")) {
    additions.push(
      `data-admin-sidebar-collapsed={${stateVariable} ? "true" : "false"}`
    );
  }

  if (!additions.length) {
    return input;
  }

  const indentation = "\n      ";

  return (
    input.slice(0, tagEnd) +
    indentation +
    additions.join(indentation) +
    input.slice(tagEnd)
  );
}

function normalizeCollapsedTailwindWidths(input) {
  return input
    .replace(
      /lg:grid-cols-\[(\d+)px_minmax\(0,1fr\)\]/g,
      (match, width) =>
        Number(width) <= 140
          ? "lg:grid-cols-[92px_minmax(0,1fr)]"
          : match
    )
    .replace(
      /lg:w-\[(\d+)px\]/g,
      (match, width) =>
        Number(width) <= 140
          ? "lg:w-[92px]"
          : match
    )
    .replace(
      /lg:min-w-\[(\d+)px\]/g,
      (match, width) =>
        Number(width) <= 140
          ? "lg:min-w-[92px]"
          : match
    )
    .replace(
      /lg:max-w-\[(\d+)px\]/g,
      (match, width) =>
        Number(width) <= 140
          ? "lg:max-w-[92px]"
          : match
    );
}

const stateVariable = findCollapsedStateVariable(source);

if (!stateVariable) {
  throw new Error(
    "Could not determine the Admin sidebar collapsed-state variable."
  );
}

source = ensureImport(
  source,
  'import "./styles/admin-sidebar-collapsed-v14.css";'
);

source = addRootAttributes(source, stateVariable);
source = normalizeCollapsedTailwindWidths(source);

fs.writeFileSync(target, source, "utf8");

console.log(`Detected collapsed state: ${stateVariable}`);
console.log("Connected Admin collapsed sidebar V14.");
