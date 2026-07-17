
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createCategory,
  listCategories,
  removeCategory,
  reorderCategories,
  updateCategory,
} from "../services/categoriesApi.js";
import {
  moveCategoryInList,
  normalizeCategoryOrder,
  placeCategoryAtOrder,
} from "../utils/category.js";
import {
  extractApiCollection,
  extractApiEntity,
} from "../../../utils/apiPayload.js";

export function useCategoriesData({
  refreshToken,
  copy,
  toast,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const requestIdRef = useRef(0);

  const load = useCallback(async ({
    silent = false,
  } = {}) => {
    const requestId = ++requestIdRef.current;

    try {
      if (!silent) {
        setLoading(true);
      }

      const response =
        await listCategories();

      if (
        requestId !==
        requestIdRef.current
      ) {
        return false;
      }

      setItems(
        normalizeCategoryOrder(
          extractApiCollection(
            response,
            ["categories", "items"]
          )
        )
      );

      return true;
    } catch (error) {
      toast.show(
        error?.message ||
          copy.loadFailed,
        "error"
      );

      return false;
    } finally {
      if (
        requestId ===
          requestIdRef.current &&
        !silent
      ) {
        setLoading(false);
      }
    }
  }, [
    copy.loadFailed,
    toast,
  ]);

  useEffect(() => {
    load();
  }, [
    load,
    refreshToken,
  ]);

  const save = useCallback(
    async ({
      editingId,
      form,
    }) => {
      const name =
        String(
          form?.name || ""
        ).trim();

      if (!name || saving) {
        return false;
      }

      try {
        setSaving(true);

        const commonPayload = {
          name,
          description: String(
            form?.description || ""
          ).trim(),
          isActive: Boolean(
            form?.isActive
          ),
        };

        let response;

        if (editingId) {
          response =
            await updateCategory(
              editingId,
              commonPayload
            );
        } else {
          response =
            await createCategory({
              ...commonPayload,
              sortOrder:
                items.length + 1,
            });
        }

        const savedCategory =
          extractApiEntity(
            response,
            ["category", "item"]
          );

        if (!savedCategory?._id) {
          throw new Error(
            copy.saveFailed
          );
        }

        const sourceItems =
          editingId
            ? items.map((item) =>
                item._id ===
                editingId
                  ? {
                      ...item,
                      ...savedCategory,
                    }
                  : item
              )
            : [
                ...items,
                savedCategory,
              ];

        const ordered =
          placeCategoryAtOrder(
            sourceItems,
            savedCategory._id,
            form?.sortOrder
          );

        await reorderCategories(
          ordered.map(
            (item) => item._id
          )
        );

        setItems(ordered);

        toast.show(
          editingId
            ? copy.updated
            : copy.created
        );

        await load({
          silent: true,
        });

        return true;
      } catch (error) {
        toast.show(
          error?.message ||
            copy.saveFailed,
          "error"
        );

        return false;
      } finally {
        setSaving(false);
      }
    },
    [
      copy.created,
      copy.saveFailed,
      copy.updated,
      items,
      load,
      saving,
      toast,
    ]
  );

  const move = useCallback(
    async (
      category,
      direction
    ) => {
      if (reordering) {
        return;
      }

      const previous =
        normalizeCategoryOrder(
          items
        );

      const next =
        moveCategoryInList(
          items,
          category._id,
          direction
        );

      const unchanged =
        next.every(
          (item, index) =>
            item._id ===
            previous[index]?._id
        );

      if (unchanged) {
        return;
      }

      setItems(next);

      try {
        setReordering(true);

        await reorderCategories(
          next.map(
            (item) => item._id
          )
        );

        toast.show(
          copy.reordered
        );
      } catch (error) {
        setItems(previous);
        toast.show(
          error?.message,
          "error"
        );
      } finally {
        setReordering(false);
      }
    },
    [
      copy.reordered,
      items,
      reordering,
      toast,
    ]
  );

  const toggle = useCallback(
    async (category) => {
      try {
        const response =
          await updateCategory(
            category._id,
            {
              isActive:
                category.isActive ===
                false,
            }
          );

        const updatedCategory =
          extractApiEntity(
            response,
            ["category", "item"]
          );

        setItems((current) =>
          current.map((item) =>
            item._id ===
            category._id
              ? {
                  ...item,
                  isActive:
                    category.isActive ===
                    false,
                  ...(updatedCategory ||
                    {}),
                }
              : item
          )
        );

        toast.show(
          copy.statusUpdated
        );
      } catch (error) {
        toast.show(
          error?.message,
          "error"
        );
      }
    },
    [
      copy.statusUpdated,
      toast,
    ]
  );

  const remove = useCallback(
    async (category) => {
      if (!category || deleting) {
        return false;
      }

      try {
        setDeleting(true);

        await removeCategory(
          category._id
        );

        const remaining =
          normalizeCategoryOrder(
            items.filter(
              (item) =>
                item._id !==
                category._id
            )
          );

        if (
          remaining.length > 0
        ) {
          await reorderCategories(
            remaining.map(
              (item) => item._id
            )
          );
        }

        setItems(remaining);
        toast.show(copy.deleted);

        await load({
          silent: true,
        });

        return true;
      } catch (error) {
        toast.show(
          error?.message,
          "error"
        );

        return false;
      } finally {
        setDeleting(false);
      }
    },
    [
      copy.deleted,
      deleting,
      items,
      load,
      toast,
    ]
  );

  return {
    items,
    loading,
    saving,
    reordering,
    deleting,
    load,
    save,
    move,
    toggle,
    remove,
  };
}
