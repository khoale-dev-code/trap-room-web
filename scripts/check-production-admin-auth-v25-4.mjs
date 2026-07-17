import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const file =
    path.join(root, relativePath);

  if (!fs.existsSync(file)) {
    errors.push(
      `Missing file: ${relativePath}`
    );
    return "";
  }

  return fs.readFileSync(
    file,
    "utf8"
  );
}

const auth = read(
  "server/routes/auth.routes.js"
);

for (const marker of [
  'sameSite: "lax"',
  "function ownerAccount()",
  "username ===",
  "ownerUsername",
  "Employee.updateOne(",
  "runValidators: false",
  '"[auth/login]"',
  "AUTH_INVALID_CREDENTIALS",
  'res.set("Pragma", "no-cache")',
]) {
  if (!auth.includes(marker)) {
    errors.push(
      `Auth route missing: ${marker}`
    );
  }
}

if (
  auth.includes(
    "employee.lastLoginAt ="
  ) ||
  auth.includes(
    "employee.lastActivityAt ="
  )
) {
  errors.push(
    "Login still mutates and saves the full Employee document."
  );
}

if (
  !auth.includes(
    'router.get(\n  "/me"'
  ) ||
  !auth.includes(
    'router.patch(\n  "/change-password"'
  )
) {
  errors.push(
    "Existing auth routes were not preserved."
  );
}

if (errors.length) {
  console.error(
    "Production Admin Login V25.4 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Production Admin Login V25.4 check passed."
);
