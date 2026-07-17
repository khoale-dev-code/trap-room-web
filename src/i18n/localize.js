
const RESOURCE_FIELDS = {
  shop: [
    "name",
    "tagline",
    "description",
    "note",
    "address",
    "openingHours",
  ],
  category: ["name", "description"],
  product: ["name", "description", "category"],
  topping: ["name", "group", "description"],
  post: ["title", "content", "excerpt"],
  promotion: [
    "title",
    "discountText",
    "description",
    "linkLabel",
  ],
  gallery: ["title", "description"],
};

function getTranslationBucket(entity, language) {
  const translations = entity?.translations;

  if (!translations || typeof translations !== "object") {
    return null;
  }

  return translations[language] || null;
}

export function localizeEntity(entity, language, resource) {
  if (!entity || typeof entity !== "object") {
    return entity;
  }

  const fields = RESOURCE_FIELDS[resource] || [];
  const bucket = getTranslationBucket(entity, language);

  if (!bucket || typeof bucket !== "object") {
    return entity;
  }

  const localized = { ...entity };

  fields.forEach((field) => {
    const translatedValue = bucket[field];

    if (
      translatedValue !== undefined &&
      translatedValue !== null &&
      translatedValue !== ""
    ) {
      localized[field] = translatedValue;
    }
  });

  if (
    resource === "product" &&
    entity.categoryId &&
    typeof entity.categoryId === "object"
  ) {
    localized.categoryId = localizeEntity(
      entity.categoryId,
      language,
      "category"
    );
  }

  return localized;
}

export function localizePublicStore(data, language) {
  if (!data || typeof data !== "object") {
    return data;
  }

  return {
    ...data,
    shop: localizeEntity(data.shop, language, "shop"),
    categories: mapResource(data.categories, language, "category"),
    products: mapResource(data.products, language, "product"),
    toppings: mapResource(data.toppings, language, "topping"),
    posts: mapResource(data.posts, language, "post"),
    promotions: mapResource(
      data.promotions,
      language,
      "promotion"
    ),
    gallery: mapResource(data.gallery, language, "gallery"),
  };
}

function mapResource(items, language, resource) {
  return Array.isArray(items)
    ? items.map((item) =>
        localizeEntity(item, language, resource)
      )
    : [];
}
