import {
  ArrowDown,
  ArrowUp,
  Eye,
  FileText,
  ImagePlus,
  Loader2,
  Pin,
  Save,
  Trash2,
  Video,
  X,
} from "lucide-react";
import {
  isJournalVideo,
} from "../../../../features/journal/utils/journal.js";

export default function JournalPostEditor({
  open,
  editingId,
  form,
  existingMedia,
  filePreviews,
  saving,
  onChange,
  onFilesChange,
  onRemoveExisting,
  onRemoveFile,
  onMoveMedia,
  onClose,
  onSubmit,
  onCreate,
}) {
  const media = [
    ...existingMedia.map(
      (item, index) => ({
        ...item,
        source: "existing",
        sourceIndex: index,
        key:
          item.publicId ||
          item.url ||
          `existing-${index}`,
      })
    ),
    ...filePreviews.map(
      (item, index) => ({
        ...item,
        source: "file",
        sourceIndex: index,
        key: item.key,
      })
    ),
  ];

  if (!open) {
    return (
      <aside className="admin-card hidden min-h-72 place-items-center p-8 text-center xl:grid">
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef1ff] text-trap-blue">
            <FileText size={24} />
          </span>

          <h2 className="mt-5 text-xl font-extrabold text-trap-blue">
            Select a post to edit
          </h2>

          <p className="mt-2 text-sm font-medium leading-6 text-trap-ink/45">
            Open an existing story or create a new journal post.
          </p>

          <button
            type="button"
            className="admin-button-primary mt-6"
            onClick={onCreate}
          >
            New post
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-0 z-[90] overflow-y-auto bg-[#f5f7ff] p-3 sm:p-5 xl:sticky xl:top-4 xl:z-auto xl:max-h-[calc(100svh-2rem)] xl:rounded-[2rem] xl:border xl:border-trap-blue/10 xl:bg-white xl:p-5 xl:shadow-sm">
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-trap-blue/10 pb-4">
          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-trap-orange">
              {editingId
                ? "Edit story"
                : "New story"}
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-trap-blue">
              {editingId
                ? "Update journal post"
                : "Create journal post"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close journal editor"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-trap-blue/12 text-trap-blue hover:bg-[#eef1ff]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-5">
          <label>
            <span className="admin-label">
              Title
            </span>

            <input
              required
              value={form.title}
              onChange={(event) =>
                onChange(
                  "title",
                  event.target.value
                )
              }
              maxLength={160}
              placeholder="A clear title for the story"
              className="admin-input"
            />
          </label>

          <label>
            <span className="admin-label">
              Short excerpt
            </span>

            <textarea
              value={form.excerpt}
              onChange={(event) =>
                onChange(
                  "excerpt",
                  event.target.value
                )
              }
              maxLength={240}
              rows={3}
              placeholder="Optional. Leave empty to generate it from the article."
              className="admin-input resize-y"
            />

            <span className="mt-1 block text-right text-[8px] font-bold text-trap-ink/35">
              {form.excerpt.length}/240
            </span>
          </label>

          <label>
            <span className="admin-label">
              Article content
            </span>

            <textarea
              required
              value={form.content}
              onChange={(event) =>
                onChange(
                  "content",
                  event.target.value
                )
              }
              rows={12}
              placeholder="Use a blank line between paragraphs."
              className="admin-input resize-y leading-7"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="admin-label">
                Display order
              </span>

              <input
                type="number"
                min="1"
                value={
                  form.sortOrder
                }
                onChange={(event) =>
                  onChange(
                    "sortOrder",
                    event.target.value
                  )
                }
                className="admin-input"
              />
            </label>

            <div>
              <span className="admin-label">
                Publishing
              </span>

              <div className="grid gap-2">
                <Toggle
                  checked={
                    form.isPublished
                  }
                  icon={Eye}
                  label="Visible on client"
                  onChange={(value) =>
                    onChange(
                      "isPublished",
                      value
                    )
                  }
                />

                <Toggle
                  checked={
                    form.isPinned
                  }
                  icon={Pin}
                  label="Pin as priority story"
                  onChange={(value) =>
                    onChange(
                      "isPinned",
                      value
                    )
                  }
                />
              </div>
            </div>
          </div>

          <section className="rounded-2xl border border-trap-blue/10 bg-[#fbfcff] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="admin-label">
                  Story media
                </p>

                <p className="text-xs font-medium leading-5 text-trap-ink/45">
                  The first item is used as the cover on the client.
                </p>
              </div>

              <label className="admin-button-secondary cursor-pointer">
                <ImagePlus size={15} />
                Add media
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    onFilesChange([
                      ...event.target.files,
                    ]);
                    event.target.value =
                      "";
                  }}
                />
              </label>
            </div>

            {media.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {media.map(
                  (item, index) => (
                    <div
                      key={item.key}
                      className="grid grid-cols-[82px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-trap-blue/10 bg-white p-2"
                    >
                      <div className="h-16 overflow-hidden rounded-lg bg-[#eef1ff]">
                        {isJournalVideo(
                          item
                        ) ? (
                          <div className="grid h-full place-items-center text-trap-blue">
                            <Video size={20} />
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold text-trap-blue">
                          {item.originalName ||
                            item.file?.name ||
                            `Media ${index + 1}`}
                        </p>

                        <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.1em] text-trap-ink/35">
                          {index === 0
                            ? "Cover"
                            : `Position ${index + 1}`}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <IconButton
                          icon={ArrowUp}
                          label="Move up"
                          disabled={
                            index === 0
                          }
                          onClick={() =>
                            onMoveMedia(
                              index,
                              -1
                            )
                          }
                        />

                        <IconButton
                          icon={ArrowDown}
                          label="Move down"
                          disabled={
                            index ===
                            media.length - 1
                          }
                          onClick={() =>
                            onMoveMedia(
                              index,
                              1
                            )
                          }
                        />

                        <IconButton
                          icon={Trash2}
                          label="Remove"
                          danger
                          onClick={() => {
                            if (
                              item.source ===
                              "existing"
                            ) {
                              onRemoveExisting(
                                item.sourceIndex
                              );
                            } else {
                              onRemoveFile(
                                item.sourceIndex
                              );
                            }
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-trap-blue/20 p-7 text-center text-xs font-semibold text-trap-ink/40">
                No media selected. The client will use a clean text fallback.
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-trap-blue p-5 text-white">
            <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-trap-yellow">
              Client preview
            </p>

            <h3 className="mt-3 text-2xl font-extrabold leading-tight text-white text-balance">
              {form.title ||
                "Your journal title"}
            </h3>

            <p className="mt-3 text-sm font-medium leading-6 text-white/70 line-clamp-3">
              {form.excerpt ||
                form.content ||
                "A short summary will appear here."}
            </p>
          </section>
        </div>

        <div className="sticky bottom-0 mt-6 flex gap-3 border-t border-trap-blue/10 bg-white/95 py-4 backdrop-blur xl:static">
          <button
            type="button"
            className="admin-button-secondary flex-1"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              !form.title.trim() ||
              !form.content.trim()
            }
            className="admin-button-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Save size={15} />
            )}

            {editingId
              ? "Save changes"
              : "Create post"}
          </button>
        </div>
      </form>
    </aside>
  );
}

function Toggle({
  checked,
  icon: Icon,
  label,
  onChange,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() =>
        onChange(!checked)
      }
      className={[
        "flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 text-left transition",
        checked
          ? "border-trap-blue bg-[#eef1ff] text-trap-blue"
          : "border-trap-blue/10 bg-white text-trap-ink/50",
      ].join(" ")}
    >
      <span className="flex items-center gap-2 text-xs font-extrabold">
        <Icon size={15} />
        {label}
      </span>

      <span
        className={[
          "relative h-6 w-10 rounded-full transition",
          checked
            ? "bg-trap-blue"
            : "bg-trap-ink/15",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition",
            checked
              ? "left-5"
              : "left-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

function IconButton({
  icon: Icon,
  label,
  disabled,
  danger,
  onClick,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "grid h-9 w-9 place-items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-30",
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-trap-blue/10 text-trap-blue hover:bg-[#eef1ff]",
      ].join(" ")}
    >
      <Icon size={14} />
    </button>
  );
}
