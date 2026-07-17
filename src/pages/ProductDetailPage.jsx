
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { getItemMedia, isVideoMedia } from "../lib/media.js";
import { money } from "../lib/product.js";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { store } = useOutletContext();

  const product = store.products.find(
    (item) => item._id === id || item.slug === id
  );

  const media = useMemo(
    () => getItemMedia(product),
    [product]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const touchStart = useRef(null);

  useEffect(() => {
    setActiveIndex(0);

    const defaultSize =
      product?.sizes?.find((size) => size.isDefault) ||
      product?.sizes?.[0];

    setSelectedSizeId(
      defaultSize ? String(defaultSize._id || defaultSize.name) : ""
    );
  }, [product?._id]);

  if (!product) {
    return (
      <main className="client-page grid min-h-[68svh] place-items-center bg-white p-6 text-center">
        <div>
          <p className="font-editorial text-5xl italic text-trap-blue">
            We could not find that item.
          </p>

          <Link
            to="/menu"
            className="mt-8 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-trap-blue px-6 text-[10px] font-extrabold uppercase tracking-[0.14em] text-trap-yellow"
          >
            <ArrowLeft size={17} />
            Back to menu
          </Link>
        </div>
      </main>
    );
  }

  const activeMedia = media[activeIndex];
  const selectedSize = product.sizes?.find(
    (size) =>
      String(size._id || size.name) === selectedSizeId
  );

  const displayPrice = selectedSize?.price ?? product.price;

  function previous() {
    setActiveIndex((current) =>
      current === 0 ? media.length - 1 : current - 1
    );
  }

  function next() {
    setActiveIndex((current) =>
      current === media.length - 1 ? 0 : current + 1
    );
  }

  function handleTouchStart(event) {
    touchStart.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event) {
    if (touchStart.current == null || media.length < 2) return;

    const end = event.changedTouches[0]?.clientX ?? touchStart.current;
    const distance = end - touchStart.current;
    touchStart.current = null;

    if (Math.abs(distance) < 45) return;
    distance < 0 ? next() : previous();
  }

  return (
    <main className="client-page">
      <section className="grid min-h-[calc(100svh-116px)] lg:grid-cols-[1.08fr_.92fr]">
        <div className="relative bg-[#f4f0e7] p-3 sm:p-5 lg:p-7">
          <Link
            to="/menu"
            className="client-touch absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 text-[9px] font-extrabold uppercase tracking-[0.13em] text-trap-blue shadow-lg backdrop-blur-md"
          >
            <ArrowLeft size={16} />
            Menu
          </Link>

          <div
            className="relative grid min-h-[62svh] place-items-center overflow-hidden bg-[#ece8df] lg:min-h-[calc(100svh-170px)]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {activeMedia ? (
              isVideoMedia(activeMedia) ? (
                <video
                  key={activeMedia.url}
                  src={activeMedia.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full min-h-[62svh] w-full object-cover lg:min-h-[calc(100svh-170px)]"
                />
              ) : (
                <img
                  key={activeMedia.url}
                  src={activeMedia.url}
                  alt={`${product.name} ${activeIndex + 1}`}
                  className="h-full min-h-[62svh] w-full object-cover lg:min-h-[calc(100svh-170px)]"
                />
              )
            ) : (
              <div className="text-center text-trap-blue">
                <Coffee className="mx-auto" size={48} />
                <p className="mt-4 font-display text-5xl lowercase">
                  trap
                </p>
              </div>
            )}

            {media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previous}
                  aria-label="Previous media"
                  className="client-touch absolute left-3 top-1/2 grid -translate-y-1/2 place-items-center rounded-full bg-white/90 text-trap-blue shadow-lg backdrop-blur"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={next}
                  aria-label="Next media"
                  className="client-touch absolute right-3 top-1/2 grid -translate-y-1/2 place-items-center rounded-full bg-white/90 text-trap-blue shadow-lg backdrop-blur"
                >
                  <ChevronRight size={20} />
                </button>

                <span className="absolute bottom-3 right-3 rounded-full bg-trap-blue/80 px-3 py-2 text-[9px] font-extrabold text-white backdrop-blur">
                  {activeIndex + 1} / {media.length}
                </span>
              </>
            )}
          </div>

          {media.length > 1 && (
            <div className="client-scroll mt-3">
              {media.map((item, index) => (
                <button
                  key={`${item.url}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={[
                    "h-20 w-20 shrink-0 overflow-hidden border-2 bg-white",
                    activeIndex === index
                      ? "border-trap-blue"
                      : "border-transparent opacity-60",
                  ].join(" ")}
                >
                  {isVideoMedia(item) ? (
                    <video
                      src={item.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="bg-white">
          <div className="flex min-h-full flex-col justify-center px-4 py-14 sm:px-8 lg:sticky lg:top-[116px] lg:min-h-[calc(100svh-116px)] lg:px-12 xl:px-16">
            <p className="client-eyebrow">
              {product.category || "TRAP menu"}
            </p>

            <h1 className="mt-4 font-display text-[clamp(3rem,7vw,6.5rem)] lowercase leading-[0.84] tracking-[-0.08em] text-trap-blue text-balance">
              {product.name}
            </h1>

            <p className="mt-6 text-2xl font-extrabold text-trap-ink">
              {money(displayPrice)}
            </p>

            {product.description && (
              <p className="client-copy mt-6">
                {product.description}
              </p>
            )}

            {product.sizes?.length > 0 && (
              <fieldset className="mt-8">
                <legend className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-trap-blue">
                  Choose a size
                </legend>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {product.sizes.map((size) => {
                    const key = String(size._id || size.name);
                    const selected = key === selectedSizeId;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedSizeId(key)}
                        className={[
                          "client-touch flex items-center justify-between gap-3 border p-4 text-left transition",
                          selected
                            ? "border-trap-blue bg-[#fff9d7]"
                            : "border-trap-blue/12 bg-white",
                        ].join(" ")}
                      >
                        <span>
                          <strong className="block text-sm">
                            {size.name}
                          </strong>
                          <small className="mt-1 block text-xs text-trap-ink/50">
                            {money(size.price)}
                          </small>
                        </span>

                        <span
                          className={[
                            "grid h-6 w-6 place-items-center rounded-full border",
                            selected
                              ? "border-trap-blue bg-trap-blue text-trap-yellow"
                              : "border-trap-blue/20",
                          ].join(" ")}
                        >
                          {selected && <Check size={14} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <Link
                to="/reservation"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-trap-blue px-6 text-[10px] font-extrabold uppercase tracking-[0.14em] text-trap-yellow"
              >
                Visit TRAP Room
                <ArrowUpRight size={16} />
              </Link>

              <Link
                to="/menu"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-trap-blue/20 px-6 text-[10px] font-extrabold uppercase tracking-[0.14em] text-trap-blue"
              >
                Keep browsing
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
