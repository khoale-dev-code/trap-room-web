
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  ImagePlus,
  Images,
  LayoutGrid,
  List,
  Loader2,
  Maximize2,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  StarOff,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "../../../lib/api.js";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import AdminConfirmDialog from "../../components/AdminConfirmDialog.jsx";
import AdminEmptyState from "../../components/AdminEmptyState.jsx";
import AdminPageHeader from "../../components/AdminPageHeader.jsx";
import { createPortal } from "react-dom";
import { useI18n } from "../../../i18n/I18nProvider.jsx";
const CATEGORIES = [
  { value: "space", label: "Space" },
  { value: "drink", label: "Drinks" },
  { value: "bakery", label: "Bakes" },
  { value: "event", label: "Events" },
  { value: "other", label: "Other" },
];

const OBJECT_POSITIONS = [
  { value: "center center", label: "Center" },
  { value: "center top", label: "Top" },
  { value: "center bottom", label: "Bottom" },
  { value: "left center", label: "Left" },
  { value: "right center", label: "Right" },
  { value: "left top", label: "Top left" },
  { value: "right top", label: "Top right" },
  { value: "left bottom", label: "Bottom left" },
  { value: "right bottom", label: "Bottom right" },
];

const EMPTY_FORM = {
  title: "",
  category: "space",
  description: "",
  sortOrder: 999,
  isFeatured: false,
  isActive: true,
};

const EMPTY_BATCH_FORM = {
  titlePrefix: "",
  category: "space",
  isFeatured: false,
  isActive: true,
};

