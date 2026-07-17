
import { Plus } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useI18n } from "../../../i18n/I18nProvider.jsx";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import { emptyForm } from "../../adminConfig.js";
import AdminConfirmDialog from "../../components/AdminConfirmDialog.jsx";
import AdminPageHeader from "../../components/AdminPageHeader.jsx";
import { getResourceManagerCopy } from "./copy.js";
import ResourceEditor from "./components/ResourceEditor.jsx";
import ResourceFilters from "./components/ResourceFilters.jsx";
import ResourceList from "./components/ResourceList.jsx";
import { useFilePreviews } from "./hooks/useFilePreviews.js";
import { useMobileEditorLock } from "./hooks/useMobileEditorLock.js";
import { useResourceData } from "./hooks/useResourceData.js";
import {
  filterResources,
  getFilterOptions,
  getItemTitle,
  itemToForm,
  normalizeMedia,
} from "./utils/resource.js";

export default function ResourceManagerPage({
  config,
  refreshToken,
}) {
  const { language } = useI18n();
  const copy = getResourceManagerCopy(language, config);
  const toast = useToast();

  const data = useResourceData({
    config,
    refreshToken,
    copy,
    toast,
  });

  const [form, setForm] = useState(() => emptyForm(config));
  const [editingId, setEditingId] = useState("");
  const [files, setFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const previews = useFilePreviews(files);
  useMobileEditorLock(editorOpen);

  useEffect(() => {
    setForm(emptyForm(config));
    setEditingId("");
    setFiles([]);
    setExistingMedia([]);
    setFilter("all");
    setEditorOpen(false);
    setDeleteTarget(null);
  }, [config]);

  const filteredItems = useMemo(
    () =>
      filterResources({
        items: data.items,
        query,
        filter,
      }),
    [
      data.items,
      filter,
      query,
    ]
  );

  const filterOptions = useMemo(
    () =>
      getFilterOptions(
        config,
        copy
      ),
    [config, copy]
  );

  function updateForm(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetEditor() {
    if (data.saving) {
      return;
    }

    setForm(emptyForm(config));
    setEditingId("");
    setFiles([]);
    setExistingMedia([]);
    setEditorOpen(false);
  }

  function createNew() {
    setForm(emptyForm(config));
    setEditingId("");
    setFiles([]);
    setExistingMedia([]);
    setEditorOpen(true);
    focusEditor();
  }

  function edit(item) {
    setEditingId(item._id);
    setFiles([]);
    setExistingMedia(normalizeMedia(item));
    setForm(itemToForm(config, item));
    setEditorOpen(true);
    focusEditor();
  }

  function focusEditor() {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        document
          .querySelector(
            "#resource-editor input:not([type='checkbox']):not([type='radio']), #resource-editor textarea"
          )
          ?.focus();
      }, 80);
    });
  }

  async function saveResource() {
    if (data.saving) {
      return;
    }

    const requiredField = (config.fields || []).find(
      (field) => field.required
    );

    if (
      requiredField &&
      !String(form?.[requiredField.name] ?? "").trim()
    ) {
      document
        .querySelector(
          `#resource-editor [name="${requiredField.name}"]`
        )
        ?.focus();
      return;
    }

    const saved = await data.save({
      editingId,
      form,
      files,
      existingMedia,
    });

    if (saved) {
      resetEditor();
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const deleted = await data.remove(deleteTarget);

    if (!deleted) {
      return;
    }

    if (editingId === deleteTarget._id) {
      resetEditor();
    }

    setDeleteTarget(null);
  }

  return (
    <div data-admin-responsive-page="ResourceManager">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <button
            type="button"
            className="admin-button-primary"
            onClick={createNew}
          >
            <Plus size={16} />
            {copy.newItem}
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
        <ResourceEditor
          open={editorOpen}
          editingId={editingId}
          config={config}
          form={form}
          categories={data.categories}
          existingMedia={existingMedia}
          setExistingMedia={setExistingMedia}
          files={files}
          setFiles={setFiles}
          previews={previews}
          saving={data.saving}
          copy={copy}
          onChange={updateForm}
          onClose={resetEditor}
          onCreate={createNew}
          onSave={saveResource}
        />

        <section className="min-w-0">
          <ResourceFilters
            copy={copy}
            query={query}
            filter={filter}
            filterOptions={filterOptions}
            visibleCount={filteredItems.length}
            totalCount={data.items.length}
            onQueryChange={setQuery}
            onFilterChange={setFilter}
          />

          <ResourceList
            loading={data.loading}
            items={filteredItems}
            config={config}
            copy={copy}
            language={language}
            onCreate={createNew}
            onEdit={edit}
            onDelete={setDeleteTarget}
            onToggle={data.toggle}
          />
        </section>
      </div>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title={copy.deleteTitle}
        description={copy.deleteDescription(
          getItemTitle(deleteTarget, "this item")
        )}
        confirmLabel={copy.delete}
        busy={data.deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
