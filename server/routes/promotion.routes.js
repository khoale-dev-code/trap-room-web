import { Promotion } from "../models/Promotion.js";
import { createResourceRouter } from "../utils/createResourceRouter.js";
import {
  assertDateString,
  optionalUrl,
  text,
} from "../utils/common.js";

export default createResourceRouter({
  Model: Promotion,
  responseKey: "promotions",
  itemKey: "promotion",
  titleField: "title",
  searchableFields: ["title", "description", "code", "discountText"],
  textFields: [
    "description",
    "code",
    "discountText",
    "startDate",
    "endDate",
    "linkLabel",
    "linkUrl",
  ],
  numberFields: ["sortOrder"],
  booleanFields: ["isFeatured", "isActive"],
  defaults: {
    sortOrder: 999,
    isFeatured: false,
    isActive: true,
  },
  afterClean(next, source, partial) {
    if (!partial || Object.hasOwn(source, "startDate")) {
      next.startDate = assertDateString(source.startDate, "Start date");
    }

    if (!partial || Object.hasOwn(source, "endDate")) {
      next.endDate = assertDateString(source.endDate, "End date");
    }

    if (next.startDate && next.endDate && next.endDate < next.startDate) {
      const error = new Error("End date cannot be earlier than start date.");
      error.statusCode = 400;
      throw error;
    }

    if (!partial || Object.hasOwn(source, "linkUrl")) {
      next.linkUrl = optionalUrl(source.linkUrl, "Offer link URL");
    }

    if (Object.hasOwn(next, "code")) {
      next.code = text(next.code, 80).toUpperCase();
    }

    return next;
  },
  listFilter(query) {
    if (query.status === "active") return { isActive: { $ne: false } };
    if (query.status === "hidden") return { isActive: false };
    if (query.status === "featured") return { isFeatured: true };
    return {};
  },
});
