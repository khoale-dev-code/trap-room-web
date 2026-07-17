import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Maximize2,
  Play,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getJournalMedia,
  isJournalVideo,
} from "../utils/journal.js";

function ContainedImage({
  src,
  alt,
  priority = false,
  className = "",
}) {
  return (
    <div
      className={[
        "relative isolate overflow-hidden bg-[#eef1ff]",
        className,
      ].join(" ")}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-2xl"
      />

      <img
        src={src}
        alt={alt}
        loading={
          priority
            ? "eager"
            : "lazy"
        }
        fetchPriority={
          priority
            ? "high"
            : "auto"
        }
        decoding="async"
        className="relative z-10 h-full w-full object-contain p-2 sm:p-3"
      />
    </div>
  );
}

function ContainedVideo({
  item,
  controls = false,
  className = "",
}) {
  return (
    <div
      className={[
        "relative isolate overflow-hidden bg-trap-ink",
        className,
      ].join(" ")}
    >
      <video
        src={item.url}
        poster={item.posterUrl || ""}
        controls={controls}
        muted={!controls}
        playsInline
        preload="metadata"
        className="relative z-10 h-full w-full object-contain"
      />

      {!controls && (
        <span className="pointer-events-none absolute bottom-3 right-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/92 text-trap-blue shadow-lg backdrop-blur">
          <Play
            size={16}
            fill="currentColor"
          />
        </span>
      )}
    </div>
  );
}

export default function JournalMedia({
  post,
  className = "",
  priority = false,
  controls = false,
}) {
  const media =
    getJournalMedia(post);

  const primary = media[0];

  if (!primary) {
    return (
      <div
        className={[
          "grid min-h-64 place-items-center bg-[#eef1ff] text-trap-blue",
          className,
        ].join(" ")}
      >
        <ImageIcon size={42} />
      </div>
    );
  }

  if (isJournalVideo(primary)) {
    return (
      <ContainedVideo
        item={primary}
        controls={controls}
        className={className}
      />
    );
  }

  return (
    <ContainedImage
      src={primary.url}
      alt={
        primary.alt ||
        post?.title ||
        "TRAP Room journal"
      }
      priority={priority}
      className={className}
    />
  );
}

