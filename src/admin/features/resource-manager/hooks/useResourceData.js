
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createResource,
  listResourceCategories,
  listResources,
  removeResource,
  updateResource,
  uploadResourceMedia,
} from "../services/resourceApi.js";
import { buildResourcePayload } from "../utils/resource.js";
import {
  describeApiPayload,
  extractApiCollection,
  extractApiEntity,
} from "../../../utils/apiPayload.js";

export function useResourceData({
  config,
  refreshToken,
  copy,
  toast,
}) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const itemsRef = useRef([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const load = useCallback(async ({
    silent = false,
  } = {}) => {
    const requestId = ++requestIdRef.current;

    try {
      if (!silent) {
        setLoading(true);
      }

      const needsCategories = Boolean(
        config?.fields?.some(
          (field) =>
            field.type === "category-select"
        )
      );

      const requests = [
        listResources(config),
      ];

      if (needsCategories) {
        requests.push(
          listResourceCategories()
        );
      }

      const [
        resourceResponse,
        categoryResponse,
      ] = await Promise.all(requests);

      if (
        requestId !==
        requestIdRef.current
      ) {
        return false;
      }

      const collectionKeys = [
        config?.responseKey,
        config?.id,
        config?.api,
        pluralize(config?.singular),
      ];

      const nextItems =
        extractApiCollection(
          resourceResponse,
          collectionKeys
        );

      /*
       * A successful endpoint can legitimately return an empty list.
       * When the payload has keys but no recognized collection, keep
       * the current list and report the real response shape instead of
       * silently replacing statistics with zero.
       */
      const payloadIsArray =
        Array.isArray(resourceResponse);
      const payloadIsEmptyObject =
        resourceResponse &&
        typeof resourceResponse === "object" &&
        !payloadIsArray &&
        Object.keys(resourceResponse).length === 0;

      if (
        nextItems.length === 0 &&
        !payloadIsArray &&
        !payloadIsEmptyObject &&
        itemsRef.current.length > 0
      ) {
        throw new Error(
          `Cannot read ${config?.title || "resource"} collection from API response (${describeApiPayload(resourceResponse)}).`
        );
      }

      setItems(nextItems);

      if (categoryResponse) {
        setCategories(
          extractApiCollection(
            categoryResponse,
            ["categories"]
          )
        );
      }

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
    config,
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
      files,
      existingMedia,
    }) => {
      if (saving) {
        return false;
      }

      try {
        setSaving(true);

        const uploadResult =
          await uploadResourceMedia(
            files
          );

        const uploadedMedia =
          extractApiCollection(
            uploadResult,
            ["media"]
          );

        const payload =
          buildResourcePayload({
            config,
            form,
            media: [
              ...existingMedia,
              ...uploadedMedia,
            ],
          });

        let response;

        if (editingId) {
          response =
            await updateResource(
              config,
              editingId,
              payload
            );

          const savedEntity =
            extractApiEntity(
              response,
              [
                config?.singular,
                "item",
              ]
            );

          setItems((current) =>
            current.map((item) =>
              item._id === editingId
                ? {
                    ...item,
                    ...payload,
                    ...(savedEntity || {}),
                  }
                : item
            )
          );

          toast.show(copy.updated);
        } else {
          response =
            await createResource(
              config,
              payload
            );

          const createdEntity =
            extractApiEntity(
              response,
              [
                config?.singular,
                "item",
              ]
            );

          if (createdEntity) {
            setItems((current) => [
              createdEntity,
              ...current.filter(
                (item) =>
                  item._id !==
                  createdEntity._id
              ),
            ]);
          }

          toast.show(copy.created);
        }

        /*
         * Refresh from the API after the optimistic update. A failed
         * refresh no longer clears the counters because load() keeps
         * the last known collection on malformed responses.
         */
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
      config,
      copy.created,
      copy.saveFailed,
      copy.updated,
      load,
      saving,
      toast,
    ]
  );

  const toggle = useCallback(
    async (item, field) => {
      try {
        const nextValue =
          !item?.[field];

        const response =
          await updateResource(
            config,
            item._id,
            {
              [field]: nextValue,
            }
          );

        const updatedEntity =
          extractApiEntity(
            response,
            [
              config?.singular,
              "item",
            ]
          );

        setItems((current) =>
          current.map((entry) =>
            entry._id === item._id
              ? {
                  ...entry,
                  [field]: nextValue,
                  ...(updatedEntity || {}),
                }
              : entry
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
      config,
      copy.statusUpdated,
      toast,
    ]
  );

  const remove = useCallback(
    async (item) => {
      if (!item || deleting) {
        return false;
      }

      try {
        setDeleting(true);

        await removeResource(
          config,
          item._id
        );

        setItems((current) =>
          current.filter(
            (entry) =>
              entry._id !== item._id
          )
        );

        toast.show(copy.deleted);

        await load({
          silent: true,
        });

        return true;
      } catch (error) {
        toast.show(
          error?.message ||
            copy.deleteFailed,
          "error"
        );

        return false;
      } finally {
        setDeleting(false);
      }
    },
    [
      config,
      copy.deleteFailed,
      copy.deleted,
      deleting,
      load,
      toast,
    ]
  );

  return {
    items,
    categories,
    loading,
    saving,
    deleting,
    load,
    save,
    toggle,
    remove,
  };
}

function pluralize(value) {
  const text =
    String(value || "").trim();

  if (!text) {
    return "";
  }

  return text.endsWith("s")
    ? text
    : `${text}s`;
}
