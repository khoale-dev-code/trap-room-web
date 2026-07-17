
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "../lib/api.js";
import {
  subscribeDataChanged,
} from "../lib/dataSync.js";
import {
  useI18n,
} from "../i18n/I18nProvider.jsx";
import {
  localizePublicStore,
} from "../i18n/localize.js";

const fallback = {
  shop: {
    name: "TRAP Room",
    tagline:
      "COFFEE · MATCHA · HOMEBAKED",
    description:
      "A bright place for coffee, matcha, fresh bakes and good company.",
    note: "",
    instagramUrl:
      "https://www.instagram.com/trapart.room/",
    address:
      "Store address coming soon",
    openingHours:
      "Opening hours coming soon",
    
    openingHoursSchedule: null,
phone: "",
    googleMapsUrl: "",
    googleMapsEmbedUrl: "",
    logoUrl:
      "/trap-logo.png",
    heroImages: [],
    translations: {},
  },
  categories: [],
  products: [],
  toppings: [],
  posts: [],
  promotions: [],
  gallery: [],
};

function unwrapPublicStorePayload(response) {
  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response?.store &&
    typeof response.store === "object"
  ) {
    return response.store;
  }

  return (
    response &&
    typeof response === "object"
      ? response
      : {}
  );
}

function publicList(
  source,
  ...keys
) {
  for (const key of keys) {
    if (Array.isArray(source?.[key])) {
      return source[key];
    }
  }

  return [];
}

function unwrapShop(response) {
  if (
    response?.shop &&
    typeof response.shop === "object"
  ) {
    return response.shop;
  }

  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response)
  ) {
    return response;
  }

  return {};
}

export function usePublicStore() {
  const { language } = useI18n();

  const [rawStore, setRawStore] =
    useState(fallback);
  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] =
    useState("");

  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  const reload = useCallback(
    async ({ silent = false } = {}) => {
      const requestId =
        requestIdRef.current + 1;

      requestIdRef.current =
        requestId;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        /*
         * public-store remains the main payload.
         * /shop is fetched in parallel because it is the authoritative
         * source for Admin-edited address, opening hours and map fields.
         */
        const [
          publicData,
          shopResponse,
        ] = await Promise.all([
          api.getPublicStore(),
          api
            .request(
              `/shop?t=${Date.now()}`
            )
            .catch(() => null),
        ]);

        if (
          !mountedRef.current ||
          requestId !==
            requestIdRef.current
        ) {
          return;
        }

        const normalizedPublicData =
          unwrapPublicStorePayload(
            publicData
          );

        const directShop =
          unwrapShop(shopResponse);

        setRawStore({
          ...fallback,
          ...(normalizedPublicData || {}),
          shop: {
            ...fallback.shop,
            ...(normalizedPublicData?.shop || {}),
            ...directShop,
          },
          categories: Array.isArray(
            normalizedPublicData?.categories
          )
            ? publicData.categories
            : [],
          products: Array.isArray(
            normalizedPublicData?.products
          )
            ? publicData.products
            : [],
          toppings: Array.isArray(
            normalizedPublicData?.toppings
          )
            ? publicData.toppings
            : [],
          posts: publicList(
            normalizedPublicData,
            "posts",
            "journalPosts",
            "items"
          ).filter(
            (post) =>
              post?.isPublished !== false &&
              post?.isActive !== false
          ),
          promotions: Array.isArray(
            normalizedPublicData?.promotions
          )
            ? publicData.promotions
            : [],
          gallery: Array.isArray(
            normalizedPublicData?.gallery
          )
            ? publicData.gallery
            : [],
        });

        setError("");
      } catch (requestError) {
        if (
          !mountedRef.current ||
          requestId !==
            requestIdRef.current
        ) {
          return;
        }

        setError(
          requestError.message ||
            "Unable to load data."
        );
      } finally {
        if (
          !mountedRef.current ||
          requestId !==
            requestIdRef.current
        ) {
          return;
        }

        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    mountedRef.current = true;
    reload();

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [reload]);

  useEffect(() => {
    return subscribeDataChanged(() => {
      reload({
        silent: true,
      });
    });
  }, [reload]);

  useEffect(() => {
    function handleFocus() {
      reload({
        silent: true,
      });
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        reload({
          silent: true,
        });
      }
    }

    function handlePageShow(event) {
      if (event.persisted) {
        reload({
          silent: true,
        });
      }
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    window.addEventListener(
      "pageshow",
      handlePageShow
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );

      window.removeEventListener(
        "pageshow",
        handlePageShow
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [reload]);

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          reload({
            silent: true,
          });
        }
      }, 20000);

    return () => {
      window.clearInterval(timer);
    };
  }, [reload]);

  const store = useMemo(
    () =>
      localizePublicStore(
        rawStore,
        language
      ),
    [rawStore, language]
  );

  return {
    store,
    rawStore,
    loading,
    refreshing,
    error,
    reload,
  };
}
