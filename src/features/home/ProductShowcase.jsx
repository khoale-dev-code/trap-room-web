
import SectionHeader from "../../components/ui/SectionHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ProductCard from "../menu/ProductCard.jsx";

export default function ProductShowcase({
  products,
  loading,
}) {
  return (
    <section className="client-section bg-white">
      <div className="client-shell">
        <SectionHeader
          eyebrow="TRAP favorites"
          title="start with these."
          description="A few drinks and bakes that are always a good place to begin."
          link="/menu"
          linkLabel="See the full menu"
        />

        {products.length > 0 ? (
          <div className="client-scroll client-scroll-grid mt-12 lg:grid-cols-4">
            {products.slice(0, 4).map((product, index) => (
              <div
                key={product._id || product.slug || index}
                className="client-scroll-item"
              >
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12">
            <EmptyState
              title={loading ? "Loading the menu..." : "No menu items yet."}
              description="Add menu items in Admin to display them here."
            />
          </div>
        )}
      </div>
    </section>
  );
}
