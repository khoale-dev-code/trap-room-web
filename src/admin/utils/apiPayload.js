
const DEFAULT_COLLECTION_KEYS = [
  "items",
  "data",
  "results",
  "records",
  "resources",
  "products",
  "menuItems",
  "menu-items",
  "extras",
  "categories",
  "posts",
  "journalPosts",
  "journal-posts",
  "employees",
  "promotions",
  "reservations",
  "gallery",
  "media",
];

const DEFAULT_ENTITY_KEYS = [
  "item",
  "resource",
  "product",
  "menuItem",
  "extra",
  "category",
  "post",
  "journalPost",
  "employee",
  "promotion",
  "reservation",
];

const WRAPPER_KEYS = [
  "data",
  "result",
  "payload",
  "response",
];

export function extractApiCollection(
  payload,
  preferredKeys = []
) {
  return findCollection(
    payload,
    uniqueKeys([
      ...preferredKeys,
      ...DEFAULT_COLLECTION_KEYS,
    ]),
    new Set(),
    0
  );
}

export function extractApiEntity(
  payload,
  preferredKeys = []
) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  const keys = uniqueKeys([
    ...preferredKeys,
    ...DEFAULT_ENTITY_KEYS,
  ]);

  for (const key of keys) {
    const value = payload[key];

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      return value;
    }
  }

  for (const wrapperKey of WRAPPER_KEYS) {
    const wrapped = payload[wrapperKey];

    if (
      wrapped &&
      typeof wrapped === "object"
    ) {
      const nested = extractApiEntity(
        wrapped,
        preferredKeys
      );

      if (nested) {
        return nested;
      }
    }
  }

  if (
    "_id" in payload ||
    "id" in payload
  ) {
    return payload;
  }

  return null;
}

export function describeApiPayload(payload) {
  if (Array.isArray(payload)) {
    return `array(${payload.length})`;
  }

  if (!payload || typeof payload !== "object") {
    return typeof payload;
  }

  return `object keys: ${Object.keys(payload).join(", ") || "(none)"}`;
}

function findCollection(
  payload,
  keys,
  seen,
  depth
) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    seen.has(payload) ||
    depth > 4
  ) {
    return [];
  }

  seen.add(payload);

  for (const key of keys) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  for (const wrapperKey of WRAPPER_KEYS) {
    if (
      payload[wrapperKey] &&
      typeof payload[wrapperKey] === "object"
    ) {
      const nested = findCollection(
        payload[wrapperKey],
        keys,
        seen,
        depth + 1
      );

      if (nested.length > 0) {
        return nested;
      }

      if (Array.isArray(payload[wrapperKey])) {
        return payload[wrapperKey];
      }
    }
  }

  const arrayEntries = Object.entries(payload)
    .filter(([, value]) => Array.isArray(value));

  if (arrayEntries.length === 1) {
    return arrayEntries[0][1];
  }

  for (const [, value] of Object.entries(payload)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const nested = findCollection(
        value,
        keys,
        seen,
        depth + 1
      );

      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

function uniqueKeys(keys) {
  return [
    ...new Set(
      keys
        .map((key) => String(key || "").trim())
        .filter(Boolean)
    ),
  ];
}
