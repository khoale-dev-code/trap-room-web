
const PLACEHOLDER_ADDRESS_PATTERNS = [
  /store address coming soon/i,
  /address coming soon/i,
  /no address/i,
  /chưa (có|thêm|cập nhật) địa chỉ/i,
  /cập nhật địa chỉ/i,
  /địa chỉ đang cập nhật/i,
  /update.*address/i,
];

const SHORT_MAP_HOSTS = new Set([
  "maps.app.goo.gl",
  "goo.gl",
]);

function cleanValue(value) {
  return String(value || "").trim();
}

export function extractGoogleMapsUrl(value) {
  const raw = cleanValue(value);

  if (!raw) return "";

  const iframeMatch = raw.match(
    /<iframe[^>]+src=["']([^"']+)["']/i
  );

  const candidate = iframeMatch?.[1] || raw;

  try {
    return decodeHtmlEntities(candidate);
  } catch {
    return candidate;
  }
}

export function isGoogleMapsUrl(value) {
  const candidate = extractGoogleMapsUrl(value);

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();

    return (
      host === "google.com" ||
      host.endsWith(".google.com") ||
      host === "googleusercontent.com" ||
      host.endsWith(".googleusercontent.com") ||
      SHORT_MAP_HOSTS.has(host)
    );
  } catch {
    return false;
  }
}

export function isGoogleMapsShortUrl(value) {
  const candidate = extractGoogleMapsUrl(value);

  try {
    const url = new URL(candidate);
    return SHORT_MAP_HOSTS.has(
      url.hostname.toLowerCase()
    );
  } catch {
    return false;
  }
}

export function isGoogleMapsEmbedUrl(value) {
  const candidate = extractGoogleMapsUrl(value);

  if (!candidate) return false;

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();

    if (
      !(
        host === "google.com" ||
        host.endsWith(".google.com")
      )
    ) {
      return false;
    }

    return (
      path.includes("/maps/embed") ||
      url.searchParams.get("output") === "embed"
    );
  } catch {
    return false;
  }
}

export function hasUsableAddress(value) {
  const address = cleanValue(value);

  if (address.length < 5) return false;

  return !PLACEHOLDER_ADDRESS_PATTERNS.some(
    (pattern) => pattern.test(address)
  );
}

export function buildGoogleMapsEmbedUrl(shop = {}) {
  const embedCandidate = extractGoogleMapsUrl(
    shop.googleMapsEmbedUrl ||
      shop.googleMapEmbedUrl ||
      shop.mapEmbedUrl
  );

  if (isGoogleMapsEmbedUrl(embedCandidate)) {
    return embedCandidate;
  }

  const directCandidate = extractGoogleMapsUrl(
    shop.googleMapsUrl || embedCandidate
  );

  const directEmbed =
    buildEmbedUrlFromGoogleMapsUrl(
      directCandidate
    );

  if (directEmbed) {
    return directEmbed;
  }

  if (hasUsableAddress(shop.address)) {
    return buildQueryEmbedUrl(shop.address);
  }

  return "";
}

export function buildGoogleMapsDirectionsUrl(
  shop = {}
) {
  const candidate = extractGoogleMapsUrl(
    shop.googleMapsUrl ||
      shop.googleMapsEmbedUrl ||
      shop.googleMapEmbedUrl ||
      shop.mapEmbedUrl
  );

  if (
    candidate &&
    isGoogleMapsUrl(candidate) &&
    !isGoogleMapsEmbedUrl(candidate)
  ) {
    return candidate;
  }

  if (hasUsableAddress(shop.address)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      shop.address
    )}`;
  }

  return candidate || "";
}

export function getGoogleMapsResolveSource(
  shop = {}
) {
  const values = [
    shop.googleMapsUrl,
    shop.googleMapsEmbedUrl,
    shop.googleMapEmbedUrl,
    shop.mapEmbedUrl,
  ];

  return (
    values
      .map(extractGoogleMapsUrl)
      .find(
        (value) =>
          value &&
          isGoogleMapsUrl(value) &&
          !isGoogleMapsEmbedUrl(value)
      ) || ""
  );
}

export function buildQueryEmbedUrl(query) {
  const value = cleanValue(query);

  if (!value) return "";

  return `https://www.google.com/maps?q=${encodeURIComponent(
    value
  )}&output=embed`;
}

export function buildEmbedUrlFromGoogleMapsUrl(
  value
) {
  const candidate = extractGoogleMapsUrl(value);

  if (
    !candidate ||
    !isGoogleMapsUrl(candidate) ||
    isGoogleMapsShortUrl(candidate)
  ) {
    return "";
  }

  if (isGoogleMapsEmbedUrl(candidate)) {
    return candidate;
  }

  let decoded = candidate;

  try {
    decoded = decodeURIComponent(candidate);
  } catch {
    // Keep the original URL.
  }

  const atCoordinates = decoded.match(
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,|\b)/
  );

  if (atCoordinates) {
    return buildQueryEmbedUrl(
      `${atCoordinates[1]},${atCoordinates[2]}`
    );
  }

  const dataCoordinates = decoded.match(
    /!3d(-?\d+(?:\.\d+)?)[\s\S]*?!4d(-?\d+(?:\.\d+)?)/
  );

  if (dataCoordinates) {
    return buildQueryEmbedUrl(
      `${dataCoordinates[1]},${dataCoordinates[2]}`
    );
  }

  try {
    const url = new URL(candidate);

    const query =
      url.searchParams.get("query") ||
      url.searchParams.get("q") ||
      url.searchParams.get("ll");

    if (query) {
      return buildQueryEmbedUrl(query);
    }

    const placeMatch = url.pathname.match(
      /\/maps\/place\/([^/]+)/i
    );

    if (placeMatch?.[1]) {
      return buildQueryEmbedUrl(
        decodeURIComponent(
          placeMatch[1].replace(/\+/g, " ")
        )
      );
    }
  } catch {
    return "";
  }

  return "";
}

function decodeHtmlEntities(value) {
  return String(value)
    .replaceAll("&amp;", "&")
    .replaceAll("&#38;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}
