
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ClientPageHero from "../components/ui/ClientPageHero.jsx";
import MenuFilters from "../features/menu/MenuFilters.jsx";
import ProductGrid from "../features/menu/ProductGrid.jsx";

export default function MenuPage() {
  const { store } = useOutletContext();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const products = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return store.products.filter((item) => {
      const categoryId = String(
        item.categoryId?._id || item.categoryId || ""
      );

      const matchesCategory =
        category === "all" ||
        categoryId === category ||
        item.category === category;

      const searchable = [
        item.name,
        item.description,
        item.category,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!keyword || searchable.includes(keyword));
    });
  }, [store.products, query, category]);

  return (
    <main className="client-page">
      <ClientPageHero
        eyebrow="TRAP menu"
        title="what are you having?"
        description="Coffee, matcha, tea and fresh bakes — easy to browse on every screen."
        accent="yellow"
      />

      <section className="client-section bg-white">
        <div className="client-shell">
          <MenuFilters
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            categories={store.categories}
          />

          <div className="mt-12">
            <ProductGrid products={products} />
          </div>

          {store.toppings.length > 0 && (
            <section className="mt-24 border-t border-trap-blue/10 pt-12">
              <p className="client-eyebrow">Make it yours</p>
              <h2 className="client-title mt-4">extras.</h2>

              <div className="mt-10 grid border-t border-trap-blue/10 sm:grid-cols-2 lg:grid-cols-3">
                {store.toppings.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-4 border-b border-trap-blue/10 py-5 sm:px-5 sm:first:pl-0"
                  >
                    <div>
                      <p className="font-extrabold">{item.name}</p>
                      {item.group && (
                        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.13em] text-trap-ink/40">
                          {item.group}
                        </p>
                      )}
                    </div>

                    <p className="font-extrabold text-trap-orange">
                      {Number(item.price || 0).toLocaleString("en-US")} VND
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
