
import {
  FilePlus2,
  Loader2,
  Plus,
  Save,
  X,
} from "lucide-react";
import MediaEditor from "./MediaEditor.jsx";
import ResourceField from "./ResourceField.jsx";

export default function ResourceEditor({
  open,
  editingId,
  config,
  form,
  categories,
  existingMedia,
  setExistingMedia,
  files,
  setFiles,
  previews,
  saving,
  copy,
  onChange,
  onClose,
  onCreate,
  onSave,
}) {
  function submit(event) {
    event.preventDefault();
    onSave();
  }

  function clickSave(event) {
    event.preventDefault();
    event.stopPropagation();
    onSave();
  }

  return (
    <div
      className={[
        "xl:block",
        open
          ? "fixed inset-0 z-[110] flex items-end bg-trap-ink/50 backdrop-blur-sm sm:items-center sm:p-5 xl:static xl:bg-transparent xl:p-0 xl:backdrop-blur-none"
          : "hidden",
      ].join(" ")}
      onMouseDown={(event) => {
        if (
          open &&
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <form
        id="resource-editor"
        onSubmit={submit}
        className="admin-card admin-scrollbar max-h-[92dvh] w-full self-start overflow-y-auto rounded-b-none rounded-t-[1.75rem] shadow-2xl sm:max-w-2xl sm:rounded-[1.75rem] xl:sticky xl:top-24 xl:max-h-[calc(100dvh-120px)] xl:max-w-none xl:rounded-2xl xl:shadow-none"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {open ? (
          <>
            <header className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-trap-blue/10 bg-white px-5 py-4">
              <div className="min-w-0">
                <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-trap-orange">
                  {editingId ? copy.editItem : copy.createItem}
                </p>

                <h2 className="mt-1 truncate text-lg font-extrabold text-trap-blue">
                  {editingId
                    ? form.name || form.title || copy.editItem
                    : copy.newItem}
                </h2>

                <p className="mt-1 text-xs font-medium text-trap-ink/42">
                  {copy.editorHint}
                </p>
              </div>

              <button
                type="button"
                className="admin-icon-button shrink-0"
                onClick={onClose}
                aria-label={copy.close}
              >
                <X size={18} />
              </button>
            </header>

            <div className="p-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {(config.fields || []).map((field) => (
                  <ResourceField
                    key={field.name}
                    field={field}
                    value={form[field.name]}
                    categories={categories}
                    copy={copy}
                    onChange={(value) =>
                      onChange(field.name, value)
                    }
                  />
                ))}
              </div>

              {config.supportsMedia && (
                <MediaEditor
                  copy={copy}
                  existingMedia={existingMedia}
                  setExistingMedia={setExistingMedia}
                  files={files}
                  setFiles={setFiles}
                  previews={previews}
                />
              )}
            </div>

            <footer className="sticky bottom-0 z-20 grid gap-2 border-t border-trap-blue/10 bg-white/96 p-4 backdrop-blur sm:grid-cols-2">
              <button
                type="button"
                className="admin-button-secondary"
                onClick={onClose}
                disabled={saving}
              >
                {copy.cancel}
              </button>

              <button
                type="button"
                className="admin-button-primary relative z-10 pointer-events-auto touch-manipulation"
                onClick={clickSave}
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : editingId ? (
                  <Save size={16} />
                ) : (
                  <Plus size={16} />
                )}

                {saving
                  ? copy.saving
                  : editingId
                    ? copy.save
                    : copy.createItem}
              </button>
            </footer>
          </>
        ) : (
          <div className="grid min-h-[390px] place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eef1ff] text-trap-blue">
                <FilePlus2 size={24} />
              </span>

              <h2 className="mt-5 text-xl font-extrabold text-trap-blue">
                {copy.createItem}
              </h2>

              <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-6 text-trap-ink/45">
                {copy.editorHint}
              </p>

              <button
                type="button"
                className="admin-button-primary mt-6"
                onClick={onCreate}
              >
                <Plus size={16} />
                {copy.newItem}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
