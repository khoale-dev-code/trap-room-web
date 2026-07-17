
import {
  Coffee,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Star,
  StarOff,
  X,
} from "lucide-react";
import CurrencyInput from "./CurrencyInput.jsx";
import MediaEditor from "./MediaEditor.jsx";
import SizeEditor from "./SizeEditor.jsx";
import TagInput from "./TagInput.jsx";
import ToggleCard from "./ToggleCard.jsx";

export default function MenuItemEditor({
  open,
  editingId,
  form,
  categories,
  allTags,
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
  function submitFromButton(
    event
  ) {
    event.preventDefault();
    event.stopPropagation();
    onSave();
  }

  return (
    <form
      id="menu-item-editor"
      onSubmit={onSave}
      className={[
        "admin-card self-start overflow-hidden 2xl:sticky 2xl:top-24",
        open
          ? "block"
          : "hidden 2xl:block",
      ].join(" ")}
    >
      {open ? (
        <>
          <div className="flex items-start justify-between gap-4 border-b border-trap-blue/10 px-5 py-4">
            <div>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-trap-orange">
                {editingId
                  ? copy.editTitle
                  : copy.createTitle}
              </p>

              <h2 className="mt-1 line-clamp-1 text-lg font-extrabold text-trap-blue">
                {form.name ||
                  (editingId
                    ? copy.editTitle
                    : copy.newItem)}
              </h2>
            </div>

            <button
              type="button"
              className="admin-icon-button"
              onClick={onClose}
              aria-label={
                copy.cancel
              }
            >
              <X size={18} />
            </button>
          </div>

          <div className="admin-scrollbar max-h-[calc(100dvh-220px)] overflow-y-auto p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="admin-label">
                  {copy.name}
                </span>

                <input
                  id="menu-item-name"
                  className="admin-input"
                  value={form.name}
                  maxLength={160}
                  placeholder={
                    copy.namePlaceholder
                  }
                  onChange={(
                    event
                  ) =>
                    onChange(
                      "name",
                      event.target.value
                    )
                  }
                  required
                />
              </label>

              <label>
                <span className="admin-label">
                  {copy.category}
                </span>

                <select
                  className="admin-select"
                  value={
                    form.categoryId
                  }
                  onChange={(
                    event
                  ) =>
                    onChange(
                      "categoryId",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    {copy.noCategory}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category._id
                        }
                        value={
                          category._id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span className="admin-label">
                  {copy.order}
                </span>

                <input
                  className="admin-input"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    form.sortOrder
                  }
                  onChange={(
                    event
                  ) =>
                    onChange(
                      "sortOrder",
                      event.target.value
                    )
                  }
                />

                <small className="mt-2 block text-xs font-medium leading-5 text-trap-ink/42">
                  {copy.orderHelp}
                </small>
              </label>

              <label className="sm:col-span-2">
                <span className="admin-label">
                  {
                    copy.descriptionLabel
                  }
                </span>

                <textarea
                  className="admin-textarea min-h-[130px]"
                  value={
                    form.description
                  }
                  maxLength={4000}
                  placeholder={
                    copy.descriptionPlaceholder
                  }
                  onChange={(
                    event
                  ) =>
                    onChange(
                      "description",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span className="admin-label">
                  {copy.price}
                </span>

                <CurrencyInput
                  value={form.price}
                  ariaLabel={
                    copy.price
                  }
                  onChange={(
                    value
                  ) =>
                    onChange(
                      "price",
                      value
                    )
                  }
                />

                <small className="mt-2 block text-xs font-medium leading-5 text-trap-ink/42">
                  {copy.priceHint}
                </small>
              </label>

              <label>
                <span className="admin-label">
                  {copy.oldPrice}
                </span>

                <CurrencyInput
                  value={
                    form.oldPrice
                  }
                  ariaLabel={
                    copy.oldPrice
                  }
                  onChange={(
                    value
                  ) =>
                    onChange(
                      "oldPrice",
                      value
                    )
                  }
                />
              </label>

              <div className="sm:col-span-2">
                <span className="admin-label">
                  {copy.tags}
                </span>

                <TagInput
                  value={form.tags}
                  suggestions={
                    allTags
                  }
                  placeholder={
                    copy.tagPlaceholder
                  }
                  help={copy.tagHelp}
                  existingLabel={
                    copy.existingTags
                  }
                  onChange={(
                    value
                  ) =>
                    onChange(
                      "tags",
                      value
                    )
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <span className="admin-label">
                  {copy.sizes}
                </span>

                <SizeEditor
                  value={form.sizes}
                  copy={copy}
                  onChange={(
                    value
                  ) =>
                    onChange(
                      "sizes",
                      value
                    )
                  }
                />
              </div>

              <ToggleCard
                title={copy.visible}
                description={
                  copy.visibleHelp
                }
                checked={
                  form.isAvailable
                }
                icon={
                  form.isAvailable
                    ? Eye
                    : EyeOff
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "isAvailable",
                    value
                  )
                }
              />

              <ToggleCard
                title={
                  copy.favorite
                }
                description={
                  copy.favoriteHelp
                }
                checked={
                  form.isFeatured
                }
                icon={
                  form.isFeatured
                    ? Star
                    : StarOff
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "isFeatured",
                    value
                  )
                }
              />

              <div className="sm:col-span-2">
                <MediaEditor
                  copy={copy}
                  existingMedia={
                    existingMedia
                  }
                  setExistingMedia={
                    setExistingMedia
                  }
                  files={files}
                  setFiles={
                    setFiles
                  }
                  previews={
                    previews
                  }
                />
              </div>
            </div>
          </div>

          <div className="relative z-40 grid gap-2 border-t border-trap-blue/10 bg-[#f8f9fd] p-4 sm:grid-cols-2">
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
              data-menu-item-save="true"
              className="admin-button-primary relative z-50 pointer-events-auto touch-manipulation"
              style={{
                pointerEvents:
                  "auto",
                touchAction:
                  "manipulation",
              }}
              onClick={
                submitFromButton
              }
              disabled={saving}
              aria-busy={
                saving
              }
            >
              {saving ? (
                <Loader2
                  className="animate-spin"
                  size={16}
                />
              ) : (
                <Save size={16} />
              )}

              {saving
                ? copy.saving
                : editingId
                  ? copy.save
                  : copy.create}
            </button>
          </div>
        </>
      ) : (
        <div className="grid min-h-[430px] place-items-center p-8 text-center">
          <div>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eef1ff] text-trap-blue">
              <Coffee size={24} />
            </span>

            <h2 className="mt-5 text-xl font-extrabold text-trap-blue">
              {copy.createTitle}
            </h2>

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
  );
}
