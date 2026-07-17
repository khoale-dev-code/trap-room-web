import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function target(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  const file = target(relativePath);

  if (!fs.existsSync(file)) {
    throw new Error(
      `Missing required file: ${relativePath}`
    );
  }

  return fs.readFileSync(file, "utf8");
}

function write(relativePath, source) {
  fs.writeFileSync(
    target(relativePath),
    source,
    "utf8"
  );

  console.log(`Updated ${relativePath}`);
}

function ensureImport(
  source,
  importLine
) {
  if (source.includes(importLine)) {
    return source;
  }

  const imports = [
    ...source.matchAll(
      /^import[\s\S]*?;\s*$/gm
    ),
  ];

  if (!imports.length) {
    return `${importLine}\n${source}`;
  }

  const last = imports.at(-1);
  const insertAt =
    last.index + last[0].length;

  return (
    source.slice(0, insertAt) +
    `\n${importLine}` +
    source.slice(insertAt)
  );
}

function findMatchingBrace(
  source,
  openIndex
) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  let templateDepth = 0;

  for (
    let index = openIndex;
    index < source.length;
    index += 1
  ) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") {
        lineComment = false;
      }
      continue;
    }

    if (blockComment) {
      if (
        char === "*" &&
        next === "/"
      ) {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (
        quote === "`" &&
        char === "$" &&
        next === "{"
      ) {
        templateDepth += 1;
        index += 1;
        continue;
      }

      if (
        quote === "`" &&
        templateDepth > 0
      ) {
        if (char === "{") {
          templateDepth += 1;
        } else if (char === "}") {
          templateDepth -= 1;
        }
        continue;
      }

      if (char === quote) {
        quote = "";
      }

      continue;
    }

    if (
      char === "/" &&
      next === "/"
    ) {
      lineComment = true;
      index += 1;
      continue;
    }

    if (
      char === "/" &&
      next === "*"
    ) {
      blockComment = true;
      index += 1;
      continue;
    }

    if (
      char === "'" ||
      char === '"' ||
      char === "`"
    ) {
      quote = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function getRequestFunction(
  source
) {
  const pattern =
    /async\s+function\s+request\s*\(\s*([A-Za-z_$][\w$]*)\s*,[\s\S]*?\)\s*\{/m;

  const match = pattern.exec(source);

  if (!match) {
    throw new Error(
      "Could not locate async function request(...) in src/lib/api.js."
    );
  }

  const openOffset =
    match[0].lastIndexOf("{");

  const openIndex =
    match.index + openOffset;

  const closeIndex =
    findMatchingBrace(
      source,
      openIndex
    );

  if (closeIndex < 0) {
    throw new Error(
      "Could not parse the request() function body."
    );
  }

  return {
    pathParameter: match[1],
    start: match.index,
    bodyOpen: openIndex,
    end: closeIndex + 1,
    body: source.slice(
      openIndex + 1,
      closeIndex
    ),
  };
}

function patchApiClient() {
  const relativePath =
    "src/lib/api.js";

  let source = read(relativePath);

  source = ensureImport(
    source,
    'import { notifyDataChanged } from "./dataSync.js";'
  );

  if (
    !source.includes(
      "TRAP_JOURNAL_MUTATION_SYNC"
    )
  ) {
    const request =
      getRequestFunction(source);

    const returnMatches = [
      ...request.body.matchAll(
        /\breturn\s+([A-Za-z_$][\w$]*)\s*;/g
      ),
    ];

    if (!returnMatches.length) {
      throw new Error(
        "request() has no final identifier return statement."
      );
    }

    const finalReturn =
      returnMatches.at(-1);

    const insertAt =
      request.bodyOpen +
      1 +
      finalReturn.index;

    const pathName =
      request.pathParameter;

    const syncCode = `  /* TRAP_JOURNAL_MUTATION_SYNC */
  const isMutation =
    !["GET", "HEAD", "OPTIONS"].includes(method);

  if (
    isMutation &&
    !String(${pathName}).startsWith("/auth/") &&
    String(${pathName}) !== "/upload"
  ) {
    const resource =
      String(${pathName}).startsWith("/posts")
        ? "posts"
        : "all";

    notifyDataChanged({
      resource,
      path: String(${pathName}),
      method,
      timestamp: Date.now(),
    });
  }

`;

    source =
      source.slice(0, insertAt) +
      syncCode +
      source.slice(insertAt);
  }

  const updatedRequest =
    getRequestFunction(source);

  if (
    !updatedRequest.body.includes(
      "notifyDataChanged"
    ) ||
    !updatedRequest.body.includes(
      'resource ='
    )
  ) {
    throw new Error(
      "The request() mutation synchronization guard was not connected."
    );
  }

  write(relativePath, source);
}

function patchJournalPayload() {
  const relativePath =
    "src/admin/features/journal/utils/journalAdmin.js";

  let source = read(relativePath);

  if (
    !source.includes(
      "isActive:"
    )
  ) {
    const marker = `    isPublished:
      Boolean(
        form?.isPublished
      ),`;

    if (!source.includes(marker)) {
      throw new Error(
        "Could not locate the V24 isPublished payload field."
      );
    }

    source = source.replace(
      marker,
      `${marker}
    // Compatibility flag used by older Admin/public filters.
    isActive:
      Boolean(
        form?.isPublished
      ),`
    );
  }

  write(relativePath, source);
}

function patchPostModel() {
  const relativePath =
    "server/models/Post.js";

  let source = read(relativePath);

  if (
    !source.includes(
      "isActive:"
    )
  ) {
    const marker =
      "    isPublished: { type: Boolean, default: true, index: true },";

    if (!source.includes(marker)) {
      throw new Error(
        "Could not locate isPublished in Post model."
      );
    }

    source = source.replace(
      marker,
      `${marker}
    isActive: { type: Boolean, default: true, index: true },`
    );
  }

  if (
    !source.includes(
      "this.isActive = this.isPublished !== false;"
    )
  ) {
    const hookMarker =
      'schema.pre("save", function syncPost(next) {';

    if (!source.includes(hookMarker)) {
      throw new Error(
        "Could not locate Post pre-save hook."
      );
    }

    source = source.replace(
      hookMarker,
      `${hookMarker}
  this.isPublished =
    this.isPublished !== false;
  this.isActive =
    this.isPublished !== false;`
    );
  }

  write(relativePath, source);
}

function patchPostRoute() {
  const relativePath =
    "server/routes/post.routes.js";

  let source = read(relativePath);

  if (
    source.includes(
      "isActive: isPublished,"
    )
  ) {
    write(relativePath, source);
    return;
  }

  const marker =
    "    isPublished,\n  };";

  if (!source.includes(marker)) {
    throw new Error(
      "Could not locate the normalized post payload return."
    );
  }

  source = source.replace(
    marker,
    "    isPublished,\n    isActive: isPublished,\n  };"
  );

  write(relativePath, source);
}

function patchPublicStoreRoute() {
  const relativePath =
    "server/routes/publicStore.routes.js";

  let source = read(relativePath);

  source = source.replace(
    /Post\.find\(\{\s*isPublished:\s*\{\s*\$ne:\s*false\s*\}\s*\}\)/g,
    'Post.find({\n          isPublished: { $ne: false },\n          isActive: { $ne: false },\n        })'
  );

  if (
    !source.includes(
      "isPublished: { $ne: false }"
    )
  ) {
    throw new Error(
      "The public-store Post publication filter was not found."
    );
  }

  if (
    !source.includes(
      "isActive: { $ne: false }"
    )
  ) {
    throw new Error(
      "The public-store compatibility visibility filter was not connected."
    );
  }

  write(relativePath, source);
}

function patchPublicStoreHook() {
  const relativePath =
    "src/hooks/usePublicStore.js";

  let source = read(relativePath);

  if (
    !source.includes(
      "function unwrapPublicStorePayload"
    )
  ) {
    const marker =
      "function unwrapShop(response) {";

    if (!source.includes(marker)) {
      throw new Error(
        "Could not locate unwrapShop in usePublicStore.js."
      );
    }

    const helper = `function unwrapPublicStorePayload(response) {
  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response?.store &&
    typeof response.store === "object"
  ) {
    return response.store;
  }

  return (
    response &&
    typeof response === "object"
      ? response
      : {}
  );
}

function publicList(
  source,
  ...keys
) {
  for (const key of keys) {
    if (Array.isArray(source?.[key])) {
      return source[key];
    }
  }

  return [];
}

`;

    source = source.replace(
      marker,
      helper + marker
    );
  }

  if (
    !source.includes(
      "const normalizedPublicData"
    )
  ) {
    const marker =
      "        const directShop =\n          unwrapShop(shopResponse);";

    if (!source.includes(marker)) {
      throw new Error(
        "Could not locate the public-store normalization point."
      );
    }

    source = source.replace(
      marker,
      `        const normalizedPublicData =
          unwrapPublicStorePayload(
            publicData
          );

${marker}`
    );

    source = source
      .replaceAll(
        "...(publicData || {})",
        "...(normalizedPublicData || {})"
      )
      .replaceAll(
        "publicData?.shop",
        "normalizedPublicData?.shop"
      )
      .replaceAll(
        "publicData?.categories",
        "normalizedPublicData?.categories"
      )
      .replaceAll(
        "publicData?.products",
        "normalizedPublicData?.products"
      )
      .replaceAll(
        "publicData?.toppings",
        "normalizedPublicData?.toppings"
      )
      .replaceAll(
        "publicData?.promotions",
        "normalizedPublicData?.promotions"
      )
      .replaceAll(
        "publicData?.gallery",
        "normalizedPublicData?.gallery"
      );
  }

  const oldPosts = `          posts: Array.isArray(
            publicData?.posts
          )
            ? publicData.posts
            : [],`;

  const normalizedOldPosts = `          posts: Array.isArray(
            normalizedPublicData?.posts
          )
            ? normalizedPublicData.posts
            : [],`;

  const newPosts = `          posts: publicList(
            normalizedPublicData,
            "posts",
            "journalPosts",
            "items"
          ).filter(
            (post) =>
              post?.isPublished !== false &&
              post?.isActive !== false
          ),`;

  if (source.includes(oldPosts)) {
    source = source.replace(
      oldPosts,
      newPosts
    );
  } else if (
    source.includes(
      normalizedOldPosts
    )
  ) {
    source = source.replace(
      normalizedOldPosts,
      newPosts
    );
  } else if (
    !source.includes(
      'publicList(\n            normalizedPublicData,\n            "posts"'
    )
  ) {
    throw new Error(
      "Could not locate the posts assignment in usePublicStore.js."
    );
  }

  if (
    !source.includes(
      '"journalPosts"'
    ) ||
    !source.includes(
      "post?.isPublished !== false"
    )
  ) {
    throw new Error(
      "Client Journal response normalization was not connected."
    );
  }

  write(relativePath, source);
}

patchApiClient();
patchJournalPayload();
patchPostModel();
patchPostRoute();
patchPublicStoreRoute();
patchPublicStoreHook();

console.log(
  "Journal Admin → Client Sync V24.1 patch completed."
);
