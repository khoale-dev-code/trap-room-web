
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import AutoTranslate from "./AutoTranslate.jsx";

export default function GlobalLanguageTools() {
  return (
    <>
      <AutoTranslate />

      <div
        className="trap-language-bar"
        data-no-auto-translate
      >
        <div className="trap-language-bar__inner">
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}
