
import express from "express";

const router = express.Router();
const cache = new Map();

const ALLOWED_HOSTS = new Set([
  "maps.app.goo.gl",
  "goo.gl",
  "google.com",
  "www.google.com",
  "maps.google.com",
]);

function clean(value) {
  return String(value || "").trim();
}

function isAllowedGoogleMapsUrl(value) {
  try {
    const url = new URL(value);
    const host =
      url.hostname.toLowerCase();

    return (
      ALLOWED_HOSTS.has(host) ||
      host.endsWith(".google.com")
    );
  } catch {
    return false;
  }
}

function queryEmbed(value) {
  const query = clean(value);

  return query
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        query
      )}&output=embed`
    : "";
}

function buildEmbedFromUrl(
  value,
  fallbackAddress = ""
) {
  const candidate = clean(value);

  if (!candidate) {
    return queryEmbed(
      fallbackAddress
    );
  }

  if (
    /\/maps\/embed/i.test(
      candidate
    ) ||
    /[?&]output=embed(?:&|$)/i.test(
      candidate
    )
  ) {
    return candidate;
  }

  let decoded = candidate;

  try {
    decoded =
      decodeURIComponent(candidate);
  } catch {
    // Keep original URL.
  }

  const atCoordinates =
    decoded.match(
      /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,|\b)/
    );

  if (atCoordinates) {
    return queryEmbed(
      `${atCoordinates[1]},${atCoordinates[2]}`
    );
  }

  const dataCoordinates =
    decoded.match(
      /!3d(-?\d+(?:\.\d+)?)[\s\S]*?!4d(-?\d+(?:\.\d+)?)/
    );

  if (dataCoordinates) {
    return queryEmbed(
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
      return queryEmbed(query);
    }

    const placeMatch =
      url.pathname.match(
        /\/maps\/place\/([^/]+)/i
      );

    if (placeMatch?.[1]) {
      return queryEmbed(
        decodeURIComponent(
          placeMatch[1].replace(
            /\+/g,
            " "
          )
        )
      );
    }
  } catch {
    // Fall through to address fallback.
  }

  return queryEmbed(
    fallbackAddress
  );
}

async function followRedirect(
  sourceUrl
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, 9000);

  try {
    let response = await fetch(
      sourceUrl,
      {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 TRAP-Room-Map-Resolver",
        },
      }
    );

    if (
      response.status === 405 ||
      response.status === 403
    ) {
      response = await fetch(
        sourceUrl,
        {
          method: "GET",
          redirect: "follow",
          signal:
            controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 TRAP-Room-Map-Resolver",
          },
        }
      );
    }

    return response.url || sourceUrl;
  } finally {
    clearTimeout(timeout);
  }
}

router.get(
  "/resolve",
  async (req, res, next) => {
    try {
      const sourceUrl = clean(
        req.query.url
      );

      const address = clean(
        req.query.address
      );

      if (
        !sourceUrl ||
        !isAllowedGoogleMapsUrl(
          sourceUrl
        )
      ) {
        return res.status(400).json({
          message:
            "A valid Google Maps URL is required.",
        });
      }

      const cacheKey =
        `${sourceUrl}|${address}`;

      const cached =
        cache.get(cacheKey);

      if (
        cached &&
        cached.expiresAt > Date.now()
      ) {
        return res.json(
          cached.value
        );
      }

      const finalUrl =
        await followRedirect(
          sourceUrl
        );

      const embedUrl =
        buildEmbedFromUrl(
          finalUrl,
          address
        );

      if (!embedUrl) {
        return res.status(422).json({
          message:
            "The Google Maps link could not be converted into an embed URL.",
          finalUrl,
        });
      }

      const value = {
        ok: true,
        sourceUrl,
        finalUrl,
        embedUrl,
      };

      cache.set(cacheKey, {
        value,
        expiresAt:
          Date.now() +
          6 * 60 * 60 * 1000,
      });

      return res.json(value);
    } catch (error) {
      if (
        error.name ===
        "AbortError"
      ) {
        return res.status(504).json({
          message:
            "Google Maps took too long to respond.",
        });
      }

      return next(error);
    }
  }
);

export default router;
