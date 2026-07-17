
import {
  CheckCircle2,
  Clipboard,
  Code2,
  ExternalLink,
  MapPinned,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useI18n } from "../../i18n/I18nProvider.jsx";
import {
  buildGoogleMapsIframeHtml,
  normalizeGoogleMapsEmbedUrl,
  resolveGoogleMapsEmbedUrl,
} from "../../lib/googleMapsEmbed.js";

export default function GoogleMapsEmbedEditor({
  value = "",
  directionsUrl = "",
  address = "",
  onEmbedChange,
  onDirectionsChange,
}) {
  const { language } =
    useI18n();

  const vi =
    language === "vi";

  const copy = vi
    ? {
        title: "Google Maps",
        description:
          "Dán toàn bộ mã iframe do Google Maps cung cấp. Hệ thống chỉ lưu URL src an toàn để hiển thị ngoài Client.",
        directions: "Link chỉ đường",
        directionsPlaceholder:
          "https://maps.app.goo.gl/...",
        embed:
          "Mã nhúng HTML hoặc URL Embed",
        embedPlaceholder:
          '<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>',
        apply: "Áp dụng mã nhúng",
        clear: "Xóa bản đồ",
        copyHtml: "Sao chép HTML sạch",
        copied: "Đã sao chép",
        valid: "Mã nhúng hợp lệ",
        invalid:
          "Chưa nhận được URL Google Maps Embed hợp lệ.",
        preview: "Xem trước bản đồ",
        previewFallback:
          "Chưa lưu mã nhúng. Bản xem trước đang được tạo từ địa chỉ cửa hàng.",
        instructions:
          "Google Maps → Chia sẻ → Nhúng bản đồ → Sao chép HTML, sau đó dán toàn bộ iframe vào ô trên.",
        open: "Mở link chỉ đường",
        reset: "Khôi phục",
      }
    : {
        title: "Google Maps",
        description:
          "Paste the complete iframe supplied by Google Maps. Only the safe src URL is stored for the client.",
        directions: "Directions link",
        directionsPlaceholder:
          "https://maps.app.goo.gl/...",
        embed: "Embed HTML or Embed URL",
        embedPlaceholder:
          '<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>',
        apply: "Apply embed",
        clear: "Remove map",
        copyHtml: "Copy clean HTML",
        copied: "Copied",
        valid: "Valid embed",
        invalid:
          "A valid Google Maps Embed URL was not found.",
        preview: "Map preview",
        previewFallback:
          "No embed is saved yet. The preview is generated from the store address.",
        instructions:
          "Google Maps → Share → Embed a map → Copy HTML, then paste the entire iframe above.",
        open: "Open directions",
        reset: "Reset",
      };

  const savedEmbed =
    useMemo(
      () =>
        normalizeGoogleMapsEmbedUrl(
          value
        ),
      [value]
    );

  const [draft, setDraft] =
    useState(() =>
      savedEmbed
        ? buildGoogleMapsIframeHtml(
            savedEmbed
          )
        : ""
    );

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    if (!savedEmbed) {
      return;
    }

    const draftEmbed =
      normalizeGoogleMapsEmbedUrl(
        draft
      );

    if (
      draftEmbed !== savedEmbed
    ) {
      setDraft(
        buildGoogleMapsIframeHtml(
          savedEmbed
        )
      );
    }
  }, [savedEmbed]);

  const parsedEmbed =
    useMemo(
      () =>
        normalizeGoogleMapsEmbedUrl(
          draft
        ),
      [draft]
    );

  const previewUrl =
    parsedEmbed ||
    savedEmbed ||
    resolveGoogleMapsEmbedUrl({
      address,
    });

  const cleanHtml =
    parsedEmbed
      ? buildGoogleMapsIframeHtml(
          parsedEmbed
        )
      : "";

  function applyEmbed() {
    if (!parsedEmbed) {
      return;
    }

    onEmbedChange?.(
      parsedEmbed
    );

    setDraft(
      buildGoogleMapsIframeHtml(
        parsedEmbed
      )
    );
  }

  function clearEmbed() {
    setDraft("");
    onEmbedChange?.("");
  }

  async function copyCleanHtml() {
    if (!cleanHtml) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        cleanHtml
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="w-full overflow-hidden rounded-[1.75rem] border border-trap-blue/12 bg-white shadow-[0_20px_55px_rgb(7_17_63_/_8%)]"
      data-google-maps-editor="true">
      <div className="border-b border-trap-blue/10 bg-[#f8f9fd] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-trap-blue text-trap-yellow">
            <MapPinned size={20} />
          </span>

          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-trap-blue">
              {copy.title}
            </h3>

            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-trap-ink/55">
              {copy.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)]">
        <div className="min-w-0 space-y-5">
          <label className="block min-w-0">
            <span className="admin-label">
              {copy.directions}
            </span>

            <div className="relative">
              <input
                type="url"
                className="admin-input pr-12"
                value={directionsUrl}
                placeholder={
                  copy.directionsPlaceholder
                }
                onChange={(event) =>
                  onDirectionsChange?.(
                    event.target.value
                  )
                }
              />

              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-trap-blue hover:bg-[#eef1ff]"
                  aria-label={copy.open}
                  title={copy.open}
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </label>

          <label className="block min-w-0">
            <span className="admin-label">
              {copy.embed}
            </span>

            <textarea
              className="admin-textarea min-h-44 font-mono text-[13px] leading-6"
              value={draft}
              placeholder={
                copy.embedPlaceholder
              }
              spellCheck="false"
              onChange={(event) =>
                setDraft(
                  event.target.value
                )
              }
            />
          </label>

          <div
            className={[
              "flex items-start gap-2 rounded-2xl border p-4 text-sm font-semibold leading-6",
              parsedEmbed
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-orange-200 bg-orange-50 text-orange-800",
            ].join(" ")}
          >
            {parsedEmbed ? (
              <CheckCircle2
                className="mt-0.5 shrink-0"
                size={18}
              />
            ) : (
              <Code2
                className="mt-0.5 shrink-0"
                size={18}
              />
            )}

            <div className="min-w-0">
              <p>
                {parsedEmbed
                  ? copy.valid
                  : copy.invalid}
              </p>

              {parsedEmbed && (
                <code className="mt-1 block break-all text-xs font-medium text-emerald-700/80">
                  {parsedEmbed}
                </code>
              )}
            </div>
          </div>

          <p className="rounded-2xl bg-[#fff8d8] p-4 text-xs font-semibold leading-6 text-trap-blue">
            {copy.instructions}
          </p>

          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              className="admin-button-primary"
              disabled={!parsedEmbed}
              onClick={applyEmbed}
            >
              <CheckCircle2 size={16} />
              {copy.apply}
            </button>

            <button
              type="button"
              className="admin-button-secondary"
              disabled={!cleanHtml}
              onClick={copyCleanHtml}
            >
              <Clipboard size={16} />
              {copied
                ? copy.copied
                : copy.copyHtml}
            </button>

            <button
              type="button"
              className="admin-button-danger"
              onClick={clearEmbed}
            >
              <Trash2 size={16} />
              {copy.clear}
            </button>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="admin-label mb-0">
              {copy.preview}
            </p>

            {savedEmbed &&
              parsedEmbed !==
                savedEmbed && (
                <button
                  type="button"
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-trap-blue/12 px-3 text-[8px] font-extrabold uppercase tracking-[0.1em] text-trap-blue"
                  onClick={() =>
                    setDraft(
                      buildGoogleMapsIframeHtml(
                        savedEmbed
                      )
                    )
                  }
                >
                  <RotateCcw size={13} />
                  {copy.reset}
                </button>
              )}
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-trap-blue/12 bg-[#eef1ff]">
            {previewUrl ? (
              <iframe
                title="Google Maps preview"
                src={previewUrl}
                className="h-[320px] w-full border-0 sm:h-[390px]"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <div className="grid min-h-[320px] place-items-center p-8 text-center text-trap-blue/55 sm:min-h-[390px]">
                <MapPinned size={34} />

                <p className="mt-4 max-w-sm text-sm font-semibold leading-6">
                  {copy.previewFallback}
                </p>
              </div>
            )}
          </div>

          {!savedEmbed &&
            previewUrl &&
            address && (
              <p className="mt-3 text-xs font-semibold leading-5 text-trap-ink/45">
                {copy.previewFallback}
              </p>
            )}
        </div>
      </div>
    </section>
  );
}
