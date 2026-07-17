
const GOOGLE_HOST_PATTERN =
  /(^|\.)google\.[a-z.]+$/i;

export function decodeHtmlEntities(value) {
  return String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export function extractIframeSrc(value) {
  const source =
    decodeHtmlEntities(value).trim();

  if (!source) {
    return "";
  }

  if (!/<iframe\b/i.test(source)) {
    return source;
  }

  const quoted =
    source.match(
      /\bsrc\s*=\s*(["'])(.*?)\1/i
    );

  if (quoted?.[2]) {
    return quoted[2].trim();
  }

  const unquoted =
    source.match(
      /\bsrc\s*=\s*([^\s>]+)/i
    );

  return String(
    unquoted?.[1] || ""
  ).trim();
}

export function normalizeGoogleMapsEmbedUrl(value) {
  const candidate =
    extractIframeSrc(value);

  if (!candidate) {
    return "";
  }

  let url;

  try {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://localhost";

    url = new URL(
      candidate,
      base
    );
  } catch {
    return "";
  }

  if (url.protocol !== "https:") {
    return "";
  }

  if (
    !GOOGLE_HOST_PATTERN.test(
      url.hostname.toLowerCase()
    )
  ) {
    return "";
  }

  const pathname =
    url.pathname.toLowerCase();

  const isEmbedPath =
    pathname.includes(
      "/maps/embed"
    );

  const isOutputEmbed =
    pathname.includes("/maps") &&
    url.searchParams.get(
      "output"
    ) === "embed";

  if (
    !isEmbedPath &&
    !isOutputEmbed
  ) {
    return "";
  }

  return url.toString();
}

export function isGoogleMapsEmbedUrl(value) {
  return Boolean(
    normalizeGoogleMapsEmbedUrl(value)
  );
}

export function resolveGoogleMapsEmbedUrl(
  shop = {}
) {
  const candidates = [
    shop.googleMapsEmbedHtml,
    shop.googleMapsEmbedUrl,
    shop.googleMapEmbedUrl,
    shop.mapEmbedUrl,
  ];

  for (const candidate of candidates) {
    const normalized =
      normalizeGoogleMapsEmbedUrl(
        candidate
      );

    if (normalized) {
      return normalized;
    }
  }

  const address =
    String(
      shop.address ||
        shop.storeAddress ||
        ""
    ).trim();

  if (!address) {
    return "";
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(
    address
  )}&output=embed`;
}

export function resolveGoogleMapsDirectionsUrl(
  shop = {}
) {
  const explicit =
    String(
      shop.googleMapsUrl ||
        shop.directionsUrl ||
        ""
    ).trim();

  if (explicit) {
    return explicit;
  }

  const address =
    String(
      shop.address ||
        shop.storeAddress ||
        ""
    ).trim();

  if (!address) {
    return "";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
}

export function buildGoogleMapsIframeHtml(
  value,
  options = {}
) {
  const src =
    normalizeGoogleMapsEmbedUrl(
      value
    );

  if (!src) {
    return "";
  }

  const width =
    Number(options.width || 600);

  const height =
    Number(options.height || 450);

  return `<iframe src="${escapeHtmlAttribute(
    src
  )}" width="${
    Number.isFinite(width)
      ? width
      : 600
  }" height="${
    Number.isFinite(height)
      ? height
      : 450
  }" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
}

function escapeHtmlAttribute(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
