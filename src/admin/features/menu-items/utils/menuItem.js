
import { toVndNumber } from "./currency.js";

export function createEmptyMenuItemForm(nextOrder = 1) {
  return {
    name: "",
    categoryId: "",
    description: "",
    price: 0,
    oldPrice: 0,
    sizes: [],
    tags: [],
    sortOrder: nextOrder,
    isFeatured: false,
    isAvailable: true,
  };
}

export function menuItemToForm(product) {
  return {
    name: product?.name || "",
    categoryId:
      product?.categoryId?._id ||
      product?.categoryId ||
      "",
    description: product?.description || "",
    price: toVndNumber(product?.price),
    oldPrice: toVndNumber(product?.oldPrice),
    sizes: Array.isArray(product?.sizes)
      ? product.sizes.map((size) => ({
          name: size?.name || "",
          price: toVndNumber(size?.price),
          oldPrice: toVndNumber(size?.oldPrice),
          isDefault: Boolean(size?.isDefault),
        }))
      : [],
    tags: Array.isArray(product?.tags) ? product.tags : [],
    sortOrder: Math.max(1, Number(product?.sortOrder || 1)),
    isFeatured: product?.isFeatured === true,
    isAvailable: product?.isAvailable !== false,
  };
}

export function getNextSortOrder(products) {
  return (
    Math.max(
      0,
      ...products.map((product) =>
        Number(product?.sortOrder || 0)
      )
    ) + 1
  );
}

export function buildMenuItemPayload({
  form,
  categories,
  media,
  nextOrder,
}) {
  const selectedCategory = categories.find(
    (category) =>
      String(category._id) === String(form.categoryId)
  );

  const normalizedMedia = media.map((item, index) => ({
    ...item,
    sortOrder: index + 1,
  }));

  const firstImage = normalizedMedia.find(
    (item) => getResourceType(item) !== "video"
  );

  return {
    name: String(form.name || "").trim(),
    categoryId: form.categoryId || "",
    category: selectedCategory?.name || "",
    description: String(form.description || "").trim(),
    price: toVndNumber(form.price),
    oldPrice: toVndNumber(form.oldPrice),
    sizes: (Array.isArray(form.sizes) ? form.sizes : [])
      .map((size) => ({
        name: String(size?.name || "").trim(),
        price: toVndNumber(size?.price),
        oldPrice: toVndNumber(size?.oldPrice),
        isDefault: Boolean(size?.isDefault),
      }))
      .filter((size) => size.name),
    tags: [
      ...new Set(
        (Array.isArray(form.tags) ? form.tags : [])
          .map((tag) => String(tag).trim())
          .filter(Boolean)
      ),
    ],
    sortOrder: Math.max(
      1,
      Number(form.sortOrder || nextOrder)
    ),
    isFeatured: Boolean(form.isFeatured),
    isAvailable: Boolean(form.isAvailable),
    media: normalizedMedia,
    imageUrl: firstImage?.url || "",
  };
}

export function normalizeMedia(product) {
  if (
    Array.isArray(product?.media) &&
    product.media.length > 0
  ) {
    return product.media.filter((item) => item?.url);
  }

  return product?.imageUrl
    ? [{ url: product.imageUrl, resourceType: "image" }]
    : [];
}

export function getResourceType(item) {
  if (
    String(item?.resourceType || "").toLowerCase() === "video"
  ) {
    return "video";
  }

  const url = String(item?.url || "")
    .toLowerCase()
    .split("?")[0];

  return /\.(mp4|webm|mov|m4v|ogg)$/.test(url)
    ? "video"
    : "image";
}

export function sortMenuItems(a, b) {
  const orderA = Number(a?.sortOrder || 999);
  const orderB = Number(b?.sortOrder || 999);

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return (
    new Date(b?.createdAt || 0) -
    new Date(a?.createdAt || 0)
  );
}

export function collectReusableTags(products) {
  return [
    ...new Set(
      products.flatMap((product) =>
        Array.isArray(product?.tags)
          ? product.tags
              .map((tag) => String(tag).trim())
              .filter(Boolean)
          : []
      )
    ),
  ].sort((a, b) =>
    a.localeCompare(b, "vi", {
      sensitivity: "base",
    })
  );
}

export function filterMenuItems({
  products,
  query,
  statusFilter,
  categoryFilter,
}) {
  const keyword = String(query || "").trim().toLowerCase();

  return [...products]
    .sort(sortMenuItems)
    .filter((product) => {
      const categoryName =
        product?.categoryId?.name ||
        product?.category ||
        "";

      const searchable = [
        product?.name,
        product?.description,
        categoryName,
        ...(product?.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !keyword || searchable.includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available" &&
          product?.isAvailable !== false) ||
        (statusFilter === "unavailable" &&
          product?.isAvailable === false) ||
        (statusFilter === "featured" &&
          product?.isFeatured === true);

      const productCategoryId =
        product?.categoryId?._id ||
        product?.categoryId ||
        "";

      const matchesCategory =
        categoryFilter === "all" ||
        String(productCategoryId) ===
          String(categoryFilter);

      return (
        matchesQuery &&
        matchesStatus &&
        matchesCategory
      );
    });
}
