
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Images,
  MapPin,
  Newspaper,
  Sparkles,
  Tag,
} from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import ProductCard from "../components/ProductCard.jsx";
import "../styles/homepage.css";
import { resolveGoogleMapsDirectionsUrl, resolveGoogleMapsEmbedUrl } from "../lib/googleMapsEmbed.js";
import "../styles/homepage-visual-polish-v9.css";

export default function HomePage() {
  const context = useOutletContext() || {};
  const store = context.store || {};
  const loading = Boolean(context.loading);
  const error = context.error || "";

  const shop = store.shop || {};

  const managedHomepageMedia =
    shop.homepageMediaConfigured === true;

  const mapEmbedUrl =
    resolveGoogleMapsEmbedUrl(
      shop
    );

  const mapDirectionsUrl =
    resolveGoogleMapsDirectionsUrl(
      shop
    );
  const products = Array.isArray(store.products) ? store.products : [];
  const posts = Array.isArray(store.posts) ? store.posts : [];
  const promotions = Array.isArray(store.promotions)
    ? store.promotions
    : [];
  const gallery = Array.isArray(store.gallery) ? store.gallery : [];

  const visibleGallery = gallery
    .filter((item) => item?.isActive !== false)
    .sort(sortByOrder);

  const heroImage =
    firstUrl([
      shop.homeHeroImageUrl,
      shop.heroImageUrl,
      (
      managedHomepageMedia
        ? ""
        : shop.heroImages?.[0]
    ) ||
      shop.coverImageUrl,
      getImage(visibleGallery[0]),
      getImage(products[0]),
    ]);

  /*
   * Our Story must be independent from the cover image.
   * The resolver supports current and future Admin field names, then searches
   * for a room/story/space Gallery item. It deliberately rejects the cover URL.
   */
  const storyImage = resolveStoryImage({
    shop,
    gallery: visibleGallery,
    heroImage,
    managedHomepageMedia,
  });

  const featuredProducts = products
    .filter(
      (item) =>
        item?.isActive !== false &&
        item?.isAvailable !== false &&
        item?.isFeatured === true
    )
    .sort(sortByOrder)
    .slice(0, 8);

  const menuProducts = (
    featuredProducts.length
      ? featuredProducts
      : products.filter(
          (item) =>
            item?.isActive !== false &&
            item?.isAvailable !== false
        )
  )
    .sort(sortByOrder)
    .slice(0, 8);

  const latestPosts = posts
    .filter(
      (item) =>
        item?.isPublished !== false &&
        item?.isActive !== false
    )
    .sort(sortByDate)
    .slice(0, 8);

  const activePromotions = promotions
    .filter(
      (item) =>
        item?.isActive !== false &&
        item?.isPublished !== false
    )
    .sort(sortByDate)
    .slice(0, 8);

  const happeningItems = activePromotions.length
    ? activePromotions
    : latestPosts;

  const galleryCards = flattenGallery(visibleGallery).slice(0, 10);

  return (
    <main className="trap-home bg-trap-paper text-trap-ink">
      <section className="trap-home-safe-x trap-home-hero">
        <div className="trap-home-hero-grid">
          <div className="trap-home-hero-copy">
            <p className="trap-home-kicker">
              {shop.tagline || "Coffee · Matcha · Homebaked"}
            </p>

            <h1 className="trap-home-display">
              Coffee made bright.
            </h1>

            <p className="trap-home-lead">
              {shop.description ||
                "A colorful room for carefully made drinks, fresh bakes and easygoing afternoons."}
            </p>

            <div className="trap-home-actions">
              <Link to="/menu" className="trap-home-button trap-home-button--primary">
                Explore the menu
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/reservation"
                className="trap-home-button trap-home-button--secondary"
              >
                Book a table
                <CalendarDays size={17} />
              </Link>
            </div>
          </div>

          <FullImageFrame
            src={heroImage}
            alt={`${shop.name || "TRAP Room"} cover`}
            className="trap-home-hero-media"
            priority
            fallback={
              <Logo
                src={shop.logoUrl}
                className="h-36 w-36 rounded-full object-contain sm:h-48 sm:w-48"
              />
            }
          />
        </div>
      </section>

      <section className="trap-home-intro trap-home-safe-x">
        <p className="trap-home-kicker">Made to feel easy</p>
        <h2 className="trap-home-section-display">
          Good drinks should feel fun, clear and simple.
        </h2>
      </section>

      <HomeRailSection
        eyebrow="Menu highlights"
        title="TRAP favorites."
        description="The drinks and bakes people come back for."
        link="/menu"
        linkLabel="See the full menu"
        railLabel="TRAP favorites"
        railClassName="trap-home-rail--products"
      >
        {menuProducts.map((product, index) => (
          <div
            key={product._id || product.slug || `${product.name}-${index}`}
            className="trap-home-rail-item trap-home-product-slide"
          >
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </HomeRailSection>

      {!loading && menuProducts.length === 0 && (
        <EmptyHomeState>
          Menu items will appear here after they are enabled in Admin.
        </EmptyHomeState>
      )}

      <HomeRailSection
        eyebrow="Events and offers"
        title="Look what is happening."
        description="Offers, events and new reasons to stop by the room."
        link={activePromotions.length ? "/promotions" : "/posts"}
        linkLabel={activePromotions.length ? "View all offers" : "Read the journal"}
        railLabel="Look what is happening"
        tone="cream"
      >
        {happeningItems.map((item, index) => (
          <HappeningCard
            key={item._id || item.slug || `${item.title}-${index}`}
            item={item}
            index={index}
            isPromotion={activePromotions.length > 0}
          />
        ))}
      </HomeRailSection>

      {!loading && happeningItems.length === 0 && (
        <EmptyHomeState>
          Offers and journal posts will appear here after they are published.
        </EmptyHomeState>
      )}

      <section className="trap-home-story">
        <FullImageFrame
          src={storyImage}
          alt="TRAP Room story"
          className="trap-home-story-media"
          fallback={
            <div className="trap-home-story-empty">
              <Images size={36} />
              <p>
                Add a separate Our Story image in Admin or publish a visible
                Gallery item in the Room, Space or Story category.
              </p>
            </div>
          }
        />

        <div className="trap-home-story-copy">
          <p className="trap-home-kicker">Our story</p>

          <h2 className="trap-home-section-display">
            Bright color. Easy energy.
          </h2>

          <p className="trap-home-body-copy">
            {shop.note ||
              "TRAP Room brings carefully made drinks, fresh bakes and a playful visual identity into one easygoing place."}
          </p>

          <Link to="/about" className="trap-home-button trap-home-button--primary">
            Read our story
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <HomeRailSection
        eyebrow="Visual diary"
        title="From the room."
        description="Photos and small moments uploaded from the Gallery in Admin."
        link="/gallery"
        linkLabel="Open the gallery"
        railLabel="From the room"
        railClassName="trap-home-rail--gallery"
      >
        {galleryCards.map((item, index) => (
          <GalleryCard
            key={`${item.parentId || "gallery"}-${item.url}-${index}`}
            item={item}
            index={index}
          />
        ))}
      </HomeRailSection>

      {!loading && galleryCards.length === 0 && (
        <EmptyHomeState>
          Visible Gallery images will appear here after they are published in Admin.
        </EmptyHomeState>
      )}

      <HomeRailSection
        eyebrow="Journal"
        title="News, drinks and small moments."
        description="Stories from the room, published through Journal posts."
        link="/posts"
        linkLabel="More journal posts"
        railLabel="Journal posts"
        railClassName="trap-home-rail--posts"
        tone="yellow"
      >
        {latestPosts.map((post, index) => (
          <JournalCard
            key={post._id || post.slug || `${post.title}-${index}`}
            post={post}
            index={index}
          />
        ))}
      </HomeRailSection>

      {!loading && latestPosts.length === 0 && (
        <EmptyHomeState>
          Journal posts will appear here after they are published in Admin.
        </EmptyHomeState>
      )}

      <section className="trap-home-visit">
        <div className="trap-home-visit-copy">
          <p className="trap-home-kicker trap-home-kicker--yellow">Find us</p>

          <h2 className="trap-home-section-display trap-home-section-display--light">
            Find your way to the room.
          </h2>

          <div className="trap-home-visit-details">
            {shop.address && (
              <p>
                <MapPin size={19} />
                <span>{shop.address}</span>
              </p>
            )}

            <p>
              <Clock3 size={19} />
              <span>{formatOpeningHours(shop)}</span>
            </p>
          </div>

          <div className="trap-home-actions">
            <Link
              to="/reservation"
              className="trap-home-button trap-home-button--yellow"
            >
              Book a table
            </Link>

            {mapDirectionsUrl && (
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="trap-home-button trap-home-button--ghost"
              >
                Get directions
              </a>
            )}
          </div>
        </div>

        <div className="trap-home-map">
          {mapEmbedUrl ? (
            <iframe
              title={`${shop.name || "TRAP Room"} map`}
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="trap-home-map-empty">
              <MapPin size={38} />
              <p>Add a Google Maps Embed URL in Admin → Store settings.</p>
            </div>
          )}
        </div>
      </section>

      {error && (
        <div className="trap-home-error">
          {error}
        </div>
      )}
    </main>
  );
}

function HomeRailSection({
  eyebrow,
  title,
  description,
  link,
  linkLabel,
  railLabel,
  railClassName = "",
  tone = "paper",
  children,
}) {
  return (
    <section
      className={[
        "trap-home-rail-section",
        `trap-home-rail-section--${tone}`,
      ].join(" ")}
    >
      <div className="trap-home-safe-x">
        <div className="trap-home-section-heading">
          <div>
            <p className="trap-home-kicker">{eyebrow}</p>
            <h2 className="trap-home-section-display">{title}</h2>
            {description && (
              <p className="trap-home-section-description">{description}</p>
            )}
          </div>

          <Link to={link} className="trap-home-text-link">
            {linkLabel}
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="trap-home-swipe-label" aria-hidden="true">
          Swipe to see more
          <ArrowRight size={14} />
        </div>

        <div
          className={[
            "trap-home-rail",
            railClassName,
          ].join(" ")}
          data-home-rail={railLabel}
          aria-label={railLabel}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

function HappeningCard({
  item,
  index,
  isPromotion,
}) {
  const image = getImage(item);
  const label = isPromotion ? "Offer" : "Journal";

  return (
    <Link
      to={isPromotion ? "/promotions" : "/posts"}
      className="trap-home-rail-item trap-home-editorial-card"
    >
      <FullImageFrame
        src={image}
        alt={item.title || label}
        className="trap-home-card-media"
        fallback={<Tag size={34} />}
      />

      <div className="trap-home-card-copy">
        <p className="trap-home-card-meta">
          {label} · {String(index + 1).padStart(2, "0")}
        </p>

        <h3>{item.title || "Something new at TRAP"}</h3>

        <p>
          {item.description ||
            item.excerpt ||
            item.content ||
            "Open the latest update from TRAP Room."}
        </p>

        <span>
          See details
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
}

function JournalCard({
  post,
  index,
}) {
  return (
    <Link
      to="/posts"
      className="trap-home-rail-item trap-home-editorial-card"
    >
      <FullImageFrame
        src={getImage(post)}
        alt={post.title || "TRAP Room journal"}
        className="trap-home-card-media"
        fallback={<Newspaper size={34} />}
      />

      <div className="trap-home-card-copy">
        <p className="trap-home-card-meta">
          Journal · {String(index + 1).padStart(2, "0")}
        </p>

        <h3>{post.title || "From TRAP Room"}</h3>

        <p>{post.excerpt || post.content}</p>

        <span>
          Read more
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
}

function GalleryCard({
  item,
  index,
}) {
  return (
    <Link
      to="/gallery"
      className="trap-home-rail-item trap-home-gallery-card"
    >
      <FullImageFrame
        src={item.url}
        alt={item.alt || item.title || "TRAP Room gallery"}
        className="trap-home-gallery-media"
        fallback={<Sparkles size={38} />}
      />

      <div className="trap-home-gallery-caption">
        <p>
          {item.category || "From the room"} ·{" "}
          {String(index + 1).padStart(2, "0")}
        </p>
        <h3>{item.title || "A moment at TRAP"}</h3>
      </div>
    </Link>
  );
}

function FullImageFrame({
  src,
  alt,
  className = "",
  priority = false,
  fallback = null,
}) {
  return (
    <div className={["trap-home-media-frame", className].join(" ")}>
      {src ? (
        <>
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className="trap-home-media-backdrop"
            loading={priority ? "eager" : "lazy"}
          />

          <img
            src={src}
            alt={alt}
            className="trap-home-media-contain"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        </>
      ) : (
        <div className="trap-home-media-fallback">
          {fallback}
        </div>
      )}
    </div>
  );
}

function EmptyHomeState({
  children,
}) {
  return (
    <div className="trap-home-safe-x">
      <div className="trap-home-empty-state">{children}</div>
    </div>
  );
}

function resolveStoryImage({
  shop,
  gallery,
  heroImage,
  managedHomepageMedia = false,
}) {
  const rejected = new Set(
    [
      heroImage,
      firstUrl([shop.coverImageUrl]),
      firstUrl([shop.heroImages?.[0]]),
    ].filter(Boolean)
  );

  const explicitCandidates = [
    shop.ourStoryImageUrl,
    shop.storyImageUrl,
    shop.aboutImageUrl,
    shop.homeStoryImageUrl,
    shop.storyImage,
    shop.about?.imageUrl,
    shop.story?.imageUrl,
    shop.homepageImages?.story,
    managedHomepageMedia
      ? ""
      : shop.heroImages?.[1],
  ];

  const explicit = firstDistinctUrl(
    explicitCandidates,
    rejected
  );

  if (explicit) {
    return explicit;
  }

  const preferredGallery = gallery.find((item) => {
    const haystack = [
      item?.category,
      item?.title,
      item?.description,
      item?.altText,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return /(our story|story|room|space|interior|inside)/.test(haystack);
  });

  const preferredUrl = firstDistinctUrl(
    [getImage(preferredGallery)],
    rejected
  );

  if (preferredUrl) {
    return preferredUrl;
  }

  return firstDistinctUrl(
    gallery.map(getImage),
    rejected
  );
}

function flattenGallery(items) {
  return items.flatMap((item) => {
    const media = normalizeMedia(item);

    return media
      .filter(
        (mediaItem) =>
          getResourceType(mediaItem) !== "video" &&
          getMediaUrl(mediaItem)
      )
      .map((mediaItem) => ({
        parentId: item._id || item.id || "",
        url: getMediaUrl(mediaItem),
        title: item.title || mediaItem.title || "",
        category: item.category || "",
        alt:
          mediaItem.alt ||
          mediaItem.altText ||
          item.altText ||
          item.title ||
          "",
      }));
  });
}

function normalizeMedia(item) {
  if (Array.isArray(item?.media) && item.media.length) {
    return item.media;
  }

  const url = item?.imageUrl || item?.videoUrl || item?.url || "";

  return url
    ? [
        {
          url,
          resourceType: item?.videoUrl ? "video" : "image",
        },
      ]
    : [];
}

function getImage(item) {
  if (!item) {
    return "";
  }

  if (typeof item === "string") {
    return item;
  }

  return firstUrl([
    item.imageUrl,
    item.coverImageUrl,
    item.thumbnailUrl,
    item.media?.find(
      (mediaItem) =>
        getResourceType(mediaItem) !== "video"
    ),
    item.media?.[0],
    item.url,
  ]);
}

function getMediaUrl(media) {
  if (!media) {
    return "";
  }

  if (typeof media === "string") {
    return media;
  }

  return (
    media.url ||
    media.secureUrl ||
    media.secure_url ||
    media.src ||
    ""
  );
}

function getResourceType(media) {
  const declared = String(
    media?.resourceType ||
      media?.type ||
      media?.kind ||
      ""
  ).toLowerCase();

  if (declared === "video") {
    return "video";
  }

  const url = getMediaUrl(media).toLowerCase();

  return /\.(mp4|webm|mov|m4v)(?:$|\?)/.test(url)
    ? "video"
    : "image";
}

function firstUrl(candidates) {
  for (const candidate of candidates.flat(Infinity)) {
    const url = getMediaUrl(candidate);

    if (url) {
      return url;
    }
  }

  return "";
}

function firstDistinctUrl(
  candidates,
  rejected
) {
  for (const candidate of candidates.flat(Infinity)) {
    const url = getMediaUrl(candidate);

    if (url && !rejected.has(url)) {
      return url;
    }
  }

  return "";
}

function sortByOrder(a, b) {
  return (
    Number(a?.sortOrder ?? a?.order ?? 999) -
    Number(b?.sortOrder ?? b?.order ?? 999)
  );
}

function sortByDate(a, b) {
  return (
    new Date(b?.updatedAt || b?.createdAt || 0).getTime() -
    new Date(a?.updatedAt || a?.createdAt || 0).getTime()
  );
}

function formatOpeningHours(shop) {
  if (typeof shop?.openingHours === "string" && shop.openingHours.trim()) {
    return shop.openingHours;
  }

  if (typeof shop?.openingHoursText === "string" && shop.openingHoursText.trim()) {
    return shop.openingHoursText;
  }

  const weekday =
    shop?.openingHours?.weekday ||
    shop?.openingHours?.weekdays ||
    shop?.weekdayHours;

  const weekend =
    shop?.openingHours?.weekend ||
    shop?.openingHours?.weekends ||
    shop?.weekendHours;

  if (weekday || weekend) {
    return [
      weekday ? `Mon–Fri · ${weekday}` : "",
      weekend ? `Sat–Sun · ${weekend}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return "Mon–Fri · 7:30AM–8:30PM · Sat–Sun · 7:30AM–9:30PM";
}
