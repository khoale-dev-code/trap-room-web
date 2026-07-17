
export function getStatusField(config) {
  return config?.fields?.find((field) =>
    ["isActive", "isAvailable", "isPublished"].includes(field.name)
  )?.name || "";
}

export function hasFeaturedField(config) {
  return Boolean(
    config?.fields?.some((field) =>
      ["isFeatured", "isPinned"].includes(field.name)
    )
  );
}

export function getFilterOptions(config, copy) {
  const options = [["all", copy.all]];
  const statusField = getStatusField(config);

  if (statusField === "isActive" || statusField === "isPublished") {
    options.push(
      ["visible", copy.visible],
      ["hidden", copy.hidden]
    );
  }

  if (statusField === "isAvailable") {
    options.push(
      ["available", copy.available],
      ["unavailable", copy.unavailable]
    );
  }

  if (hasFeaturedField(config)) {
    options.push(["featured", copy.featured]);
  }

  return options;
}

export function normalizeMedia(item) {
  if (Array.isArray(item?.media) && item.media.length > 0) {
    return item.media.filter((mediaItem) => mediaItem?.url);
  }

  return item?.imageUrl
    ? [{ url: item.imageUrl, resourceType: "image" }]
    : [];
}

export function getResourceType(item) {
  if (String(item?.resourceType || "").toLowerCase() === "video") {
    return "video";
  }

  const url = String(item?.url || "")
    .toLowerCase()
    .split("?")[0];

  return /\.(mp4|webm|mov|m4v|ogg)$/.test(url)
    ? "video"
    : "image";
}

export function itemToForm(config, item) {
  return Object.fromEntries(
    (config?.fields || []).map((field) => {
      let value = item?.[field.name];

      if (field.type === "category-select") {
        value =
          item?.categoryId?._id ||
          item?.categoryId ||
          "";
      } else if (field.type === "tags") {
        value = Array.isArray(value)
          ? value.join(", ")
          : value || "";
      } else if (field.type === "sizes") {
        value = Array.isArray(value)
          ? value.map((size) => ({
              ...size,
              price: Number(size?.price || 0),
              oldPrice: Number(size?.oldPrice || 0),
              isDefault: Boolean(size?.isDefault),
            }))
          : [];
      } else if (value == null) {
        value =
          field.defaultValue ??
          (field.type === "checkbox" ? false : "");
      }

      return [field.name, value];
    })
  );
}

export function buildResourcePayload({
  config,
  form,
  media,
}) {
  const payload = {};

  for (const field of config?.fields || []) {
    payload[field.name] = serializeFieldValue(
      field,
      form?.[field.name]
    );
  }

  if (config?.supportsMedia) {
    const normalizedMedia = media.map((item, index) => ({
      ...item,
      sortOrder: index + 1,
    }));

    const firstImage = normalizedMedia.find(
      (item) => getResourceType(item) !== "video"
    );

    payload.media = normalizedMedia;
    payload.imageUrl = firstImage?.url || "";
  }

  return payload;
}

function serializeFieldValue(field, value) {
  if (field.type === "checkbox") {
    return Boolean(value);
  }

  if (field.type === "tags") {
    return String(value || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  if (field.type === "sizes") {
    return (Array.isArray(value) ? value : []).map((size) => ({
      ...size,
      name: String(size?.name || "").trim(),
      price: Number(size?.price || 0),
      oldPrice: Number(size?.oldPrice || 0),
      isDefault: Boolean(size?.isDefault),
    }));
  }

  if (field.type === "number") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  return value ?? "";
}

export function filterResources({
  items,
  query,
  filter,
}) {
  const keyword = String(query || "")
    .trim()
    .toLowerCase();

  return items.filter((item) => {
    const searchable = [
      item?.name,
      item?.title,
      item?.description,
      item?.content,
      item?.category,
      item?.code,
      ...(Array.isArray(item?.tags) ? item.tags : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesQuery =
      !keyword || searchable.includes(keyword);

    const matchesFilter =
      filter === "all" ||
      (filter === "visible" && item?.isActive !== false && item?.isPublished !== false) ||
      (filter === "hidden" && (item?.isActive === false || item?.isPublished === false)) ||
      (filter === "available" && item?.isAvailable !== false) ||
      (filter === "unavailable" && item?.isAvailable === false) ||
      (filter === "featured" &&
        (item?.isFeatured === true || item?.isPinned === true));

    return matchesQuery && matchesFilter;
  });
}

export function getResourceSummary(items, config) {
  const statusField = getStatusField(config);

  return items.reduce(
    (summary, item) => {
      summary.total += 1;

      if (statusField) {
        if (item?.[statusField] === false) {
          summary.hidden += 1;
        } else {
          summary.active += 1;
        }
      } else {
        summary.active += 1;
      }

      if (item?.isFeatured === true || item?.isPinned === true) {
        summary.featured += 1;
      }

      return summary;
    },
    {
      total: 0,
      active: 0,
      hidden: 0,
      featured: 0,
    }
  );
}

export function getItemTitle(item, fallback = "Untitled item") {
  return item?.name || item?.title || item?.code || fallback;
}

export function getItemDescription(item, fallback) {
  return item?.description || item?.content || fallback;
}

export function formatVnd(value, language = "en") {
  return new Intl.NumberFormat(
    language === "vi" ? "vi-VN" : "en-US",
    {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }
  ).format(Number(value || 0));
}
