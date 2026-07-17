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

const api = read(
  "src/lib/api.js"
);
const hook = read(
  "src/hooks/usePublicStore.js"
);
const journalAdmin = read(
  "src/admin/features/journal/utils/journalAdmin.js"
);
const model = read(
  "server/models/Post.js"
);
const route = read(
  "server/routes/post.routes.js"
);
const publicRoute = read(
  "server/routes/publicStore.routes.js"
);

for (const marker of [
  "TRAP_JOURNAL_MUTATION_SYNC",
  "notifyDataChanged",
  '"posts"',
  "timestamp: Date.now()",
]) {
  if (!api.includes(marker)) {
    errors.push(
      `API mutation synchronization missing: ${marker}`
    );
  }
}

for (const marker of [
  "function unwrapPublicStorePayload",
  "function publicList",
  '"journalPosts"',
  "post?.isPublished !== false",
  "post?.isActive !== false",
]) {
  if (!hook.includes(marker)) {
    errors.push(
      `Public-store hook missing: ${marker}`
    );
  }
}

if (
  !journalAdmin.includes(
    "isActive:"
  )
) {
  errors.push(
    "Journal Admin payload does not send isActive compatibility state."
  );
}

for (const marker of [
  "isPublished:",
  "isActive:",
  "this.isActive =",
]) {
  if (!model.includes(marker)) {
    errors.push(
      `Post model missing: ${marker}`
    );
  }
}

if (
  !route.includes(
    "isActive: isPublished"
  )
) {
  errors.push(
    "Post route does not synchronize isActive and isPublished."
  );
}

for (const marker of [
  "isPublished: { $ne: false }",
  "isActive: { $ne: false }",
  "posts,",
]) {
  if (!publicRoute.includes(marker)) {
    errors.push(
      `Public-store route missing: ${marker}`
    );
  }
}

for (const source of [
  api,
  hook,
]) {
  if (
    source.includes(
      "MutationObserver"
    ) ||
    source.includes(
      "textContent ="
    )
  ) {
    errors.push(
      "Journal sync must not mutate React-managed DOM."
    );
  }
}

if (errors.length) {
  console.error(
    "Journal Admin → Client Sync V24.1 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Journal Admin → Client Sync V24.1 check passed."
);
