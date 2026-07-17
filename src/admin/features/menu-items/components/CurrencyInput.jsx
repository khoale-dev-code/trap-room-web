
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  formatVndInput,
  sanitizeVndDigits,
  toVndNumber,
} from "../utils/currency.js";

export default function CurrencyInput({
  value,
  onChange,
  ariaLabel,
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() =>
    rawDigits(value)
  );
  const inputRef = useRef(null);

  useEffect(() => {
    if (!focused) {
      setDraft(rawDigits(value));
    }
  }, [focused, value]);

  const displayValue = focused
    ? draft
    : formatVndInput(value);

  function handleFocus(event) {
    const nextDraft = rawDigits(value);
    setFocused(true);
    setDraft(nextDraft);

    window.requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;

      const caret = input.value.length;
      input.setSelectionRange(caret, caret);
    });
  }

  function handleChange(event) {
    const digits = sanitizeVndDigits(event.target.value);
    setDraft(digits);
    onChange(digits ? Number(digits) : 0);
  }

  function handleBlur() {
    setFocused(false);
    setDraft(rawDigits(value));
  }

  return (
    <span className="admin-currency-field relative block">
      <input
        ref={inputRef}
        className="admin-input admin-vnd-input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        value={displayValue}
        placeholder="0"
        aria-label={ariaLabel}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      <span
        className="admin-vnd-suffix"
        aria-hidden="true"
        data-no-auto-translate
      >
        VND
      </span>
    </span>
  );
}

function rawDigits(value) {
  const numeric = toVndNumber(value);
  return numeric ? String(numeric) : "";
}
