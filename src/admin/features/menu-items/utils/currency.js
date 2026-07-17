
const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

export function sanitizeVndDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function toVndNumber(value) {
  const digits = sanitizeVndDigits(value);
  const numeric = digits ? Number(digits) : 0;

  return Number.isFinite(numeric)
    ? Math.max(0, Math.round(numeric))
    : 0;
}

export function formatVndInput(value) {
  const numeric = toVndNumber(value);
  return numeric ? VND_FORMATTER.format(numeric) : "";
}

export function formatVndCurrency(value, language) {
  return new Intl.NumberFormat(
    language === "vi" ? "vi-VN" : "en-US",
    {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }
  ).format(toVndNumber(value));
}
