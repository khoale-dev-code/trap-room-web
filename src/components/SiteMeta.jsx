import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { api } from "../lib/api.js";
import {
  subscribeDataChanged,
} from "../lib/dataSync.js";

const fallbackShop = {
  name: "TRAP Room",
  tagline:
    "Coffee · Matcha · Homebaked",
  description:
    "TRAP Room coffee, matcha and homebaked goods.",
  faviconUrl:
    "/favicon.svg",
};

function normalizeShop(data) {
  return {
    ...fallbackShop,
    ...(data?.shop || {}),
  };
}

function withVersion(
  url,
  version
) {
  const source =
    String(url || "").trim() ||
    "/favicon.svg";

  const token =
    String(
      version || Date.now()
    ).replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );

  const separator =
    source.includes("?")
      ? "&"
      : "?";

  return `${source}${separator}v=${token}`;
}

function iconType(url) {
  const pathname =
    String(url || "")
      .split("?")[0]
      .toLowerCase();

  if (
    pathname.endsWith(".svg")
  ) {
    return "image/svg+xml";
  }

  if (
    pathname.endsWith(".ico")
  ) {
    return "image/x-icon";
  }

  if (
    pathname.endsWith(".webp")
  ) {
    return "image/webp";
  }

  if (
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg")
  ) {
    return "image/jpeg";
  }

  return "image/png";
}

export default function SiteMeta() {
  const [shop, setShop] =
    useState(fallbackShop);

  const [version, setVersion] =
    useState("initial");

  const load = useCallback(
    async () => {
      try {
        const data =
          await api
            .getPublicStore();

        setShop(
          normalizeShop(data)
        );

        setVersion(
          data?.shop
            ?.updatedAt ||
          data?.updatedAt ||
          Date.now()
        );
      } catch {
        // Keep the static title and favicon when the API is unavailable.
      }
    },
    []
  );

  useEffect(() => {
    load();

    const unsubscribe =
      subscribeDataChanged(
        () => load()
      );

    function handleFocus() {
      load();
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      unsubscribe();

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [load]);

  const favicon =
    withVersion(
      shop.faviconUrl ||
        "/favicon.svg",
      version
    );

  const title = [
    shop.name ||
      "TRAP Room",
    shop.tagline ||
      "Coffee · Matcha · Homebaked",
  ]
    .filter(Boolean)
    .join(" | ");

  const description =
    shop.description ||
    fallbackShop.description;

  return (
    <>
      <title>{title}</title>

      <link
        key={`icon-${favicon}`}
        rel="icon"
        type={iconType(favicon)}
        href={favicon}
      />

      <link
        key={`shortcut-${favicon}`}
        rel="shortcut icon"
        type={iconType(favicon)}
        href={favicon}
      />

      <link
        key={`apple-${favicon}`}
        rel="apple-touch-icon"
        href={favicon}
      />

      <meta
        name="description"
        content={description}
      />

      <meta
        property="og:title"
        content={title}
      />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:image"
        content={favicon}
      />
    </>
  );
}
