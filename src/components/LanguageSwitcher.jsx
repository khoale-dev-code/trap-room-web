
import {
  Languages,
} from "lucide-react";
import {
  useEffect,
} from "react";
import {
  useI18n,
} from "../i18n/I18nProvider.jsx";

const LEGACY_POSITION_KEYS = [
  "trap-room-language-switcher-position-v2",
  "trap-room-language-switcher-position",
];

export default function LanguageSwitcher({
  className = "",
}) {
  const {
    language,
    setLanguage,
    t,
  } = useI18n();

  /*
   * Remove the saved coordinates from the previous draggable version.
   */
  useEffect(() => {
    try {
      LEGACY_POSITION_KEYS.forEach(
        (key) => {
          localStorage.removeItem(key);
        }
      );
    } catch {
      // localStorage may be unavailable.
    }
  }, []);

  return (
    <div
      className={[
        "trap-language-switcher",
        className,
      ].join(" ")}
      role="group"
      aria-label={t(
        "language.label",
        "Language"
      )}
      data-no-auto-translate
    >
      <span
        className="trap-language-switcher__icon"
        aria-hidden="true"
      >
        <Languages size={15} />
      </span>

      {[
        [
          "en",
          "EN",
          t(
            "language.switchToEnglish",
            "Switch to English"
          ),
        ],
        [
          "vi",
          "VI",
          t(
            "language.switchToVietnamese",
            "Switch to Vietnamese"
          ),
        ],
      ].map(
        ([
          value,
          label,
          ariaLabel,
        ]) => {
          const active =
            language === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() =>
                setLanguage(value)
              }
              aria-label={ariaLabel}
              aria-pressed={active}
              className={[
                "trap-language-switcher__button",
                active
                  ? "is-active"
                  : "",
              ].join(" ")}
            >
              {label}
            </button>
          );
        }
      )}
    </div>
  );
}