export function JournalMediaGallery({
  post,
}) {
  const media =
    getJournalMedia(post);

  const scrollerRef =
    useRef(null);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [lightboxOpen, setLightboxOpen] =
    useState(false);

  const validMedia = useMemo(
    () =>
      media.filter(
        (item) => item?.url
      ),
    [media]
  );

  useEffect(() => {
    if (!lightboxOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        setActiveIndex(
          (current) =>
            Math.max(
              0,
              current - 1
            )
        );
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        setActiveIndex(
          (current) =>
            Math.min(
              validMedia.length - 1,
              current + 1
            )
        );
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [
    lightboxOpen,
    validMedia.length,
  ]);

  function updateActiveIndex() {
    const scroller =
      scrollerRef.current;

    if (!scroller) {
      return;
    }

    const width =
      scroller.clientWidth || 1;

    setActiveIndex(
      Math.round(
        scroller.scrollLeft /
          width
      )
    );
  }

  function goTo(index) {
    const safeIndex =
      Math.max(
        0,
        Math.min(
          validMedia.length - 1,
          index
        )
      );

    setActiveIndex(safeIndex);

    scrollerRef.current?.scrollTo({
      left:
        scrollerRef.current
          .clientWidth *
        safeIndex,
      behavior: "smooth",
    });
  }

  if (!validMedia.length) {
    return (
      <JournalMedia
        post={post}
        className="aspect-[4/3] rounded-[1.5rem] sm:aspect-[16/10] sm:rounded-[2rem]"
      />
    );
  }

  return (
    <>
      <section
        aria-label="Journal media"
        className="overflow-hidden rounded-[1.5rem] border border-trap-blue/10 bg-white shadow-[0_20px_70px_rgba(1,30,160,0.08)] sm:rounded-[2rem]"
      >
        <div className="relative">
          <div
            ref={scrollerRef}
            onScroll={updateActiveIndex}
            className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {validMedia.map(
              (item, index) => (
                <div
                  key={
                    item.publicId ||
                    item.url ||
                    index
                  }
                  className="relative h-[52svh] min-h-[320px] max-h-[720px] w-full shrink-0 snap-center snap-always bg-[#eef1ff] sm:h-[64svh]"
                >
                  {isJournalVideo(
                    item
                  ) ? (
                    <ContainedVideo
                      item={item}
                      controls
                      className="h-full w-full"
                    />
                  ) : (
                    <ContainedImage
                      src={item.url}
                      alt={
                        item.alt ||
                        `${post?.title || "Journal"} ${index + 1}`
                      }
                      priority={
                        index === 0
                      }
                      className="h-full w-full"
                    />
                  )}

                  {!isJournalVideo(
                    item
                  ) && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveIndex(
                          index
                        );
                        setLightboxOpen(
                          true
                        );
                      }}
                      aria-label="Open image fullscreen"
                      className="absolute right-3 top-3 z-30 grid h-11 w-11 place-items-center rounded-full border border-white/60 bg-white/90 text-trap-blue shadow-lg backdrop-blur transition hover:bg-white sm:right-4 sm:top-4"
                    >
                      <Maximize2 size={17} />
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          {validMedia.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  goTo(
                    activeIndex - 1
                  )
                }
                disabled={
                  activeIndex === 0
                }
                aria-label="Previous media"
                className="absolute left-3 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/90 text-trap-blue shadow-lg backdrop-blur transition hover:bg-white disabled:opacity-30 sm:grid"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={() =>
                  goTo(
                    activeIndex + 1
                  )
                }
                disabled={
                  activeIndex ===
                  validMedia.length - 1
                }
                aria-label="Next media"
                className="absolute right-3 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/90 text-trap-blue shadow-lg backdrop-blur transition hover:bg-white disabled:opacity-30 sm:grid"
              >
                <ChevronRight size={19} />
              </button>
            </>
          )}
        </div>

        <div className="flex min-h-14 items-center justify-between gap-4 border-t border-trap-blue/10 px-4 sm:px-5">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-trap-ink/40">
            Swipe to view
          </p>

          <div className="flex items-center gap-2">
            {validMedia.map(
              (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    goTo(index)
                  }
                  aria-label={`Go to media ${index + 1}`}
                  className={[
                    "h-2 rounded-full transition-all",
                    activeIndex ===
                    index
                      ? "w-6 bg-trap-blue"
                      : "w-2 bg-trap-blue/20",
                  ].join(" ")}
                />
              )
            )}
          </div>

          <p className="min-w-12 text-right text-[9px] font-extrabold uppercase tracking-[0.12em] text-trap-blue">
            {activeIndex + 1}/
            {validMedia.length}
          </p>
        </div>
      </section>

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen journal image"
          className="fixed inset-0 z-[120] grid bg-black/95 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:p-6"
        >
          <button
            type="button"
            onClick={() =>
              setLightboxOpen(false)
            }
            aria-label="Close fullscreen image"
            className="absolute right-3 top-[max(.75rem,env(safe-area-inset-top))] z-20 grid h-12 w-12 place-items-center rounded-full bg-white/12 text-white backdrop-blur sm:right-6 sm:top-6"
          >
            <X size={22} />
          </button>

          <div className="relative grid min-h-0 place-items-center overflow-hidden">
            <img
              src={
                validMedia[
                  activeIndex
                ]?.url
              }
              alt={
                validMedia[
                  activeIndex
                ]?.alt ||
                post?.title ||
                "Journal image"
              }
              className="max-h-[calc(100svh-7rem)] max-w-full select-none object-contain"
            />

            {validMedia.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      (current) =>
                        Math.max(
                          0,
                          current - 1
                        )
                    )
                  }
                  disabled={
                    activeIndex === 0
                  }
                  aria-label="Previous fullscreen image"
                  className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur disabled:opacity-25 sm:left-4"
                >
                  <ChevronLeft size={23} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      (current) =>
                        Math.min(
                          validMedia.length - 1,
                          current + 1
                        )
                    )
                  }
                  disabled={
                    activeIndex ===
                    validMedia.length - 1
                  }
                  aria-label="Next fullscreen image"
                  className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur disabled:opacity-25 sm:right-4"
                >
                  <ChevronRight size={23} />
                </button>
              </>
            )}
          </div>

          <p className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-full bg-white/12 px-4 py-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white backdrop-blur">
            {activeIndex + 1} /{" "}
            {validMedia.length}
          </p>
        </div>
      )}
    </>
  );
}
