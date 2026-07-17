
export function money(value) {
  const amount = Number(value || 0);

  return amount
    ? `${amount.toLocaleString("en-US")} VND`
    : "Ask in store";
}

export function getProductId(product) {
  return String(product?._id || product?.id || product?.slug || "");
}

export function getProductPath(product) {
  return `/menu/${product?.slug || getProductId(product)}`;
}

export function getCategoryName(product) {
  return (
    product?.categoryId?.name ||
    product?.category ||
    "TRAP favorite"
  );
}

export function groupProductsByCategory(products = []) {
  const groups = new Map();

  products.forEach((product) => {
    const name = getCategoryName(product);

    if (!groups.has(name)) {
      groups.set(name, []);
    }

    groups.get(name).push(product);
  });

  return Array.from(groups.entries()).map(([name, items]) => ({
    name,
    products: items,
  }));
}
