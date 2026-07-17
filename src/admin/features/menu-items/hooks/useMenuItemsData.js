
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  createMenuItem,
  listMenuCategories,
  listMenuItems,
  removeMenuItem,
  updateMenuItem,
  uploadMenuItemMedia,
} from "../services/menuItemsApi.js";
import {
  buildMenuItemPayload,
  sortMenuItems,
} from "../utils/menuItem.js";

export function useMenuItemsData({
  refreshToken,
  copy,
  toast,
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [productData, categoryData] =
        await Promise.all([
          listMenuItems(),
          listMenuCategories(),
        ]);

      setProducts(
        Array.isArray(productData?.products)
          ? [...productData.products].sort(sortMenuItems)
          : []
      );

      setCategories(
        Array.isArray(categoryData?.categories)
          ? [...categoryData.categories].sort(
              (a, b) =>
                Number(a?.sortOrder || 999) -
                Number(b?.sortOrder || 999)
            )
          : []
      );
    } catch (error) {
      toast.show(error?.message || copy.loadError, "error");
    } finally {
      setLoading(false);
    }
  }, [copy.loadError, toast]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const save = useCallback(
    async ({
      editingId,
      form,
      files,
      existingMedia,
      conflict,
      nextOrder,
    }) => {
      try {
        setSaving(true);

        const uploadResult = await uploadMenuItemMedia(files);
        const uploadedMedia = Array.isArray(uploadResult?.media)
          ? uploadResult.media
          : [];

        const payload = buildMenuItemPayload({
          form,
          categories,
          media: [...existingMedia, ...uploadedMedia],
          nextOrder,
        });

        if (!payload.name) {
          return { ok: false, reason: "missing-name" };
        }

        if (editingId) {
          const result = await updateMenuItem(editingId, {
            ...payload,
            ...(conflict
              ? { swapWithId: conflict._id }
              : {}),
          });

          toast.show(copy.updated);

          if (result?.product) {
            setProducts((current) =>
              current
                .map((product) =>
                  product._id === result.product._id
                    ? result.product
                    : product
                )
                .sort(sortMenuItems)
            );
          }
        } else {
          await createMenuItem({
            ...payload,
            ...(conflict
              ? { orderConflictMode: "shift" }
              : {}),
          });

          toast.show(copy.created);
        }

        await load();
        return { ok: true };
      } catch (error) {
        if (error?.code === "UPLOAD_API_UNAVAILABLE") {
          toast.show(copy.uploadUnavailable, "error");
        }

        throw error;
      } finally {
        setSaving(false);
      }
    },
    [categories, copy, load, toast]
  );

  const quickUpdate = useCallback(
    async (product, patch) => {
      try {
        const result = await updateMenuItem(product._id, patch);

        setProducts((current) =>
          current
            .map((entry) =>
              entry._id === product._id
                ? result.product
                : entry
            )
            .sort(sortMenuItems)
        );

        toast.show(copy.statusUpdated);
      } catch (error) {
        toast.show(error?.message || "Update failed.", "error");
      }
    },
    [copy.statusUpdated, toast]
  );

  const remove = useCallback(
    async (product) => {
      try {
        setDeleting(true);
        await removeMenuItem(product._id);
        toast.show(copy.deleted);
        await load();
        return true;
      } catch (error) {
        toast.show(error?.message || "Delete failed.", "error");
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [copy.deleted, load, toast]
  );

  return {
    products,
    categories,
    loading,
    saving,
    deleting,
    load,
    save,
    quickUpdate,
    remove,
  };
}
