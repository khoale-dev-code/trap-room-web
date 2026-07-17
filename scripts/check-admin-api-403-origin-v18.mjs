
import fs from "node:fs";
import path from "node:path";
import {
  isPrivateDevelopmentOrigin,
} from "../server/config/developmentOrigins.js";

const root = process.cwd();
const currentOrigin = process.argv[2];
const errors = [];

if (!currentOrigin) {
  errors.push(
    "Current LAN origin argument is missing."
  );
}

if (
  currentOrigin &&
  !isPrivateDevelopmentOrigin(currentOrigin)
) {
  errors.push(
    `Current LAN origin is not accepted in development: ${currentOrigin}`
  );
}

for (const origin of [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://10.0.0.25:5173",
  "http://192.168.1.114:5173",
  "http://172.16.4.8:5173",
  "http://172.31.255.9:4173",
]) {
  if (!isPrivateDevelopmentOrigin(origin)) {
    errors.push(
      `Development origin should be allowed: ${origin}`
    );
  }
}

for (const origin of [
  "http://192.168.1.10:4000",
  "https://example.com",
  "not-a-url",
]) {
  if (isPrivateDevelopmentOrigin(origin)) {
    errors.push(
      `Origin should not be accepted by the development helper: ${origin}`
    );
  }
}

const serverRoot = path.join(root, "server");
const allowedExtensions = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".mts",
  ".cts",
]);

let currentOriginFound = false;
let helperUsageFound = false;

function walk(directory) {
  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    const absolute = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name !== "node_modules" &&
        entry.name !== "dist"
      ) {
        walk(absolute);
      }
      continue;
    }

    if (
      !allowedExtensions.has(
        path.extname(entry.name).toLowerCase()
      )
    ) {
      continue;
    }

    const source = fs.readFileSync(absolute, "utf8");

    if (
      currentOrigin &&
      source.includes(currentOrigin)
    ) {
      currentOriginFound = true;
    }

    if (
      source.includes(
        "isPrivateDevelopmentOrigin("
      ) &&
      !absolute.endsWith(
        "developmentOrigins.js"
      )
    ) {
      helperUsageFound = true;
    }
  }
}

walk(serverRoot);

if (
  !currentOriginFound &&
  !helperUsageFound
) {
  errors.push(
    "Neither the current LAN origin nor the dynamic development-origin guard is connected to the server."
  );
}

if (errors.length) {
  console.error(
    "Admin API 403 Origin V18 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Admin API 403 Origin V18 check passed."
);
