export function slugify(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function cleanDocumentPayload(payload = {}) {
  const next = { ...payload };

  for (const key of ["_id", "id", "__v", "createdAt", "updatedAt"]) {
    delete next[key];
  }

  return next;
}

export function text(value, maxLength = 0) {
  const normalized = String(value ?? "").trim();
  return maxLength > 0 ? normalized.slice(0, maxLength) : normalized;
}

export function numberValue(value, fallback = 0, minimum = 0) {
  const normalized =
    typeof value === "string"
      ? value.replace(/[^\d.-]/g, "")
      : value;

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, parsed);
}

export function booleanValue(value, fallback = false) {
  if (value === undefined) return fallback;
  return value === true || value === "true" || value === 1 || value === "1";
}

export function normalizeStringArray(value) {
  const items = Array.isArray(value)
    ? value
    : String(value || "").split(",");

  return [...new Set(items.map((item) => text(item)).filter(Boolean))];
}

export function normalizeMedia(media = []) {
  if (!Array.isArray(media)) return [];

  return media
    .map((item, index) => {
      if (typeof item === "string") {
        const url = text(item);
        if (!url) return null;

        return {
          url,
          publicId: "",
          resourceType: inferResourceType(url),
          originalName: `Media ${index + 1}`,
          alt: "",
          objectPosition: "center center",
          sortOrder: index + 1,
        };
      }

      const url = text(
        item?.url ||
          item?.secureUrl ||
          item?.secure_url ||
          item?.imageUrl ||
          item?.src
      );

      if (!url) return null;

      return {
        url,
        publicId: text(item.publicId || item.public_id),
        resourceType: text(
          item.resourceType ||
            item.resource_type ||
            item.type ||
            inferResourceType(url)
        ),
        format: text(item.format),
        width: numberValue(item.width, 0, 0),
        height: numberValue(item.height, 0, 0),
        bytes: numberValue(item.bytes, 0, 0),
        originalName: text(
          item.originalName ||
            item.original_name ||
            item.name ||
            `Media ${index + 1}`
        ),
        alt: text(item.alt),
        objectPosition: text(item.objectPosition) || "center center",
        sortOrder: numberValue(item.sortOrder, index + 1, 1),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

export function firstImageUrl(media = []) {
  return (
    normalizeMedia(media).find(
      (item) => item.resourceType !== "video"
    )?.url || ""
  );
}

export function assertDateString(value, fieldLabel, { optional = true } = {}) {
  const normalized = text(value);

  if (!normalized && optional) return "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const error = new Error(`${fieldLabel} must use YYYY-MM-DD format.`);
    error.statusCode = 400;
    throw error;
  }

  const parsed = new Date(`${normalized}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    const error = new Error(`${fieldLabel} is not a valid date.`);
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

export function assertTimeString(value, fieldLabel, { optional = true } = {}) {
  const normalized = text(value);

  if (!normalized && optional) return "";

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(normalized)) {
    const error = new Error(`${fieldLabel} must use HH:mm format.`);
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

export function optionalUrl(value, fieldLabel) {
  const normalized = text(value);
  if (!normalized) return "";

  try {
    const url = new URL(normalized);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error();
    }

    return normalized;
  } catch {
    const error = new Error(`${fieldLabel} must be a valid http or https URL.`);
    error.statusCode = 400;
    throw error;
  }
}

export function requiredText(value, fieldLabel, maxLength = 0) {
  const normalized = text(value, maxLength);

  if (!normalized) {
    const error = new Error(`${fieldLabel} is required.`);
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

function inferResourceType(url = "") {
  const clean = String(url).toLowerCase().split("?")[0];
  return /\.(mp4|webm|mov|m4v|ogg)$/.test(clean) ? "video" : "image";
}
