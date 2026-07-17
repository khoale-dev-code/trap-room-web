
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ClientPageHero from "../components/ui/ClientPageHero.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { getGalleryMedia, isVideoMedia } from "../lib/media.js";

const labels = {
  all: "All",
  space: "Space",
  drink: "Drinks",
  bakery: "Bakes",
  event: "Events",
  other: "Other",
};

export default function GalleryPage() {
  const { store } = useOutletContext();
  const [category, setCategory] = useState("all");

  const media = useMemo(
    () => getGalleryMedia(store.gallery),
    [store.gallery]
  );

  const categories = [
    "all",
    ...Array.from(
      new Set(media.map((item) => item.category).filter(Boolean))
    ),
  ];

  const items =
    category === "all"
      ? media
      : media.filter((item) => item.category === category);

  return (
    <main className="client-page">
      <ClientPageHero
        eyebrow="TRAP visual"
        title="inside the room."
        description="Drinks, bakes, people and the colorful details that make TRAP feel like TRAP."
        accent="yellow"
      />

      <section className="client-section bg-white">
        <div className="client-shell">
          <div className="client-scroll border-b border-trap-blue/10 pb-7">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={[
                  "client-touch shrink-0 rounded-full border px-5",
                  "text-[9px] font-extrabold uppercase tracking-[0.13em]",
                  category === item
                    ? "border-trap-blue bg-trap-blue text-trap-yellow"
                    : "border-trap-blue/15 bg-white text-trap-blue",
                ].join(" ")}
              >
                {labels[item] || item}
              </button>
            ))}
          </div>

          {items.length > 0 ? (
            <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
              {items.map((item, index) => (
                <article
                  key={`${item.url}-${index}`}
                  className="client-card mb-5 break-inside-avoid"
                >
                  {isVideoMedia(item) ? (
                    <video
                      src={item.url}
                      controls
                      playsInline
                      className="w-full"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title || "TRAP Room"}
                      className="w-full"
                      loading="lazy"
                    />
                  )}

                  {(item.title || item.description) && (
                    <div className="p-5">
                      <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-trap-orange">
                        {labels[item.category] || item.category || "TRAP"}
                      </p>

                      {item.title && (
                        <h2 className="mt-2 text-xl font-extrabold text-trap-blue">
                          {item.title}
                        </h2>
                      )}

                      {item.description && (
                        <p className="mt-3 text-sm font-medium leading-6 text-trap-ink/55">
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState
                title="No images in this category."
                description="Try another filter or add new gallery items in Admin."
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
