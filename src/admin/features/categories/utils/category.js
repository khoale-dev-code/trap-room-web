
export const EMPTY_CATEGORY_FORM = Object.freeze({
  name: "",
  description: "",
  sortOrder: 1,
  isActive: true,
});

export function createCategoryForm(nextOrder = 1) {
  return {
    ...EMPTY_CATEGORY_FORM,
    sortOrder: Math.max(1, Number(nextOrder || 1)),
  };
}

export function categoryToForm(category) {
  return {
    name: category?.name || "",
    description: category?.description || "",
    sortOrder: Math.max(1, Number(category?.sortOrder || 1)),
    isActive: category?.isActive !== false,
  };
}

export function sortCategories(a, b) {
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

export function getNextCategoryOrder(items) {
  return (
    Math.max(
      0,
      ...items.map((item) =>
        Number(item?.sortOrder || 0)
      )
    ) + 1
  );
}

export function normalizeCategoryOrder(items) {
  return [...items]
    .sort(sortCategories)
    .map((item, index) => ({
      ...item,
      sortOrder: index + 1,
    }));
}

export function moveCategoryInList(items, categoryId, direction) {
  const ordered = normalizeCategoryOrder(items);
  const currentIndex = ordered.findIndex(
    (item) => item._id === categoryId
  );
  const targetIndex = currentIndex + Number(direction || 0);

  if (
    currentIndex < 0 ||
    targetIndex < 0 ||
    targetIndex >= ordered.length
  ) {
    return ordered;
  }

  const next = [...ordered];
  const [moved] = next.splice(currentIndex, 1);
  next.splice(targetIndex, 0, moved);

  return next.map((item, index) => ({
    ...item,
    sortOrder: index + 1,
  }));
}

export function placeCategoryAtOrder(
  items,
  categoryId,
  desiredOrder
) {
  const ordered = normalizeCategoryOrder(items);
  const currentIndex = ordered.findIndex(
    (item) => item._id === categoryId
  );

  if (currentIndex < 0) {
    return ordered;
  }

  const [moved] = ordered.splice(currentIndex, 1);
  const targetIndex = Math.max(
    0,
    Math.min(
      Number(desiredOrder || 1) - 1,
      ordered.length
    )
  );

  ordered.splice(targetIndex, 0, moved);

  return ordered.map((item, index) => ({
    ...item,
    sortOrder: index + 1,
  }));
}

export function filterCategories({
  items,
  query,
  filter,
}) {
  const keyword = String(query || "")
    .trim()
    .toLowerCase();

  return normalizeCategoryOrder(items).filter((item) => {
    const searchable = [
      item?.name,
      item?.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesQuery =
      !keyword || searchable.includes(keyword);

    const matchesFilter =
      filter === "all" ||
      (filter === "active" &&
        item?.isActive !== false) ||
      (filter === "hidden" &&
        item?.isActive === false);

    return matchesQuery && matchesFilter;
  });
}

export function getCategorySummary(items) {
  return items.reduce(
    (summary, item) => {
      summary.total += 1;

      if (item?.isActive === false) {
        summary.hidden += 1;
      } else {
        summary.visible += 1;
      }

      return summary;
    },
    {
      total: 0,
      visible: 0,
      hidden: 0,
    }
  );
}
