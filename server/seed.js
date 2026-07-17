import { connectDatabase } from "./config/db.js";
import { MenuCategory } from "./models/MenuCategory.js";
import { Product } from "./models/Product.js";
import { Shop } from "./models/Shop.js";

const categories = [
  { name: "Coffee", sortOrder: 1 },
  { name: "Matcha", sortOrder: 2 },
  { name: "Homebaked", sortOrder: 3 },
];

const products = [
  {
    name: "TRAP Signature Coffee",
    category: "Coffee",
    description:
      "A balanced house coffee with a clean finish and plenty of character.",
    price: 65000,
    sortOrder: 1,
    isFeatured: true,
  },
  {
    name: "Cloud Matcha",
    category: "Matcha",
    description:
      "Smooth matcha with a light, airy finish.",
    price: 72000,
    sortOrder: 2,
    isFeatured: true,
  },
  {
    name: "Butter Cookie",
    category: "Homebaked",
    description:
      "A fresh, buttery bake made for your coffee break.",
    price: 38000,
    sortOrder: 3,
    isFeatured: true,
  },
];

async function seed() {
  await connectDatabase();

  await Shop.findOneAndUpdate(
    {},
    {},
    {
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  for (const data of categories) {
    await MenuCategory.findOneAndUpdate(
      { name: data.name },
      data,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  for (const data of products) {
    const category = await MenuCategory.findOne({
      name: data.category,
    });

    await Product.findOneAndUpdate(
      { name: data.name },
      {
        ...data,
        categoryId: category?._id || null,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  console.log("TRAP Room sample data is ready.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
