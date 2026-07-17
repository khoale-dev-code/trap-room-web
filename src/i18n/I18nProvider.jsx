
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LANGUAGE,
  getMessage,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from "./translations.js";

const CHANNEL_NAME = "trap-room-language-sync";
const LANGUAGE_EVENT = "trap:language-changed";

const I18nContext = createContext(null);

function normalizeLanguage(value) {
  const short = String(value || "")
    .trim()
    .toLowerCase()
    .split("-")[0];

  return SUPPORTED_LANGUAGES.includes(short)
    ? short
    : DEFAULT_LANGUAGE;
}

function detectInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (stored) {
      return normalizeLanguage(stored);
    }
  } catch {
    // Storage can be unavailable in private browsing.
  }

  return normalizeLanguage(
    navigator.languages?.[0] ||
      navigator.language ||
      DEFAULT_LANGUAGE
  );
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(detectInitialLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    setLanguageState(normalizeLanguage(nextLanguage));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((current) =>
      current === "en" ? "vi" : "en"
    );
  }, []);

  const t = useCallback(
    (key, fallback = key, variables = {}) => {
      let message = getMessage(language, key, fallback);

      Object.entries(variables).forEach(([name, value]) => {
        message = message.replaceAll(`{{${name}}}`, String(value));
      });

      return message;
    },
    [language]
  );

  const formatCurrency = useCallback(
    (value, currency = "VND") =>
      new Intl.NumberFormat(
        language === "vi" ? "vi-VN" : "en-US",
        {
          style: "currency",
          currency,
          maximumFractionDigits: currency === "VND" ? 0 : 2,
        }
      ).format(Number(value || 0)),
    [language]
  );

  const formatDate = useCallback(
    (value, options = {}) => {
      const date = value instanceof Date ? value : new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      return new Intl.DateTimeFormat(
        language === "vi" ? "vi-VN" : "en-US",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          ...options,
        }
      ).format(date);
    },
    [language]
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore blocked storage.
    }

    window.dispatchEvent(
      new CustomEvent(LANGUAGE_EVENT, {
        detail: { language },
      })
    );

    let channel;

    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({ language });
      }
    } catch {
      channel = null;
    }

    return () => {
      channel?.close();
    };
  }, [language]);

  useEffect(() => {
    function handleStorage(event) {
      if (
        event.key === LANGUAGE_STORAGE_KEY &&
        event.newValue
      ) {
        setLanguageState(normalizeLanguage(event.newValue));
      }
    }

    let channel;

    function handleChannel(event) {
      if (event.data?.language) {
        setLanguageState(
          normalizeLanguage(event.data.language)
        );
      }
    }

    window.addEventListener("storage", handleStorage);

    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.addEventListener("message", handleChannel);
      }
    } catch {
      channel = null;
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      channel?.removeEventListener("message", handleChannel);
      channel?.close();
    };
  }, []);

  const value = useMemo(
    () => ({
      language,
      locale: language === "vi" ? "vi-VN" : "en-US",
      setLanguage,
      toggleLanguage,
      t,
      formatCurrency,
      formatDate,
      isVietnamese: language === "vi",
      isEnglish: language === "en",
    }),
    [
      language,
      setLanguage,
      toggleLanguage,
      t,
      formatCurrency,
      formatDate,
    ]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error(
      "useI18n must be used inside I18nProvider."
    );
  }

  return context;
}

export { LANGUAGE_EVENT };
