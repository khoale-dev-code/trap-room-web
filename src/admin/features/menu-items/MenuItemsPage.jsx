
import { Plus } from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import { useI18n } from "../../../i18n/I18nProvider.jsx";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import AdminConfirmDialog from "../../components/AdminConfirmDialog.jsx";
import AdminPageHeader from "../../components/AdminPageHeader.jsx";
import { getMenuItemsCopy } from "./copy.js";
import MenuItemEditor from "./components/MenuItemEditor.jsx";
import MenuItemFilters from "./components/MenuItemFilters.jsx";
import MenuItemList from "./components/MenuItemList.jsx";
import OrderConflictDialog from "./components/OrderConflictDialog.jsx";
import { useFilePreviews } from "./hooks/useFilePreviews.js";
import { useMenuItemsData } from "./hooks/useMenuItemsData.js";
import {
  collectReusableTags,
  createEmptyMenuItemForm,
  filterMenuItems,
  getNextSortOrder,
  menuItemToForm,
  normalizeMedia,
} from "./utils/menuItem.js";

export default function MenuItemsPage({
  refreshToken,
}) {
  const { language } = useI18n();
  const copy = getMenuItemsCopy(language);
  const toast = useToast();

  const data = useMenuItemsData({
    refreshToken,
    copy,
    toast,
  });

  const [form, setForm] = useState(() =>
    createEmptyMenuItemForm(1)
  );
  const [editingId, setEditingId] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [existingMedia, setExistingMedia] = useState([]);
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [orderConflict, setOrderConflict] = useState(null);

  const previews = useFilePreviews(files);

  const allTags = useMemo(
    () => collectReusableTags(data.products),
    [data.products]
  );

  const filteredProducts = useMemo(
    () =>
      filterMenuItems({
        products: data.products,
        query,
        statusFilter,
        categoryFilter,
      }),
    [
      categoryFilter,
      data.products,
      query,
      statusFilter,
    ]
  );

  const nextOrder =
    getNextSortOrder(data.products);

  const currentEditingProduct =
    data.products.find(
      (product) =>
        product._id === editingId
    );

  function updateForm(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetEditor() {
    setEditingId("");
    setForm(
      createEmptyMenuItemForm(
        getNextSortOrder(
          data.products
        )
      )
    );
    setExistingMedia([]);
    setFiles([]);
    setOrderConflict(null);
    setEditorOpen(false);
  }

  function openCreate() {
    setEditingId("");
    setForm(
      createEmptyMenuItemForm(
        getNextSortOrder(
          data.products
        )
      )
    );
    setExistingMedia([]);
    setFiles([]);
    setOrderConflict(null);
    setEditorOpen(true);
    scrollToEditor();
  }

  function openEdit(product) {
    setEditingId(product._id);
    setForm(menuItemToForm(product));
    setExistingMedia(
      normalizeMedia(product)
    );
    setFiles([]);
    setOrderConflict(null);
    setEditorOpen(true);
    scrollToEditor();
  }

  function scrollToEditor() {
    window.requestAnimationFrame(
      () => {
        document
          .getElementById(
            "menu-item-editor"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }
    );
  }

  async function handleSave(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    if (data.saving) {
      return;
    }

    const productName =
      String(form.name || "").trim();

    if (!productName) {
      document
        .getElementById(
          "menu-item-name"
        )
        ?.focus();

      return;
    }

    const desiredOrder = Math.max(
      1,
      Number(
        form.sortOrder ||
          getNextSortOrder(
            data.products
          )
      )
    );

    const conflict =
      data.products.find(
        (product) =>
          product._id !== editingId &&
          Number(
            product.sortOrder
          ) === desiredOrder
      );

    if (conflict) {
      setOrderConflict(conflict);
      return;
    }

    await persist(null);
  }

  async function persist(conflict) {
    if (data.saving) {
      return;
    }

    try {
      const result =
        await data.save({
          editingId,
          form,
          files,
          existingMedia,
          conflict,
          nextOrder:
            getNextSortOrder(
              data.products
            ),
        });

      if (result?.ok) {
        resetEditor();
      }
    } catch (error) {
      if (
        error?.status === 409 &&
        error?.details?.conflict
      ) {
        setOrderConflict(
          error.details.conflict
        );
        return;
      }

      toast.show(
        error?.message ||
          "Save failed.",
        "error"
      );
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const removed =
      await data.remove(
        deleteTarget
      );

    if (!removed) {
      return;
    }

    if (
      editingId ===
      deleteTarget._id
    ) {
      resetEditor();
    }

    setDeleteTarget(null);
  }

  return (
    <div data-admin-responsive-page="MenuItemsManager">
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
            {copy.newItem}
          </button>
        }
      />

      <div className="grid gap-6 2xl:grid-cols-[500px_minmax(0,1fr)]">
        <MenuItemEditor
          open={editorOpen}
          editingId={editingId}
          form={form}
          categories={
            data.categories
          }
          allTags={allTags}
          existingMedia={
            existingMedia
          }
          setExistingMedia={
            setExistingMedia
          }
          files={files}
          setFiles={setFiles}
          previews={previews}
          saving={data.saving}
          copy={copy}
          onChange={updateForm}
          onClose={resetEditor}
          onCreate={openCreate}
          onSave={handleSave}
        />

        <section className="min-w-0">
          <MenuItemFilters
            copy={copy}
            categories={
              data.categories
            }
            query={query}
            categoryFilter={
              categoryFilter
            }
            statusFilter={
              statusFilter
            }
            visibleCount={
              filteredProducts.length
            }
            totalCount={
              data.products.length
            }
            onQueryChange={
              setQuery
            }
            onCategoryChange={
              setCategoryFilter
            }
            onStatusChange={
              setStatusFilter
            }
          />

          <MenuItemList
            loading={data.loading}
            products={
              filteredProducts
            }
            copy={copy}
            language={language}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={
              setDeleteTarget
            }
            onToggleAvailable={(
              product
            ) =>
              data.quickUpdate(
                product,
                {
                  isAvailable:
                    product.isAvailable ===
                    false,
                }
              )
            }
            onToggleFeatured={(
              product
            ) =>
              data.quickUpdate(
                product,
                {
                  isFeatured:
                    !product.isFeatured,
                }
              )
            }
          />
        </section>
      </div>

      <AdminConfirmDialog
        open={Boolean(
          deleteTarget
        )}
        title={copy.deleteTitle}
        description={
          copy.deleteDescription(
            deleteTarget?.name || ""
          )
        }
        confirmLabel={copy.delete}
        busy={data.deleting}
        onCancel={() =>
          setDeleteTarget(null)
        }
        onConfirm={
          confirmDelete
        }
      />

      <OrderConflictDialog
        open={Boolean(
          orderConflict
        )}
        editing={Boolean(
          editingId
        )}
        currentName={
          form.name ||
          currentEditingProduct?.name ||
          copy.newItem
        }
        conflict={
          orderConflict
        }
        currentOrder={
          Number(
            currentEditingProduct?.sortOrder
          ) ||
          getNextSortOrder(
            data.products
          )
        }
        desiredOrder={Number(
          form.sortOrder || 1
        )}
        copy={copy}
        busy={data.saving}
        onCancel={() =>
          setOrderConflict(null)
        }
        onConfirm={() =>
          persist(
            orderConflict
          )
        }
      />
    </div>
  );
}
