
import EmptyState from "../../components/ui/EmptyState.jsx";
import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products }) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No menu items matched."
        description="Try another keyword or category."
      />
    );
  }

  return (
    <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product._id || product.slug || index}
          product={product}
          index={index}
        />
      ))}
    </div>
  );
}