export default function GalleryManager({
  refreshToken,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [batchSaving, setBatchSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [bulkWorking, setBulkWorking] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [mediaDrafts, setMediaDrafts] = useState([]);
  const mediaDraftsRef = useRef([]);

  const [batchOpen, setBatchOpen] = useState(false);
  const [batchForm, setBatchForm] = useState(EMPTY_BATCH_FORM);
  const [batchFiles, setBatchFiles] = useState([]);
  const batchPreviewUrlsRef = useRef([]);

  const [previewItem, setPreviewItem] = useState(null);
  const [deleteRequest, setDeleteRequest] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();
  const { language } = useI18n();

  useEffect(() => {
    loadGallery();
  }, [refreshToken]);

  useEffect(() => {
    return () => {
      revokeDraftPreviews(mediaDraftsRef.current);
      batchPreviewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const batchPreviews = useMemo(() => {
    batchPreviewUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    const previews = batchFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      resourceType: file.type.startsWith("video/")
        ? "video"
        : "image",
    }));

    batchPreviewUrlsRef.current = previews.map((item) => item.url);

    return previews;
  }, [batchFiles]);

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return [...items]
      .sort(sortGallery)
      .filter((item) => {
        const media = normalizeGalleryMedia(item);

        const searchable = [
          item.title,
          item.description,
          item.category,
          ...media.map((entry) => entry.alt || entry.originalName),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesQuery =
          !keyword || searchable.includes(keyword);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && item.isActive !== false) ||
          (statusFilter === "hidden" && item.isActive === false) ||
          (statusFilter === "featured" && item.isFeatured === true);

        const matchesCategory =
          categoryFilter === "all" ||
          item.category === categoryFilter;

        const matchesType =
          typeFilter === "all" ||
          (typeFilter === "image" &&
            media.some((entry) => getResourceType(entry) !== "video")) ||
          (typeFilter === "video" &&
            media.some((entry) => getResourceType(entry) === "video"));

        return (
          matchesQuery &&
          matchesStatus &&
          matchesCategory &&
          matchesType
        );
      });
  }, [
    items,
    query,
    statusFilter,
    categoryFilter,
    typeFilter,
  ]);

  const reorderAvailable =
    !query.trim() &&
    statusFilter === "all" &&
    categoryFilter === "all" &&
    typeFilter === "all";

  async function loadGallery(
    options = {}
  ) {
    const silent =
      options?.silent === true;

    try {
      if (!silent) {
        setLoading(true);
      }

      const data =
        await api.gallery.list();

      const gallery =
        extractGalleryList(
          data
        ).sort(sortGallery);

      setItems(gallery);

      window.__TRAP_GALLERY_DATA__ = {
        ok: true,
        source:
          "api.gallery.list",
        responseKeys:
          data &&
          typeof data ===
            "object" &&
          !Array.isArray(data)
            ? Object.keys(data)
            : [],
        count:
          gallery.length,
        updatedAt:
          new Date().toISOString(),
      };
    } catch (error) {
      window.__TRAP_GALLERY_DATA__ = {
        ok: false,
        source:
          "api.gallery.list",
        count: 0,
        error:
          error?.message ||
          "Could not load Gallery.",
        updatedAt:
          new Date().toISOString(),
      };

      toast.show(
        error.message,
        "error"
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  function commitMediaDrafts(next) {
    mediaDraftsRef.current = next;
    setMediaDrafts(next);
  }

  function openCreate() {
    revokeDraftPreviews(mediaDraftsRef.current);

    setEditingId("");
    setForm({
      ...EMPTY_FORM,
      sortOrder:
        Math.max(
          0,
          ...items.map((item) => Number(item.sortOrder || 0))
        ) + 1,
    });
    commitMediaDrafts([]);
    setEditorOpen(true);
    scrollToEditor();
  }

  function openEdit(item) {
    revokeDraftPreviews(mediaDraftsRef.current);

    setEditingId(item._id);
    setForm({
      title: item.title || "",
      category: item.category || "space",
      description: item.description || "",
      sortOrder: Number(item.sortOrder || 999),
      isFeatured: item.isFeatured === true,
      isActive: item.isActive !== false,
    });

    commitMediaDrafts(
      normalizeGalleryMedia(item).map((media, index) => ({
        key:
          media.publicId ||
          media.url ||
          `existing-${index}`,
        source: "existing",
        ...media,
        alt: media.alt || item.title || "",
        objectPosition:
          media.objectPosition || "center center",
      }))
    );

    setEditorOpen(true);
    scrollToEditor();
  }

  function closeEditor() {
    revokeDraftPreviews(mediaDraftsRef.current);

    setEditorOpen(false);
    setEditingId("");
    setForm(EMPTY_FORM);
    commitMediaDrafts([]);
  }

  function scrollToEditor() {
    window.requestAnimationFrame(() => {
      document
        .getElementById("gallery-editor")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }

  function updateForm(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function addEditorFiles(fileList) {
    const picked = Array.from(fileList || []);
    const remaining = Math.max(0, 12 - mediaDraftsRef.current.length);

    if (picked.length > remaining) {
      toast.show(
        `Only ${remaining} more media file(s) can be added.`,
        "error"
      );
    }

    const additions = picked.slice(0, remaining).map((file, index) => ({
      key: `new-${Date.now()}-${index}-${file.name}`,
      source: "new",
      file,
      previewUrl: URL.createObjectURL(file),
      url: "",
      publicId: "",
      resourceType: file.type.startsWith("video/")
        ? "video"
        : "image",
      originalName: file.name,
      alt: form.title || cleanFilename(file.name),
      objectPosition: "center center",
    }));

    commitMediaDrafts([
      ...mediaDraftsRef.current,
      ...additions,
    ]);
  }

  function updateMediaDraft(key, patch) {
    commitMediaDrafts(
      mediaDraftsRef.current.map((draft) =>
        draft.key === key
          ? { ...draft, ...patch }
          : draft
      )
    );
  }

  function removeMediaDraft(key) {
    const target = mediaDraftsRef.current.find(
      (draft) => draft.key === key
    );

    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl);
    }

    commitMediaDrafts(
      mediaDraftsRef.current.filter(
        (draft) => draft.key !== key
      )
    );
  }

  function moveMediaDraft(key, direction) {
    const current = [...mediaDraftsRef.current];
    const index = current.findIndex(
      (draft) => draft.key === key
    );

    const targetIndex = index + direction;

    if (
      index < 0 ||
      targetIndex < 0 ||
      targetIndex >= current.length
    ) {
      return;
    }

    const [moved] = current.splice(index, 1);
    current.splice(targetIndex, 0, moved);

    commitMediaDrafts(current);
  }

  async function submitEditor(event) {
    event.preventDefault();

    const title = form.title.trim();

    if (!title) {
      toast.show("Please enter a gallery title.", "error");
      return;
    }

    if (mediaDraftsRef.current.length === 0) {
      toast.show(
        "Add at least one image or video.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const newDrafts = mediaDraftsRef.current.filter(
        (draft) => draft.source === "new"
      );

      let uploaded = [];

      if (newDrafts.length > 0) {
        const result = await api.upload(
          newDrafts.map((draft) => draft.file)
        );

        uploaded = result.media || [];

        if (uploaded.length !== newDrafts.length) {
          throw new Error(
            "Some media files were not uploaded. Please try again."
          );
        }
      }

      let uploadedIndex = 0;

      const media = mediaDraftsRef.current.map(
        (draft, index) => {
          if (draft.source === "existing") {
            return cleanMediaPayload(draft, index);
          }

          const uploadedMedia =
            uploaded[uploadedIndex++];

          return cleanMediaPayload(
            {
              ...uploadedMedia,
              alt: draft.alt,
              objectPosition: draft.objectPosition,
              originalName:
                uploadedMedia.originalName ||
                draft.originalName,
            },
            index
          );
        }
      );

      const firstImage = media.find(
        (entry) => getResourceType(entry) !== "video"
      );

      const payload = {
        title,
        category: form.category,
        description: form.description.trim(),
        sortOrder: Math.max(
          1,
          Number(form.sortOrder || 999)
        ),
        isFeatured: Boolean(form.isFeatured),
        isActive: Boolean(form.isActive),
        media,
        imageUrl: firstImage?.url || "",
      };

      let saved;

      if (editingId) {
        const result = await api.gallery.update(
          editingId,
          payload
        );

        saved = result.galleryItem;

        setItems((current) =>
          current
            .map((item) =>
              item._id === editingId ? saved : item
            )
            .sort(sortGallery)
        );

        toast.show("Gallery item updated.");
      } else {
        const result = await api.gallery.create(payload);

        saved = result.galleryItem;

        setItems((current) =>
          [...current, saved].sort(sortGallery)
        );

        toast.show("Gallery item created.");
      }

      await loadGallery({ silent: true });

      closeEditor();
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  function openBatchUploader() {
    setBatchForm(EMPTY_BATCH_FORM);
    setBatchFiles([]);
    setBatchOpen(true);

    window.requestAnimationFrame(() => {
      document
        .getElementById("gallery-batch-upload")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }

  function closeBatchUploader() {
    batchPreviewUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    batchPreviewUrlsRef.current = [];
    setBatchFiles([]);
    setBatchForm(EMPTY_BATCH_FORM);
    setBatchOpen(false);
  }

  async function submitBatch(event) {
    event.preventDefault();

    if (batchFiles.length === 0) {
      toast.show(
        "Select at least one image or video.",
        "error"
      );
      return;
    }

    if (batchFiles.length > 12) {
      toast.show(
        "Upload up to 12 files at a time.",
        "error"
      );
      return;
    }

    try {
      setBatchSaving(true);

      const uploadResult = await api.upload(batchFiles);
      const uploaded = uploadResult.media || [];

      if (uploaded.length !== batchFiles.length) {
        throw new Error(
          "Some files were not uploaded. Please try again."
        );
      }

      const nextOrder =
        Math.max(
          0,
          ...items.map((item) => Number(item.sortOrder || 0))
        ) + 1;

      const created = await Promise.all(
        uploaded.map((media, index) => {
          const filenameTitle = cleanFilename(
            media.originalName ||
              batchFiles[index]?.name ||
              `Gallery ${index + 1}`
          );

          const prefix = batchForm.titlePrefix.trim();

          const title = prefix
            ? uploaded.length > 1
              ? `${prefix} ${index + 1}`
              : prefix
            : filenameTitle;

          const normalizedMedia = cleanMediaPayload(
            {
              ...media,
              alt: title,
              objectPosition: "center center",
            },
            0
          );

          return api.gallery.create({
            title,
            category: batchForm.category,
            description: "",
            sortOrder: nextOrder + index,
            isFeatured: Boolean(batchForm.isFeatured),
            isActive: Boolean(batchForm.isActive),
            media: [normalizedMedia],
            imageUrl:
              getResourceType(normalizedMedia) !== "video"
                ? normalizedMedia.url
                : "",
          });
        })
      );

      const createdItems = created
        .map((result) => result.galleryItem)
        .filter(Boolean);

      setItems((current) =>
        [...current, ...createdItems].sort(sortGallery)
      );

      await loadGallery({ silent: true });

      closeBatchUploader();

      toast.show(
        `${createdItems.length} gallery item(s) created.`
      );
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setBatchSaving(false);
    }
  }

  async function quickUpdate(item, patch, successMessage) {
    try {
      const result = await api.gallery.update(
        item._id,
        patch
      );

      const saved = result.galleryItem;

      setItems((current) =>
        current
          .map((currentItem) =>
            currentItem._id === saved._id
              ? saved
              : currentItem
          )
          .sort(sortGallery)
      );

      await loadGallery({ silent: true });

      toast.show(successMessage);
    } catch (error) {
      toast.show(error.message, "error");
    }
  }

  async function duplicateItem(item) {
    try {
      const media = normalizeGalleryMedia(item);

      const result = await api.gallery.create({
        title: `${item.title} copy`,
        category: item.category || "other",
        description: item.description || "",
        sortOrder:
          Math.max(
            0,
            ...items.map((entry) =>
              Number(entry.sortOrder || 0)
            )
          ) + 1,
        isFeatured: false,
        isActive: false,
        media,
        imageUrl: item.imageUrl || "",
      });

      setItems((current) =>
        [...current, result.galleryItem].sort(sortGallery)
      );

      await loadGallery({ silent: true });

      toast.show("Gallery item duplicated as hidden.");
    } catch (error) {
      toast.show(error.message, "error");
    }
  }

  function toggleSelection(id) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds((current) => {
      const visibleIds = filteredItems.map((item) => item._id);
      const allSelected =
        visibleIds.length > 0 &&
        visibleIds.every((id) => current.has(id));

      const next = new Set(current);

      visibleIds.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });

      return next;
    });
  }

  async function bulkUpdate(patch, successMessage) {
    const ids = [...selectedIds];

    if (ids.length === 0) return;

    try {
      setBulkWorking(true);

      const results = await Promise.all(
        ids.map((id) =>
          api.gallery.update(id, patch)
        )
      );

      const savedMap = new Map(
        results
          .map((result) => result.galleryItem)
          .filter(Boolean)
          .map((item) => [item._id, item])
      );

      setItems((current) =>
        current
          .map((item) => savedMap.get(item._id) || item)
          .sort(sortGallery)
      );

      setSelectedIds(new Set());
      toast.show(successMessage);
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setBulkWorking(false);
    }
  }

  async function confirmDelete() {
    if (!deleteRequest) return;

    try {
      setDeleting(true);

      const ids =
        deleteRequest.type === "bulk"
          ? deleteRequest.ids
          : [deleteRequest.item._id];

      await Promise.all(
        ids.map((id) =>
          api.gallery.remove(id)
        )
      );

      setItems((current) =>
        current.filter((item) => !ids.includes(item._id))
      );

      setSelectedIds((current) => {
        const next = new Set(current);
        ids.forEach((id) => next.delete(id));
        return next;
      });

      if (editingId && ids.includes(editingId)) {
        closeEditor();
      }

      setDeleteRequest(null);

      toast.show(
        ids.length === 1
          ? "Gallery item deleted."
          : `${ids.length} gallery items deleted.`
      );
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setDeleting(false);
    }
  }

  async function moveItem(item, direction) {
    if (!reorderAvailable || reordering) return;

    const ordered = [...items].sort(sortGallery);
    const index = ordered.findIndex(
      (entry) => entry._id === item._id
    );

    const targetIndex = index + direction;

    if (
      index < 0 ||
      targetIndex < 0 ||
      targetIndex >= ordered.length
    ) {
      return;
    }

    const next = [...ordered];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);

    const optimistic = next.map((entry, orderIndex) => ({
      ...entry,
      sortOrder: orderIndex + 1,
    }));

    setItems(optimistic);

    try {
      setReordering(true);

      const result = await api.request(
        "/gallery/reorder",
        {
          method: "PATCH",
          body: JSON.stringify({
            ids: optimistic.map((entry) => entry._id),
          }),
        }
      );

      setItems(
        Array.isArray(result.gallery)
          ? result.gallery.sort(sortGallery)
          : optimistic
      );

      toast.show("Gallery order updated.");
    } catch (error) {
      setItems(ordered);
      toast.show(error.message, "error");
    } finally {
      setReordering(false);
    }
  }

  const allVisibleSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) =>
      selectedIds.has(item._id)
    );

  return (
    <div data-admin-page="gallery" data-admin-responsive-page="gallery">
      <AdminPageHeader
        eyebrow="Visual publishing"
        title="gallery."
        description="Upload visual content quickly, organize it by category and control where it appears on the client."
        actions={
          <>
            <button
              type="button"
              className="admin-button-secondary"
              onClick={openBatchUploader}
              title="Each selected file becomes a separate Gallery item."
            >
              <UploadCloud size={16} />
              Upload separate items
            </button>

            <button
              type="button"
              className="admin-button-primary"
              onClick={openCreate}
              title="Create one Gallery item with a title, description and multiple media."
            >
              <Plus size={16} />
              Create media group
            </button>
          </>
        }
      />

      <GalleryWorkflowPanel language={language} />

      {batchOpen && (
        <BatchUploadPanel
          id="gallery-batch-upload"
          form={batchForm}
          setForm={setBatchForm}
          files={batchFiles}
          setFiles={setBatchFiles}
          previews={batchPreviews}
          saving={batchSaving}
          onSubmit={submitBatch}
          onClose={closeBatchUploader}
        />
      )}

      <section
        data-gallery-control-center="true"
        className="admin-card mt-4 p-4 sm:p-5"
      >
        <div className="flex flex-col gap-3 border-b border-trap-blue/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-trap-orange">
              Library controls
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-trap-blue">
              Find and manage gallery items
            </h2>

            <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-trap-ink/45">
              Search first, narrow the result, then select or edit only the items you need.
            </p>
          </div>

          {(query ||
            categoryFilter !== "all" ||
            statusFilter !== "all" ||
            typeFilter !== "all") && (
            <button
              type="button"
              className="admin-button-secondary shrink-0"
              onClick={() => {
                setQuery("");
                setCategoryFilter("all");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-end">
          <label className="relative block">
            <span className="admin-label">
              Search gallery
            </span>

            <Search
              className="pointer-events-none absolute bottom-[15px] left-4 text-trap-blue/45"
              size={17}
            />

            <input
              className="admin-input pl-11"
              placeholder="Search title, description, category or alt text..."
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
            />
          </label>

          <label>
            <span className="admin-label">
              Category
            </span>

            <select
              className="admin-select min-w-[170px]"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="all">
                All categories
              </option>

              {CATEGORIES.map((category) => (
                <option
                  key={category.value}
                  value={category.value}
                >
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="admin-label">
              View
            </span>

            <div className="flex rounded-full border border-trap-blue/12 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={[
                  "grid h-10 w-10 place-items-center rounded-full transition",
                  viewMode === "grid"
                    ? "bg-trap-blue text-trap-yellow"
                    : "text-trap-blue",
                ].join(" ")}
                aria-label="Grid view"
              >
                <LayoutGrid size={17} />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={[
                  "grid h-10 w-10 place-items-center rounded-full transition",
                  viewMode === "list"
                    ? "bg-trap-blue text-trap-yellow"
                    : "text-trap-blue",
                ].join(" ")}
                aria-label="List view"
              >
                <List size={17} />
              </button>
            </div>
          </div>
        </div>
        <div
          data-gallery-compact-filters="true"
          className="mt-4 grid gap-4 border-t border-trap-blue/10 pt-4 lg:grid-cols-2"
        >
          <div className="min-w-0">
            <span className="admin-label">
              Visibility
            </span>

            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {[
                ["all", "All items"],
                ["active", "Visible"],
                ["hidden", "Hidden"],
                ["featured", "Featured"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={[
                    "min-h-10 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.08em] transition",
                    statusFilter === value
                      ? "border-trap-blue bg-trap-blue text-trap-yellow"
                      : "border-trap-blue/12 bg-white text-trap-blue hover:bg-[#eef1ff]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <span className="admin-label">
              Media type
            </span>

            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {[
                ["all", "All media"],
                ["image", "Images"],
                ["video", "Videos"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTypeFilter(value)}
                  className={[
                    "min-h-10 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.08em] transition",
                    typeFilter === value
                      ? "border-trap-blue bg-trap-blue text-trap-yellow"
                      : "border-trap-blue/12 bg-white text-trap-blue hover:bg-[#eef1ff]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>


        <div className="mt-4 flex flex-col gap-3 border-t border-trap-blue/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-xs font-bold text-trap-blue">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={selectAllVisible}
                className="h-4 w-4 accent-trap-blue"
              />
              Select visible
            </label>

            <span className="text-xs font-semibold text-trap-ink/40">
              {filteredItems.length} of {items.length} items
            </span>

            {!reorderAvailable && (
              <span className="text-xs font-semibold text-amber-700">
                Clear filters to reorder items.
              </span>
            )}
          </div>

          <button
            type="button"
            className="text-xs font-bold text-trap-blue"
            onClick={loadGallery}
          >
            Reload gallery
          </button>
        </div>
      </section>

      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          working={bulkWorking}
          onClear={() => setSelectedIds(new Set())}
          onShow={() =>
            bulkUpdate(
              { isActive: true },
              "Selected items are now visible."
            )
          }
          onHide={() =>
            bulkUpdate(
              { isActive: false },
              "Selected items are now hidden."
            )
          }
          onFeature={() =>
            bulkUpdate(
              { isFeatured: true },
              "Selected items are now featured."
            )
          }
          onUnfeature={() =>
            bulkUpdate(
              { isFeatured: false },
              "Selected items are no longer featured."
            )
          }
          onDelete={() =>
            setDeleteRequest({
              type: "bulk",
              ids: [...selectedIds],
            })
          }
        />
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <section className="min-w-0">
          {loading ? (
            <div className="admin-card grid min-h-72 place-items-center">
              <Loader2
                className="animate-spin text-trap-blue"
                size={28}
              />
            </div>
          ) : filteredItems.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 sm:grid-cols-2 2xl:grid-cols-3"
                  : "grid gap-4"
              }
            >
              {filteredItems.map((item, index) => (
                <GalleryCard
                  key={item._id}
                  item={item}
                  index={index}
                  viewMode={viewMode}
                  selected={selectedIds.has(item._id)}
                  reorderAvailable={reorderAvailable}
                  reordering={reordering}
                  onSelect={() => toggleSelection(item._id)}
                  onPreview={() => setPreviewItem(item)}
                  onEdit={() => openEdit(item)}
                  onDuplicate={() => duplicateItem(item)}
                  onToggleActive={() =>
                    quickUpdate(
                      item,
                      { isActive: item.isActive === false },
                      item.isActive === false
                        ? "Gallery item is now visible."
                        : "Gallery item hidden."
                    )
                  }
                  onToggleFeatured={() =>
                    quickUpdate(
                      item,
                      { isFeatured: !item.isFeatured },
                      item.isFeatured
                        ? "Removed from homepage highlights."
                        : "Added to homepage highlights."
                    )
                  }
                  onMoveUp={() => moveItem(item, -1)}
                  onMoveDown={() => moveItem(item, 1)}
                  onDelete={() =>
                    setDeleteRequest({
                      type: "single",
                      item,
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="No matching gallery content."
              description="Change the filters or upload new visual content."
              action={
                <button
                  type="button"
                  className="admin-button-primary"
                  onClick={openBatchUploader}
                >
                  <UploadCloud size={16} />
                  Upload media
                </button>
              }
            />
          )}
        </section>

        <section
          id="gallery-editor"
          className={[
            "admin-card self-start overflow-hidden xl:sticky xl:top-24",
            editorOpen
              ? "block"
              : "hidden xl:block",
          ].join(" ")}
        >
          {editorOpen ? (
            <form onSubmit={submitEditor}>
              <div className="flex items-start justify-between gap-4 border-b border-trap-blue/10 px-5 py-4">
                <div>
                  <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-trap-orange">
                    {editingId
                      ? "Editing gallery item"
                      : "Creating gallery item"}
                  </p>

                  <h2 className="mt-1 text-lg font-extrabold text-trap-blue">
                    {editingId
                      ? "Update visual content"
                      : "New visual content"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="admin-icon-button"
                  onClick={closeEditor}
                  aria-label="Close gallery editor"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="admin-scrollbar max-h-[calc(100vh-225px)] overflow-y-auto p-5">
                <div className="grid gap-5">
                  <label>
                    <span className="admin-label">
                      Title *
                    </span>

                    <input
                      className="admin-input"
                      maxLength={180}
                      value={form.title}
                      placeholder="Saturday afternoon at TRAP"
                      onChange={(event) =>
                        updateForm("title", event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    <span className="admin-label">
                      Category
                    </span>

                    <select
                      className="admin-select"
                      value={form.category}
                      onChange={(event) =>
                        updateForm("category", event.target.value)
                      }
                    >
                      {CATEGORIES.map((category) => (
                        <option
                          key={category.value}
                          value={category.value}
                        >
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="admin-label">
                      Description
                    </span>

                    <textarea
                      className="admin-textarea"
                      maxLength={2000}
                      value={form.description}
                      placeholder="A short optional caption for this visual."
                      onChange={(event) =>
                        updateForm(
                          "description",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span className="admin-label">
                      Display order
                    </span>

                    <input
                      className="admin-input"
                      type="number"
                      min="1"
                      step="1"
                      value={form.sortOrder}
                      onChange={(event) =>
                        updateForm(
                          "sortOrder",
                          event.target.value
                        )
                      }
                    />

                    <small className="mt-2 block text-xs font-medium leading-5 text-trap-ink/42">
                      Lower values appear first on the client.
                    </small>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ToggleCard
                      title="Visible"
                      description="Show this content on the public website."
                      checked={form.isActive}
                      onChange={(value) =>
                        updateForm("isActive", value)
                      }
                      icon={form.isActive ? Eye : EyeOff}
                    />

                    <ToggleCard
                      title="Featured"
                      description="Prioritize this item on the homepage."
                      checked={form.isFeatured}
                      onChange={(value) =>
                        updateForm("isFeatured", value)
                      }
                      icon={
                        form.isFeatured
                          ? Star
                          : StarOff
                      }
                    />
                  </div>

                  <GalleryMediaEditor
                    drafts={mediaDrafts}
                    onAddFiles={addEditorFiles}
                    onUpdate={updateMediaDraft}
                    onRemove={removeMediaDraft}
                    onMove={moveMediaDraft}
                  />
                </div>
              </div>

              <div className="grid gap-2 border-t border-trap-blue/10 bg-[#f8f9fd] p-4 sm:grid-cols-2">
                <button
                  type="button"
                  className="admin-button-secondary"
                  onClick={closeEditor}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-button-primary"
                  disabled={saving}
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
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create item"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid min-h-[430px] place-items-center p-8 text-center">
              <div>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eef1ff] text-trap-blue">
                  <Images size={24} />
                </span>

                <h2 className="mt-5 text-xl font-extrabold text-trap-blue">
                  Select an item to edit
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-trap-ink/50">
                  Edit one gallery item or use Upload separate items for multiple files.
                </p>

                <button
                  type="button"
                  className="admin-button-primary mt-6"
                  onClick={openCreate}
                >
                  <Plus size={16} />
                  Create media group
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <AdminConfirmDialog
        open={Boolean(deleteRequest)}
        title={
          deleteRequest?.type === "bulk"
            ? `Delete ${deleteRequest.ids.length} gallery items?`
            : "Delete this gallery item?"
        }
        description={
          deleteRequest?.type === "bulk"
            ? "The selected gallery items will be permanently removed. This action cannot be undone."
            : `This permanently removes “${
                deleteRequest?.item?.title || "this gallery item"
              }”. This action cannot be undone.`
        }
        confirmLabel={
          deleteRequest?.type === "bulk"
            ? "Delete selected"
            : "Delete item"
        }
        busy={deleting}
        onCancel={() => setDeleteRequest(null)}
        onConfirm={confirmDelete}
      />

      <GalleryPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
}

function GalleryWorkflowPanel({
  language,
}) {
  const vi = language === "vi";

  const content = vi
    ? {
        eyebrow: "Quy trình đăng nội dung",
        title: "Chọn đúng cách đăng Gallery",
        summary:
          "Tải riêng nhiều mục hoặc tạo một nhóm media có nội dung đầy đủ.",
        open: "Xem hướng dẫn",
        steps: [
          {
            number: "01",
            title: "Tải riêng từng file",
            body:
              "Dùng Tải nhiều mục khi mỗi ảnh hoặc video cần trở thành một mục Gallery độc lập.",
          },
          {
            number: "02",
            title: "Tạo nhóm media",
            body:
              "Dùng Tạo nhóm media khi một tiêu đề cần chứa nhiều ảnh, video và phần mô tả chung.",
          },
          {
            number: "03",
            title: "Kiểm tra trước khi hiện",
            body:
              "Lưu ở trạng thái ẩn để kiểm tra. Chỉ bật Nổi bật cho nội dung cần ưu tiên ngoài Client.",
          },
        ],
      }
    : {
        eyebrow: "Publishing workflow",
        title: "Choose the right Gallery action",
        summary:
          "Upload separate records quickly or create one complete media group.",
        open: "View guide",
        steps: [
          {
            number: "01",
            title: "Upload separate items",
            body:
              "Use this when every selected image or video should become its own Gallery item.",
          },
          {
            number: "02",
            title: "Create a media group",
            body:
              "Use this when one title needs several images, videos and one shared description.",
          },
          {
            number: "03",
            title: "Review before publishing",
            body:
              "Keep an item hidden while checking it. Use Featured only for priority Client content.",
          },
        ],
      };

  return (
    <details
      data-gallery-workflow="true"
      className="admin-card group mt-4 overflow-hidden"
    >
      <summary className="flex cursor-pointer list-none flex-col gap-3 p-4 marker:hidden sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef1ff] text-trap-blue">
            <Sparkles size={18} />
          </span>

          <div className="min-w-0">
            <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-trap-orange">
              {content.eyebrow}
            </p>

            <h2 className="mt-1 text-base font-extrabold text-trap-blue sm:text-lg">
              {content.title}
            </h2>

            <p className="mt-1 text-xs font-medium leading-5 text-trap-ink/45">
              {content.summary}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-[0.1em] text-trap-blue">
          {content.open}
          <span className="ml-2 inline-block transition-transform group-open:rotate-180">
            ↓
          </span>
        </span>
      </summary>

      <div className="grid gap-3 border-t border-trap-blue/10 bg-[#fbfcff] p-4 md:grid-cols-3 sm:p-5">
        {content.steps.map((step) => (
          <article
            key={step.number}
            className="rounded-2xl border border-trap-blue/10 bg-white p-4"
          >
            <span className="text-[9px] font-extrabold tracking-[0.14em] text-trap-orange">
              {step.number}
            </span>

            <h3 className="mt-2 text-sm font-extrabold text-trap-blue">
              {step.title}
            </h3>

            <p className="mt-2 text-xs font-medium leading-5 text-trap-ink/55">
              {step.body}
            </p>
          </article>
        ))}
      </div>
    </details>
  );
}

function BatchUploadPanel({
  id,
  form,
  setForm,
  files,
  setFiles,
  previews,
  saving,
  onSubmit,
  onClose,
}) {
  return (
    <form
      id={id}
      onSubmit={onSubmit}
      className="admin-card mt-6 overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 border-b border-trap-blue/10 p-5">
        <div>
          <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-trap-orange">
            Fast workflow
          </p>

          <h2 className="mt-1 text-xl font-extrabold text-trap-blue">
            Upload separate items
          </h2>

          <p className="mt-1 text-xs font-medium leading-5 text-trap-ink/45">
            Every selected file becomes a separate gallery item.
          </p>
        </div>

        <button
          type="button"
          className="admin-icon-button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close quick upload"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid gap-6 p-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="grid content-start gap-5">
          <label>
            <span className="admin-label">
              Shared title
            </span>

            <input
              className="admin-input"
              value={form.titlePrefix}
              placeholder="Weekend at TRAP"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  titlePrefix: event.target.value,
                }))
              }
            />

            <small className="mt-2 block text-xs font-medium leading-5 text-trap-ink/42">
              With multiple files, the title receives a number automatically. Leave blank to use filenames.
            </small>
          </label>

          <label>
            <span className="admin-label">
              Category
            </span>

            <select
              className="admin-select"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
            >
              {CATEGORIES.map((category) => (
                <option
                  key={category.value}
                  value={category.value}
                >
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <ToggleCard
            title="Visible after upload"
            description="Immediately show the new items on the client."
            checked={form.isActive}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                isActive: value,
              }))
            }
            icon={form.isActive ? Eye : EyeOff}
          />

          <ToggleCard
            title="Feature all"
            description="Use carefully to avoid too many homepage highlights."
            checked={form.isFeatured}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                isFeatured: value,
              }))
            }
            icon={
              form.isFeatured
                ? Star
                : StarOff
            }
          />
        </div>

        <div>
          <label className="grid min-h-44 cursor-pointer place-items-center rounded-2xl border border-dashed border-trap-blue/25 bg-[#f8f9fd] p-6 text-center transition hover:border-trap-blue hover:bg-[#eef1ff]">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-trap-blue shadow-sm">
              <UploadCloud size={23} />
            </span>

            <span className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.13em] text-trap-blue">
              Select up to 12 images or videos
            </span>

            <span className="mt-1 text-xs font-medium text-trap-ink/40">
              JPG, PNG, WEBP, GIF, MP4 or WEBM
            </span>

            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(event) => {
                setFiles(
                  Array.from(event.target.files || []).slice(0, 12)
                );
                event.target.value = "";
              }}
            />
          </label>

          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {previews.map((item, index) => (
                <article
                  key={`${item.file.name}-${index}`}
                  className="relative aspect-square overflow-hidden rounded-xl bg-[#eef1ff]"
                >
                  {item.resourceType === "video" ? (
                    <video
                      src={item.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setFiles((current) =>
                        current.filter(
                          (_, fileIndex) => fileIndex !== index
                        )
                      )
                    }
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white shadow"
                    aria-label={`Remove file ${index + 1}`}
                  >
                    <X size={14} />
                  </button>

                  <span className="absolute bottom-2 left-2 right-2 truncate rounded-lg bg-black/55 px-2 py-1 text-[8px] font-bold text-white backdrop-blur">
                    {item.file.name}
                  </span>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-trap-blue/10 bg-[#f8f9fd] p-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="admin-button-secondary"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="admin-button-primary"
          disabled={saving || files.length === 0}
        >
          {saving ? (
            <Loader2
              className="animate-spin"
              size={16}
            />
          ) : (
            <UploadCloud size={16} />
          )}

          {saving
            ? "Uploading..."
            : `Create ${files.length || 0} item(s)`}
        </button>
      </div>
    </form>
  );
}

function GalleryCard({
  item,
  index,
  viewMode,
  selected,
  reorderAvailable,
  reordering,
  onSelect,
  onPreview,
  onEdit,
  onDuplicate,
  onToggleActive,
  onToggleFeatured,
  onMoveUp,
  onMoveDown,
  onDelete,
}) {
  const media = normalizeGalleryMedia(item);
  const cover = media[0];

  const categoryLabel =
    CATEGORIES.find(
      (category) => category.value === item.category
    )?.label || "Other";

  const isList = viewMode === "list";

  return (
    <article
      className={[
        "admin-card-flat overflow-hidden transition",
        selected
          ? "border-trap-blue ring-4 ring-trap-blue/8"
          : "",
        isList
          ? "grid md:grid-cols-[220px_minmax(0,1fr)]"
          : "",
      ].join(" ")}
    >
      <div className="relative">
        <button
          type="button"
          onClick={onPreview}
          className={[
            "relative block w-full overflow-hidden bg-[#eef1ff]",
            isList
              ? "min-h-[230px] md:h-full"
              : "aspect-[4/3]",
          ].join(" ")}
          aria-label={`Preview ${item.title}`}
        >
          {cover ? (
            getResourceType(cover) === "video" ? (
              <video
                src={cover.url}
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={cover.url}
                alt={cover.alt || item.title}
                style={{
                  objectPosition:
                    cover.objectPosition || "center center",
                }}
                className="h-full w-full object-cover"
              />
            )
          ) : (
            <span className="grid h-full min-h-[220px] place-items-center text-trap-blue">
              <ImagePlus size={34} />
            </span>
          )}

          <span className="absolute inset-0 bg-gradient-to-t from-trap-ink/60 via-transparent to-transparent" />

          <span className="absolute bottom-3 left-3 admin-badge bg-white/90 text-trap-blue backdrop-blur">
            {media.length} media
          </span>

          {item.isFeatured && (
            <span className="absolute right-3 top-3 admin-badge bg-trap-yellow text-trap-blue">
              <Star size={11} />
              Featured
            </span>
          )}
        </button>

        <label className="absolute left-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/90 shadow backdrop-blur">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="h-4 w-4 accent-trap-blue"
            aria-label={`Select ${item.title}`}
          />
        </label>
      </div>

      <div className="flex min-w-0 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="admin-badge bg-[#eef1ff] text-trap-blue">
            {categoryLabel}
          </span>

          <span
            className={[
              "admin-badge",
              item.isActive !== false
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600",
            ].join(" ")}
          >
            {item.isActive !== false
              ? "Visible"
              : "Hidden"}
          </span>
        </div>

        <h2 className="mt-4 line-clamp-2 text-xl font-extrabold leading-tight text-trap-blue text-balance">
          {item.title}
        </h2>

        <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-trap-ink/52">
          {item.description ||
            "No description added."}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-extrabold uppercase tracking-[0.1em] text-trap-ink/38">
          <span>Order {item.sortOrder || 999}</span>

          <span>
            {media.some(
              (entry) => getResourceType(entry) === "video"
            )
              ? "Includes video"
              : "Images"}
          </span>

          <span>#{index + 1}</span>
        </div>

        <div className="mt-auto grid grid-cols-4 gap-2 border-t border-trap-blue/10 pt-4">
          <button
            type="button"
            className="admin-icon-button"
            onClick={onPreview}
            title="Preview"
            aria-label="Preview item"
          >
            <Maximize2 size={16} />
          </button>

          <button
            type="button"
            className="admin-icon-button"
            onClick={onEdit}
            title="Edit"
            aria-label="Edit item"
          >
            <Edit3 size={16} />
          </button>

          <button
            type="button"
            className="admin-icon-button"
            onClick={onToggleActive}
            title={
              item.isActive !== false
                ? "Hide item"
                : "Show item"
            }
            aria-label={
              item.isActive !== false
                ? "Hide item"
                : "Show item"
            }
          >
            {item.isActive !== false ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>

          <button
            type="button"
            className="admin-icon-button"
            onClick={onToggleFeatured}
            title={
              item.isFeatured
                ? "Remove featured"
                : "Feature item"
            }
            aria-label={
              item.isFeatured
                ? "Remove featured"
                : "Feature item"
            }
          >
            {item.isFeatured ? (
              <StarOff size={16} />
            ) : (
              <Star size={16} />
            )}
          </button>
        </div>

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="admin-button-secondary flex-1 px-3"
            onClick={onDuplicate}
          >
            <Copy size={14} />
            Duplicate
          </button>

          <button
            type="button"
            className="admin-icon-button"
            onClick={onMoveUp}
            disabled={!reorderAvailable || reordering || index === 0}
            title="Move earlier"
            aria-label="Move item earlier"
          >
            <ArrowUp size={15} />
          </button>

          <button
            type="button"
            className="admin-icon-button"
            onClick={onMoveDown}
            disabled={!reorderAvailable || reordering}
            title="Move later"
            aria-label="Move item later"
          >
            <ArrowDown size={15} />
          </button>

          <button
            type="button"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-red-200 bg-red-50 text-red-700"
            onClick={onDelete}
            title="Delete"
            aria-label="Delete item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function BulkActionBar({
  count,
  working,
  onClear,
  onShow,
  onHide,
  onFeature,
  onUnfeature,
  onDelete,
}) {
  return (
    <div className="sticky bottom-3 z-20 mt-4 rounded-2xl border border-trap-blue/15 bg-white/95 p-3 shadow-[0_18px_55px_rgb(7_17_63_/_16%)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-trap-blue text-trap-yellow">
            {working ? (
              <Loader2
                className="animate-spin"
                size={17}
              />
            ) : (
              <Check size={17} />
            )}
          </span>

          <div>
            <p className="text-sm font-extrabold text-trap-blue">
              {count} selected
            </p>

            <button
              type="button"
              className="mt-1 text-xs font-semibold text-trap-ink/45"
              onClick={onClear}
              disabled={working}
            >
              Clear selection
            </button>
          </div>
        </div>

        <div className="admin-scrollbar flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            className="admin-button-secondary shrink-0"
            onClick={onShow}
            disabled={working}
          >
            <Eye size={15} />
            Show
          </button>

          <button
            type="button"
            className="admin-button-secondary shrink-0"
            onClick={onHide}
            disabled={working}
          >
            <EyeOff size={15} />
            Hide
          </button>

          <button
            type="button"
            className="admin-button-secondary shrink-0"
            onClick={onFeature}
            disabled={working}
          >
            <Star size={15} />
            Feature
          </button>

          <button
            type="button"
            className="admin-button-secondary shrink-0"
            onClick={onUnfeature}
            disabled={working}
          >
            <StarOff size={15} />
            Unfeature
          </button>

          <button
            type="button"
            className="admin-button-danger shrink-0"
            onClick={onDelete}
            disabled={working}
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleCard({
  title,
  description,
  checked,
  onChange,
  icon: Icon,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "admin-card-flat flex min-h-[96px] items-center justify-between gap-4 p-4 text-left transition",
        checked
          ? "border-trap-blue bg-[#eef1ff]"
          : "",
      ].join(" ")}
    >
      <span className="flex min-w-0 items-start gap-3">
        <span
          className={[
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
            checked
              ? "bg-trap-blue text-trap-yellow"
              : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          <Icon size={17} />
        </span>

        <span>
          <b className="block text-sm text-trap-blue">
            {title}
          </b>

          <small className="mt-1 block text-xs font-medium leading-5 text-trap-ink/42">
            {description}
          </small>
        </span>
      </span>

      <span
        className={[
          "relative h-7 w-12 shrink-0 rounded-full transition",
          checked
            ? "bg-trap-blue"
            : "bg-slate-300",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

function GalleryMediaEditor({
  drafts,
  onAddFiles,
  onUpdate,
  onRemove,
  onMove,
}) {
  return (
    <section className="border-t border-trap-blue/10 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="admin-label">
            Images and videos
          </span>

          <p className="text-xs font-medium leading-5 text-trap-ink/42">
            Add up to 12 files. The first media appears as the card cover.
          </p>
        </div>

        <span className="admin-badge bg-[#eef1ff] text-trap-blue">
          {drafts.length}/12
        </span>
      </div>

      <label className="mt-4 grid min-h-32 cursor-pointer place-items-center rounded-2xl border border-dashed border-trap-blue/25 bg-[#f8f9fd] p-5 text-center transition hover:border-trap-blue hover:bg-[#eef1ff]">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-trap-blue shadow-sm">
          <UploadCloud size={20} />
        </span>

        <span className="mt-3 text-[9px] font-extrabold uppercase tracking-[0.12em] text-trap-blue">
          Add media
        </span>

        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(event) => {
            onAddFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {drafts.length > 0 && (
        <div className="mt-4 grid gap-4">
          {drafts.map((draft, index) => {
            const url =
              draft.source === "new"
                ? draft.previewUrl
                : draft.url;

            return (
              <article
                key={draft.key}
                className="admin-card-flat overflow-hidden p-3"
              >
                <div className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)]">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-[#eef1ff]">
                    {getResourceType(draft) === "video" ? (
                      <video
                        src={url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={url}
                        alt={draft.alt || ""}
                        style={{
                          objectPosition:
                            draft.objectPosition ||
                            "center center",
                        }}
                        className="h-full w-full object-cover"
                      />
                    )}

                    <span className="absolute left-2 top-2 admin-badge bg-white/90 text-trap-blue">
                      {index === 0
                        ? "Cover"
                        : `Media ${index + 1}`}
                    </span>

                    <button
                      type="button"
                      onClick={() => onRemove(draft.key)}
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white shadow"
                      aria-label={`Remove media ${index + 1}`}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid content-start gap-3">
                    <label>
                      <span className="admin-label">
                        Alternative text
                      </span>

                      <input
                        className="admin-input"
                        value={draft.alt || ""}
                        placeholder="Describe the image for accessibility"
                        onChange={(event) =>
                          onUpdate(draft.key, {
                            alt: event.target.value,
                          })
                        }
                      />
                    </label>

                    {getResourceType(draft) !== "video" && (
                      <label>
                        <span className="admin-label">
                          Crop focus
                        </span>

                        <select
                          className="admin-select"
                          value={
                            draft.objectPosition ||
                            "center center"
                          }
                          onChange={(event) =>
                            onUpdate(draft.key, {
                              objectPosition:
                                event.target.value,
                            })
                          }
                        >
                          {OBJECT_POSITIONS.map((position) => (
                            <option
                              key={position.value}
                              value={position.value}
                            >
                              {position.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="admin-button-secondary flex-1 px-3"
                        onClick={() =>
                          onMove(draft.key, -1)
                        }
                        disabled={index === 0}
                      >
                        <ArrowUp size={14} />
                        Earlier
                      </button>

                      <button
                        type="button"
                        className="admin-button-secondary flex-1 px-3"
                        onClick={() =>
                          onMove(draft.key, 1)
                        }
                        disabled={
                          index >= drafts.length - 1
                        }
                      >
                        <ArrowDown size={14} />
                        Later
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function GalleryPreviewModal({
  item,
  onClose,
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [item?._id]);

  useEffect(() => {
    if (!item || typeof document === "undefined") {
      return undefined;
    }

    const body = document.body;
    const html = document.documentElement;
    const scrollY =
      window.scrollY ||
      html.scrollTop ||
      0;

    const previous = {
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyTouchAction: body.style.touchAction,
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior:
        html.style.overscrollBehavior,
    };

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.touchAction = "none";

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      body.style.overflow =
        previous.bodyOverflow;
      body.style.position =
        previous.bodyPosition;
      body.style.top =
        previous.bodyTop;
      body.style.width =
        previous.bodyWidth;
      body.style.touchAction =
        previous.bodyTouchAction;

      html.style.overflow =
        previous.htmlOverflow;
      html.style.overscrollBehavior =
        previous.htmlOverscrollBehavior;

      window.scrollTo(0, scrollY);
    };
  }, [item, onClose]);

  if (
    !item ||
    typeof document === "undefined"
  ) {
    return null;
  }

  const media =
    normalizeGalleryMedia(item);

  const safeIndex =
    Math.min(
      index,
      Math.max(
        0,
        media.length - 1
      )
    );

  const current =
    media[safeIndex];

  const modal = (
    <div
      data-gallery-preview-overlay="true"
      className="fixed inset-0 z-[100000] isolate flex items-end justify-center bg-trap-ink/68 backdrop-blur-md sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        data-gallery-preview-dialog="true"
        role="dialog"
        aria-modal="true"
        aria-label="Gallery preview"
        className="relative z-10 flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-white shadow-[0_30px_100px_rgb(7_17_63_/_38%)] sm:h-[min(92dvh,860px)] sm:w-[min(96vw,1320px)] sm:rounded-[1.75rem]"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-trap-blue/10 bg-white px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-trap-orange">
              Gallery preview
            </p>

            <h2 className="mt-1 truncate text-lg font-extrabold text-trap-blue sm:text-xl">
              {item.title}
            </h2>
          </div>

          <button
            type="button"
            className="admin-icon-button shrink-0"
            onClick={onClose}
            aria-label="Close gallery preview"
          >
            <X size={18} />
          </button>
        </header>

        <div className="admin-scrollbar grid min-h-0 flex-1 grid-rows-[minmax(20rem,58dvh)_auto] overflow-y-auto bg-[#111] lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1 lg:overflow-hidden">
          <div
            data-gallery-preview-media="true"
            className="relative grid min-h-0 place-items-center overflow-hidden bg-[#111] p-3 sm:p-5"
          >
            {current ? (
              getResourceType(current) === "video" ? (
                <video
                  key={current.url}
                  src={current.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full max-h-full w-full max-w-full object-contain"
                />
              ) : (
                <img
                  key={current.url}
                  src={current.url}
                  alt={
                    current.alt ||
                    item.title
                  }
                  className="h-full max-h-full w-full max-w-full object-contain"
                />
              )
            ) : (
              <ImagePlus
                size={42}
                className="text-white/45"
              />
            )}

            {media.length > 1 && (
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-[9px] font-extrabold text-white">
                {safeIndex + 1} / {media.length}
              </span>
            )}
          </div>

          <aside className="admin-scrollbar min-h-0 overflow-y-auto bg-white p-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              <span className="admin-badge bg-[#eef1ff] text-trap-blue">
                {CATEGORIES.find(
                  (category) =>
                    category.value ===
                    item.category
                )?.label || "Other"}
              </span>

              <span
                className={[
                  "admin-badge",
                  item.isActive !== false
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {item.isActive !== false
                  ? "Visible"
                  : "Hidden"}
              </span>

              {item.isFeatured && (
                <span className="admin-badge bg-[#fff9d7] text-trap-blue">
                  <Sparkles size={11} />
                  Featured
                </span>
              )}
            </div>

            <h3 className="mt-5 text-2xl font-extrabold leading-tight text-trap-blue text-balance">
              {item.title}
            </h3>

            <p className="mt-4 whitespace-pre-wrap text-sm font-medium leading-7 text-trap-ink/58">
              {item.description ||
                "No description added."}
            </p>

            <div className="mt-6 border-t border-trap-blue/10 pt-5">
              <div className="flex items-center justify-between gap-3">
                <p className="admin-label">
                  Media
                </p>

                <span className="text-[9px] font-extrabold text-trap-blue/45">
                  {media.length}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-4 gap-2 lg:grid-cols-3">
                {media.map(
                  (
                    entry,
                    mediaIndex
                  ) => (
                    <button
                      key={`${entry.url}-${mediaIndex}`}
                      type="button"
                      onClick={() =>
                        setIndex(
                          mediaIndex
                        )
                      }
                      className={[
                        "aspect-square overflow-hidden rounded-xl border-2 bg-[#eef1ff] transition",
                        mediaIndex ===
                        safeIndex
                          ? "border-trap-blue shadow-[0_8px_20px_rgb(1_30_160_/_15%)]"
                          : "border-transparent opacity-65 hover:opacity-100",
                      ].join(" ")}
                    >
                      {getResourceType(
                        entry
                      ) === "video" ? (
                        <span className="grid h-full place-items-center text-trap-blue">
                          <Video size={18} />
                        </span>
                      ) : (
                        <img
                          src={entry.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                  )
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );

  return createPortal(
    modal,
    document.body
  );
}

function extractGalleryList(
  response
) {
  if (
    Array.isArray(response)
  ) {
    return response.filter(
      Boolean
    );
  }

  const direct = [
    response?.gallery,
    response?.items,
    response?.galleryItems,
    response?.results,
  ];

  for (
    const candidate of
    direct
  ) {
    if (
      Array.isArray(candidate)
    ) {
      return candidate.filter(
        Boolean
      );
    }
  }

  if (
    response?.data &&
    response.data !==
      response
  ) {
    return extractGalleryList(
      response.data
    );
  }

  return [];
}

function normalizeGalleryMedia(item) {
  if (Array.isArray(item?.media) && item.media.length > 0) {
    return [...item.media]
      .filter((media) => media?.url)
      .sort(
        (a, b) =>
          Number(a.sortOrder || 999) -
          Number(b.sortOrder || 999)
      );
  }

  if (item?.imageUrl) {
    return [
      {
        url: item.imageUrl,
        resourceType: "image",
        alt: item.title || "",
        objectPosition: "center center",
        sortOrder: 1,
      },
    ];
  }

  return [];
}

function getResourceType(media) {
  const explicit = String(
    media?.resourceType ||
      media?.type ||
      ""
  ).toLowerCase();

  if (explicit === "video") {
    return "video";
  }

  const url = String(
    media?.url ||
      media?.previewUrl ||
      ""
  )
    .toLowerCase()
    .split("?")[0];

  return /\.(mp4|webm|mov|m4v|ogg)$/.test(url)
    ? "video"
    : "image";
}

function cleanMediaPayload(media, index) {
  return {
    url: media.url || "",
    publicId: media.publicId || "",
    resourceType: getResourceType(media),
    format: media.format || "",
    width: Number(media.width || 0),
    height: Number(media.height || 0),
    bytes: Number(media.bytes || 0),
    originalName:
      media.originalName ||
      `Gallery media ${index + 1}`,
    alt: String(media.alt || "").trim(),
    objectPosition:
      media.objectPosition || "center center",
    sortOrder: index + 1,
  };
}

function revokeDraftPreviews(drafts) {
  drafts.forEach((draft) => {
    if (draft.previewUrl) {
      URL.revokeObjectURL(draft.previewUrl);
    }
  });
}

function cleanFilename(filename) {
  return String(filename || "")
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    ) || "TRAP Room gallery";
}

function sortGallery(a, b) {
  const orderA = Number(a.sortOrder || 999);
  const orderB = Number(b.sortOrder || 999);

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return (
    new Date(b.createdAt || 0) -
    new Date(a.createdAt || 0)
  );
}
