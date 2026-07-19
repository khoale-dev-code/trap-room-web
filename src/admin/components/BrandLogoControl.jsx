import {
  CheckCircle2,
  Globe2,
  ImagePlus,
  Loader2,
  RefreshCw,
  RotateCcw,
  UploadCloud,
} from "lucide-react";
import { useRef } from "react";

export default function BrandLogoControl({
  logoUrl,
  faviconUrl,
  busy,
  onUpload,
  onUseAsFavicon,
  onResetFavicon,
}) {
  const inputRef = useRef(null);

  const selected = Boolean(
    logoUrl &&
    faviconUrl === logoUrl
  );

  function openPicker() {
    if (!busy) {
      inputRef.current?.click();
    }
  }

  function handleFiles(event) {
    const files = event.target.files;

    if (files?.length) {
      onUpload(files);
    }

    event.target.value = "";
  }

  return (
    <div
      data-brand-logo-control="true"
      className="brand-logo-control sm:col-span-2"
    >
      <div className="brand-logo-preview">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Store logo preview"
          />
        ) : (
          <div className="brand-logo-empty">
            <ImagePlus size={42} />
            <strong>No logo uploaded</strong>
            <span>
              Upload the main TRAP Room logo.
            </span>
          </div>
        )}
      </div>

      <div className="brand-logo-content">
        <div className="brand-logo-heading">
          <span className="admin-label">
            Store logo
          </span>

          <h4>Main brand artwork</h4>

          <p>
            Use a clear PNG, WEBP or SVG. A square version gives the best browser-tab result.
          </p>
        </div>

        <div className="brand-logo-actions">
          <button
            type="button"
            className="brand-logo-action brand-logo-action-primary"
            onClick={openPicker}
            disabled={busy}
          >
            {busy ? (
              <Loader2
                className="animate-spin"
                size={20}
              />
            ) : logoUrl ? (
              <RefreshCw size={20} />
            ) : (
              <UploadCloud size={20} />
            )}

            <span>
              {busy
                ? "Uploading..."
                : logoUrl
                  ? "Replace logo"
                  : "Upload logo"}
            </span>
          </button>

          <button
            type="button"
            className={[
              "brand-logo-action",
              selected
                ? "brand-logo-action-selected"
                : "brand-logo-action-secondary",
            ].join(" ")}
            onClick={onUseAsFavicon}
            disabled={!logoUrl || busy}
          >
            {selected ? (
              <CheckCircle2 size={20} />
            ) : (
              <Globe2 size={20} />
            )}

            <span>
              {selected
                ? "Browser icon selected"
                : "Use as browser icon"}
            </span>
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleFiles}
        />

        <div className="brand-logo-browser-preview">
          <span className="brand-logo-browser-icon">
            <img
              src={
                faviconUrl ||
                "/favicon.svg"
              }
              alt="Browser icon preview"
            />
          </span>

          <span className="brand-logo-browser-copy">
            <b>Browser tab preview</b>

            <small>
              Save changes after selecting. Browsers may keep the previous icon in cache for a short time.
            </small>
          </span>

          {faviconUrl ? (
            <button
              type="button"
              className="brand-logo-reset"
              onClick={onResetFavicon}
              disabled={busy}
            >
              <RotateCcw size={16} />
              Reset icon
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
