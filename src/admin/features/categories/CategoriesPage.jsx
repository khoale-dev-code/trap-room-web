
import { Plus } from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import { useI18n } from "../../../i18n/I18nProvider.jsx";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import AdminConfirmDialog from "../../components/AdminConfirmDialog.jsx";
import AdminPageHeader from "../../components/AdminPageHeader.jsx";
import CategoryEditor from "./components/CategoryEditor.jsx";
import CategoryFilters from "./components/CategoryFilters.jsx";
import CategoryList from "./components/CategoryList.jsx";
import { getCategoriesCopy } from "./copy.js";
import { useCategoriesData } from "./hooks/useCategoriesData.js";
import { useMobileEditorLock } from "./hooks/useMobileEditorLock.js";
import {
  categoryToForm,
  createCategoryForm,
  filterCategories,
  getNextCategoryOrder,
} from "./utils/category.js";

export default function CategoriesPage({
  refreshToken,
}) {
  const { language } = useI18n();
  const copy =
    getCategoriesCopy(language);
  const toast = useToast();

  const data =
    useCategoriesData({
      refreshToken,
      copy,
      toast,
    });

  const [form, setForm] =
    useState(() =>
      createCategoryForm(1)
    );
  const [editingId, setEditingId] =
    useState("");
  const [editorOpen, setEditorOpen] =
    useState(false);
  const [query, setQuery] =
    useState("");
  const [filter, setFilter] =
    useState("all");
  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  useMobileEditorLock(
    editorOpen
  );

  const filteredItems =
    useMemo(
      () =>
        filterCategories({
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

  function updateForm(
    name,
    value
  ) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openCreate() {
    setEditingId("");
    setForm(
      createCategoryForm(
        getNextCategoryOrder(
          data.items
        )
      )
    );
    setEditorOpen(true);
    focusEditor();
  }

  function openEdit(item) {
    setEditingId(item._id);
    setForm(
      categoryToForm(item)
    );
    setEditorOpen(true);
    focusEditor();
  }

  function closeEditor() {
    if (data.saving) {
      return;
    }

    setEditingId("");
    setEditorOpen(false);
    setForm(
      createCategoryForm(
        getNextCategoryOrder(
          data.items
        )
      )
    );
  }

  function focusEditor() {
    window.requestAnimationFrame(
      () => {
        window.setTimeout(() => {
          document
            .getElementById(
              "category-name"
            )
            ?.focus();
        }, 80);
      }
    );
  }

  async function saveCategory() {
    if (data.saving) {
      return;
    }

    const name =
      String(form.name || "")
        .trim();

    if (!name) {
      document
        .getElementById(
          "category-name"
        )
        ?.focus();
      return;
    }

    const saved =
      await data.save({
        editingId,
        form,
      });

    if (saved) {
      closeEditor();
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const deleted =
      await data.remove(
        deleteTarget
      );

    if (!deleted) {
      return;
    }

    if (
      editingId ===
      deleteTarget._id
    ) {
      closeEditor();
    }

    setDeleteTarget(null);
  }

  return (
    <div data-admin-responsive-page="CategoriesManager">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={
          copy.description
        }
        actions={
          <button
            type="button"
            className="admin-button-primary"
            onClick={openCreate}
          >
            <Plus size={16} />
            {copy.newCategory}
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <CategoryEditor
          open={editorOpen}
          editingId={editingId}
          form={form}
          saving={data.saving}
          copy={copy}
          onChange={updateForm}
          onClose={closeEditor}
          onCreate={openCreate}
          onSave={saveCategory}
        />

        <section className="min-w-0">
          <CategoryFilters
            copy={copy}
            query={query}
            filter={filter}
            visibleCount={
              filteredItems.length
            }
            totalCount={
              data.items.length
            }
            onQueryChange={
              setQuery
            }
            onFilterChange={
              setFilter
            }
          />

          <CategoryList
            items={filteredItems}
            loading={data.loading}
            copy={copy}
            reordering={
              data.reordering
            }
            onCreate={openCreate}
            onEdit={openEdit}
            onToggle={
              data.toggle
            }
            onMove={data.move}
            onDelete={
              setDeleteTarget
            }
          />
        </section>
      </div>

      <AdminConfirmDialog
        open={Boolean(
          deleteTarget
        )}
        title={
          copy.deleteTitle
        }
        description={
          copy.deleteDescription(
            deleteTarget?.name || ""
          )
        }
        confirmLabel={
          copy.delete
        }
        busy={data.deleting}
        onCancel={() =>
          setDeleteTarget(null)
        }
        onConfirm={
          confirmDelete
        }
      />
    </div>
  );
}
