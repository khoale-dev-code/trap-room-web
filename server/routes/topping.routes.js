import { Topping } from "../models/Topping.js";
import { createResourceRouter } from "../utils/createResourceRouter.js";

export default createResourceRouter({
  Model: Topping,
  responseKey: "toppings",
  itemKey: "topping",
  titleField: "name",
  searchableFields: ["name", "group", "description"],
  textFields: ["group", "description"],
  numberFields: ["price", "sortOrder"],
  booleanFields: ["isAvailable", "isActive"],
  defaults: {
    group: "Extra",
    price: 0,
    sortOrder: 999,
    isAvailable: true,
    isActive: true,
  },
  listFilter(query) {
    const filter = {};

    if (query.status === "active") {
      filter.isActive = { $ne: false };
      filter.isAvailable = { $ne: false };
    }

    if (query.status === "hidden") {
      filter.$or = [
        { isActive: false },
        { isAvailable: false },
      ];
    }

    return filter;
  },
});
