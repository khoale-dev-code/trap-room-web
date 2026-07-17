
import { Images } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { isVideoMedia } from "../../lib/media.js";

export default function GalleryPreview({ items }) {
  return (
    <section className="client-section overflow-hidden bg-white">
      <div className="client-shell">
        <SectionHeader
          eyebrow="Look what is happening"
          title="cute drinks. good people. bright room."
          description="A little look at TRAP Room through our latest photos."
          link="/gallery"
          linkLabel="Open gallery"
        />
      </div>

      {items.length > 0 ? (
        <div className="client-scroll mt-12 px-4 pb-5 sm:px-6 lg:px-12">
          {items.slice(0, 8).map((item, index) => (
            <GalleryCard
              key={`${item.url}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="client-shell mt-12">
          <EmptyState
            title="No gallery images yet."
            description="Add images in Admin to build this section."
          />
        </div>
      )}
    </section>
  );
}

function GalleryCard({ item, index }) {
  const widths = [
    "w-[82vw] sm:w-[52vw] lg:w-[34vw]",
    "w-[72vw] sm:w-[44vw] lg:w-[28vw]",
    "w-[86vw] sm:w-[58vw] lg:w-[38vw]",
  ];

  return (
    <article
      className={[
        "group relative shrink-0 snap-center overflow-hidden bg-[#eef1ff]",
        "aspect-[4/5]",
        widths[index % widths.length],
      ].join(" ")}
    >
      {isVideoMedia(item) ? (
        <video
          src={item.url}
          muted
          playsInline
          controls
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={item.url}
          alt={item.title || "TRAP Room"}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-trap-blue/72 via-transparent to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
        <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-trap-yellow">
          Inside TRAP
        </p>

        <h3 className="mt-2 text-xl font-extrabold leading-tight text-balance sm:text-2xl">
          {item.title || "A moment at TRAP Room"}
        </h3>
      </div>
    </article>
  );
}
