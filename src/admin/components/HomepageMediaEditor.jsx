
import {
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  ExternalLink,
  ImageIcon,
  Link2,
  Loader2,
  Monitor,
  RotateCcw,
  Smartphone,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../../lib/api.js";
import { useI18n } from "../../i18n/I18nProvider.jsx";
import "../styles/homepage-media-editor-v7.css";

const SLOT_IDS = ["hero", "story"];

export default function HomepageMediaEditor({
  form = {},
  setForm,
}) {
  const { language } = useI18n();
  const vi = language === "vi";

  const copy = vi
    ? {
        eyebrow: "Hình ảnh trang chủ",
        title: "Quản lý hình ảnh hiển thị",
        description:
          "Chọn từng vị trí, xem trước đúng tỷ lệ và cập nhật ảnh riêng cho Hero hoặc Our Story.",
        hero: "Hero trang chủ",
        heroShort: "Hero",
        heroHelp:
          "Ảnh chính ở đầu trang. Nên dùng ảnh ngang có chủ thể nằm ở trung tâm.",
        heroRatio: "Khuyến nghị 16:10",
        story: "Our Story",
        storyShort: "Story",
        storyHelp:
          "Ảnh minh họa riêng cho phần Our Story, không dùng chung ảnh Cover.",
        storyRatio: "Khuyến nghị 4:5",
        assigned: "Đã có ảnh",
        missing: "Chưa có ảnh",
        choose: "Chọn ảnh mới",
        drop: "Kéo ảnh vào đây hoặc bấm để tải lên",
        formats: "JPG, PNG hoặc WEBP · tối đa theo cấu hình upload hiện tại",
        uploading: "Đang tải ảnh...",
        desktop: "Desktop",
        mobile: "Mobile",
        preview: "Xem trước",
        openImage: "Mở ảnh gốc",
        save: "Lưu thay đổi",
        saving: "Đang lưu...",
        saved: "Đã lưu và đồng bộ với trang chủ.",
        failed: "Không thể cập nhật hình ảnh trang chủ.",
        uploadFailed: "Không thể tải ảnh lên.",
        remove: "Xóa ảnh",
        confirmRemove: "Bấm lại để xác nhận",
        cancelRemove: "Hủy xóa",
        advanced: "Thiết lập nâng cao",
        url: "URL hình ảnh",
        urlHelp:
          "Chỉ dùng khi đã có sẵn đường dẫn ảnh từ Cloudinary hoặc nguồn HTTPS tin cậy.",
        applyUrl: "Áp dụng URL",
        reset: "Khôi phục",
        openHomepage: "Mở trang chủ",
        noImage:
          "Chưa có ảnh cho vị trí này. Tải ảnh mới để xem trước.",
        unchanged: "Không có thay đổi",
        dirty: "Có thay đổi chưa lưu",
        sourceMap: "Nguồn hình ảnh các khu vực khác",
        products: "TRAP favorites → Món trong thực đơn",
        happenings: "Look what is happening → Ưu đãi / Bài viết",
        room: "From the room → Thư viện",
      }
    : {
        eyebrow: "Homepage images",
        title: "Manage homepage visuals",
        description:
          "Select a position, preview its real ratio and update Hero or Our Story independently.",
        hero: "Homepage Hero",
        heroShort: "Hero",
        heroHelp:
          "The main image at the top of the page. Use a landscape image with the subject near the center.",
        heroRatio: "Recommended 16:10",
        story: "Our Story",
        storyShort: "Story",
        storyHelp:
          "A separate visual for Our Story. It no longer shares the Cover image.",
        storyRatio: "Recommended 4:5",
        assigned: "Image assigned",
        missing: "No image",
        choose: "Choose image",
        drop: "Drop an image here or click to upload",
        formats: "JPG, PNG or WEBP · current upload limit applies",
        uploading: "Uploading...",
        desktop: "Desktop",
        mobile: "Mobile",
        preview: "Preview",
        openImage: "Open original",
        save: "Save changes",
        saving: "Saving...",
        saved: "Saved and synchronized with the homepage.",
        failed: "Could not update the homepage image.",
        uploadFailed: "Could not upload the image.",
        remove: "Remove image",
        confirmRemove: "Press again to confirm",
        cancelRemove: "Cancel removal",
        advanced: "Advanced settings",
        url: "Image URL",
        urlHelp:
          "Use this only for an existing Cloudinary URL or another trusted HTTPS image.",
        applyUrl: "Apply URL",
        reset: "Reset",
        openHomepage: "Open homepage",
        noImage:
          "No image is assigned to this position. Upload one to preview it.",
        unchanged: "No unsaved changes",
        dirty: "Unsaved changes",
        sourceMap: "Other homepage image sources",
        products: "TRAP favorites → Menu items",
        happenings: "Look what is happening → Offers / Journal",
        room: "From the room → Gallery",
      };

  const savedValues = useMemo(
    () => ({
      hero: getUrl(
        form.homeHeroImageUrl ||
          form.heroImageUrl ||
          form.heroImages?.[0]
      ),
      story: getUrl(
        form.ourStoryImageUrl ||
          form.storyImageUrl ||
          form.homeStoryImageUrl ||
          form.heroImages?.[1]
      ),
    }),
    [
      form.homeHeroImageUrl,
      form.heroImageUrl,
      form.ourStoryImageUrl,
      form.storyImageUrl,
      form.homeStoryImageUrl,
      form.heroImages,
    ]
  );

  const [activeSlot, setActiveSlot] =
    useState("hero");

  const [previewMode, setPreviewMode] =
    useState("desktop");

  const [drafts, setDrafts] =
    useState(savedValues);

  const [workingSlot, setWorkingSlot] =
    useState("");

  const [removeConfirm, setRemoveConfirm] =
    useState("");

  const [message, setMessage] =
    useState({
      type: "",
      text: "",
    });

  useEffect(() => {
    setDrafts(savedValues);
  }, [
    savedValues.hero,
    savedValues.story,
  ]);

  const slots = useMemo(
    () => ({
      hero: {
        id: "hero",
        title: copy.hero,
        shortTitle: copy.heroShort,
        help: copy.heroHelp,
        ratio: copy.heroRatio,
        savedValue: savedValues.hero,
      },
      story: {
        id: "story",
        title: copy.story,
        shortTitle: copy.storyShort,
        help: copy.storyHelp,
        ratio: copy.storyRatio,
        savedValue: savedValues.story,
      },
    }),
    [
      copy.hero,
      copy.heroShort,
      copy.heroHelp,
      copy.heroRatio,
      copy.story,
      copy.storyShort,
      copy.storyHelp,
      copy.storyRatio,
      savedValues.hero,
      savedValues.story,
    ]
  );

  const active =
    slots[activeSlot];

  const activeDraft =
    drafts[activeSlot] || "";

  const isDirty =
    activeDraft !==
    active.savedValue;

  const busy =
    workingSlot === activeSlot;

  function setActiveDraft(value) {
    setDrafts((current) => ({
      ...current,
      [activeSlot]:
        String(value || ""),
    }));

    setMessage({
      type: "",
      text: "",
    });

    setRemoveConfirm("");
  }

  async function upload(
    slot,
    fileList
  ) {
    const file =
      Array.from(
        fileList || []
      )[0];

    if (!file) {
      return;
    }

    setWorkingSlot(slot);
    setRemoveConfirm("");
    setMessage({
      type: "",
      text: "",
    });

    try {
      const result =
        await api.uploadMedia([
          file,
        ]);

      const media =
        getFirstUploadedMedia(
          result
        );

      const url =
        getUrl(media);

      if (!url) {
        throw new Error(
          copy.uploadFailed
        );
      }

      setDrafts((current) => ({
        ...current,
        [slot]: url,
      }));

      await saveSlot(
        slot,
        url
      );
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error?.message ||
          copy.uploadFailed,
      });
    } finally {
      setWorkingSlot("");
    }
  }

  async function saveSlot(
    slot,
    rawUrl
  ) {
    const url =
      String(
        rawUrl || ""
      ).trim();

    if (
      url &&
      !/^https?:\/\//i.test(url)
    ) {
      setMessage({
        type: "error",
        text:
          vi
            ? "URL hình ảnh phải bắt đầu bằng http:// hoặc https://."
            : "The image URL must begin with http:// or https://.",
      });

      return false;
    }

    setWorkingSlot(slot);
    setMessage({
      type: "",
      text: "",
    });

    try {
      const response =
        await api.request(
          "/shop/homepage-media",
          {
            method: "PATCH",
            body: JSON.stringify({
              slot,
              url,
            }),
          }
        );

      const shop =
        response?.shop ||
        response?.data?.shop ||
        response?.data ||
        {};

      setForm?.((current) => ({
        ...current,
        ...shop,
      }));

      setDrafts((current) => ({
        ...current,
        [slot]: url,
      }));

      notifyClient();

      setMessage({
        type: "success",
        text: copy.saved,
      });

      return true;
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error?.message ||
          copy.failed,
      });

      return false;
    } finally {
      setWorkingSlot("");
    }
  }

  async function requestRemove() {
    if (
      removeConfirm !==
      activeSlot
    ) {
      setRemoveConfirm(
        activeSlot
      );

      return;
    }

    setDrafts((current) => ({
      ...current,
      [activeSlot]: "",
    }));

    const saved =
      await saveSlot(
        activeSlot,
        ""
      );

    if (saved) {
      setRemoveConfirm("");
    }
  }

  function resetDraft() {
    setActiveDraft(
      active.savedValue
    );
  }

  function handleDrop(event) {
    event.preventDefault();

    if (busy) {
      return;
    }

    upload(
      activeSlot,
      event.dataTransfer.files
    );
  }

  return (
    <section
      data-homepage-media-editor
      className="homepage-media-editor"
    >
      <header className="homepage-media-editor__header">
        <div className="homepage-media-editor__heading">
          <span className="homepage-media-editor__icon">
            <Sparkles size={20} />
          </span>

          <div className="min-w-0">
            <p className="homepage-media-editor__eyebrow">
              {copy.eyebrow}
            </p>

            <h2 className="homepage-media-editor__title">
              {copy.title}
            </h2>

            <p className="homepage-media-editor__description">
              {copy.description}
            </p>
          </div>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="admin-button-secondary homepage-media-editor__homepage-link"
        >
          <ExternalLink size={15} />
          {copy.openHomepage}
        </a>
      </header>

      <div className="homepage-media-editor__body">
        <aside className="homepage-media-editor__slots">
          <div
            className="homepage-media-editor__slot-tabs"
            role="tablist"
            aria-label={copy.title}
          >
            {SLOT_IDS.map((slotId) => {
              const slot =
                slots[slotId];

              const selected =
                activeSlot === slotId;

              return (
                <button
                  key={slot.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setActiveSlot(
                      slot.id
                    );

                    setRemoveConfirm("");
                    setMessage({
                      type: "",
                      text: "",
                    });
                  }}
                  className={[
                    "homepage-media-editor__slot",
                    selected
                      ? "is-active"
                      : "",
                  ].join(" ")}
                >
                  <span className="homepage-media-editor__slot-thumb">
                    {slot.savedValue ? (
                      <img
                        src={slot.savedValue}
                        alt=""
                      />
                    ) : (
                      <ImageIcon size={19} />
                    )}
                  </span>

                  <span className="homepage-media-editor__slot-copy">
                    <strong>
                      {slot.shortTitle}
                    </strong>

                    <small>
                      {slot.savedValue
                        ? copy.assigned
                        : copy.missing}
                    </small>
                  </span>

                  <ChevronRight
                    className="homepage-media-editor__slot-arrow"
                    size={17}
                  />
                </button>
              );
            })}
          </div>

          <div className="homepage-media-editor__source-note">
            <p>
              {copy.sourceMap}
            </p>

            <span>
              {copy.products}
            </span>
            <span>
              {copy.happenings}
            </span>
            <span>
              {copy.room}
            </span>
          </div>
        </aside>

        <div className="homepage-media-editor__workspace">
          <div className="homepage-media-editor__workspace-head">
            <div>
              <div className="homepage-media-editor__title-row">
                <h3>
                  {active.title}
                </h3>

                <span className="homepage-media-editor__ratio">
                  {active.ratio}
                </span>
              </div>

              <p>
                {active.help}
              </p>
            </div>

            <div className="homepage-media-editor__device-switch">
              <button
                type="button"
                className={
                  previewMode ===
                  "desktop"
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setPreviewMode(
                    "desktop"
                  )
                }
              >
                <Monitor size={15} />
                <span>
                  {copy.desktop}
                </span>
              </button>

              <button
                type="button"
                className={
                  previewMode ===
                  "mobile"
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setPreviewMode(
                    "mobile"
                  )
                }
              >
                <Smartphone size={15} />
                <span>
                  {copy.mobile}
                </span>
              </button>
            </div>
          </div>

          <div
            className={[
              "homepage-media-editor__preview-shell",
              previewMode ===
              "mobile"
                ? "is-mobile"
                : "is-desktop",
              activeSlot ===
              "story"
                ? "is-story"
                : "is-hero",
            ].join(" ")}
          >
            <div className="homepage-media-editor__preview-label">
              <span>
                {copy.preview}
              </span>

              <span
                className={
                  isDirty
                    ? "is-dirty"
                    : "is-clean"
                }
              >
                {isDirty
                  ? copy.dirty
                  : copy.unchanged}
              </span>
            </div>

            <div className="homepage-media-editor__preview">
              {activeDraft ? (
                <>
                  <img
                    src={activeDraft}
                    alt=""
                    aria-hidden="true"
                    className="homepage-media-editor__preview-backdrop"
                  />

                  <img
                    src={activeDraft}
                    alt={active.title}
                    className="homepage-media-editor__preview-image"
                  />
                </>
              ) : (
                <div className="homepage-media-editor__empty">
                  <span>
                    <ImageIcon size={28} />
                  </span>

                  <p>
                    {copy.noImage}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="homepage-media-editor__controls">
            <label
              className={[
                "homepage-media-editor__dropzone",
                busy
                  ? "is-busy"
                  : "",
              ].join(" ")}
              onDragOver={(event) =>
                event.preventDefault()
              }
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={busy}
                onChange={(event) => {
                  upload(
                    activeSlot,
                    event.target.files
                  );

                  event.target.value =
                    "";
                }}
              />

              <span>
                {busy ? (
                  <Loader2
                    className="animate-spin"
                    size={21}
                  />
                ) : (
                  <CloudUpload size={21} />
                )}
              </span>

              <div>
                <strong>
                  {busy
                    ? copy.uploading
                    : copy.drop}
                </strong>

                <small>
                  {copy.formats}
                </small>
              </div>

              <em>
                {copy.choose}
              </em>
            </label>

            <div className="homepage-media-editor__actions">
              <button
                type="button"
                className="admin-button-primary"
                disabled={
                  busy ||
                  !isDirty
                }
                onClick={() =>
                  saveSlot(
                    activeSlot,
                    activeDraft
                  )
                }
              >
                {busy ? (
                  <Loader2
                    className="animate-spin"
                    size={15}
                  />
                ) : (
                  <CheckCircle2 size={15} />
                )}

                {busy
                  ? copy.saving
                  : copy.save}
              </button>

              <button
                type="button"
                className="admin-button-secondary"
                disabled={
                  busy ||
                  !isDirty
                }
                onClick={resetDraft}
              >
                <RotateCcw size={15} />
                {copy.reset}
              </button>

              {activeDraft && (
                <a
                  href={activeDraft}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-button-secondary"
                >
                  <ExternalLink size={15} />
                  {copy.openImage}
                </a>
              )}

              <button
                type="button"
                className={[
                  "admin-button-danger",
                  removeConfirm ===
                  activeSlot
                    ? "is-confirming"
                    : "",
                ].join(" ")}
                disabled={
                  busy ||
                  !activeDraft
                }
                onClick={requestRemove}
              >
                <Trash2 size={15} />
                {removeConfirm ===
                activeSlot
                  ? copy.confirmRemove
                  : copy.remove}
              </button>

              {removeConfirm ===
                activeSlot && (
                <button
                  type="button"
                  className="homepage-media-editor__cancel-remove"
                  onClick={() =>
                    setRemoveConfirm("")
                  }
                >
                  {copy.cancelRemove}
                </button>
              )}
            </div>

            <details className="homepage-media-editor__advanced">
              <summary>
                <Link2 size={15} />
                {copy.advanced}
              </summary>

              <div className="homepage-media-editor__advanced-body">
                <label>
                  <span className="admin-label">
                    {copy.url}
                  </span>

                  <input
                    type="url"
                    className="admin-input"
                    value={activeDraft}
                    placeholder="https://res.cloudinary.com/..."
                    onChange={(event) =>
                      setActiveDraft(
                        event.target.value
                      )
                    }
                  />
                </label>

                <p>
                  {copy.urlHelp}
                </p>

                <button
                  type="button"
                  className="admin-button-secondary"
                  disabled={
                    busy ||
                    !isDirty
                  }
                  onClick={() =>
                    saveSlot(
                      activeSlot,
                      activeDraft
                    )
                  }
                >
                  <Link2 size={15} />
                  {copy.applyUrl}
                </button>
              </div>
            </details>

            {message.text && (
              <div
                className={[
                  "homepage-media-editor__message",
                  message.type ===
                  "success"
                    ? "is-success"
                    : "is-error",
                ].join(" ")}
                role="status"
              >
                <CheckCircle2 size={17} />
                <span>
                  {message.text}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


function getFirstUploadedMedia(response) {
  if (!response) {
    return null;
  }

  const candidates = [
    response.media,
    response.files,
    response.uploads,
    response.results,
    response.data?.media,
    response.data?.files,
    response.data?.uploads,
    response.data?.results,
    response.data,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const first = candidate.find(Boolean);

      if (first) {
        return first;
      }

      continue;
    }

    if (
      candidate &&
      typeof candidate === "object" &&
      (
        candidate.url ||
        candidate.secureUrl ||
        candidate.secure_url ||
        candidate.imageUrl ||
        candidate.src
      )
    ) {
      return candidate;
    }
  }

  return null;
}

function getUrl(value) {
  if (!value) {
    return "";
  }

  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  return (
    value.url ||
    value.secureUrl ||
    value.secure_url ||
    value.imageUrl ||
    value.src ||
    ""
  );
}

function notifyClient() {
  const version =
    String(Date.now());

  try {
    localStorage.setItem(
      "trap:data-version",
      version
    );
  } catch {
    // Storage can be unavailable in private browsing.
  }

  window.dispatchEvent(
    new CustomEvent(
      "trap:data-changed",
      {
        detail: {
          resource: "shop",
          version,
        },
      }
    )
  );
}
