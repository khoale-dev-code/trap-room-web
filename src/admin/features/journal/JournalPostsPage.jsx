import {
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import AdminConfirmDialog from "../../components/AdminConfirmDialog.jsx";
import AdminPageHeader from "../../components/AdminPageHeader.jsx";
import {
  useToast,
} from "../../../components/ui/ToastProvider.jsx";
import JournalPostEditor from "./components/JournalPostEditor.jsx";
import JournalPostList from "./components/JournalPostList.jsx";
import useJournalPosts from "./hooks/useJournalPosts.js";
import {
  createEmptyJournalForm,
  filterJournalPosts,
  getAdminJournalId,
  getNextJournalOrder,
  postToJournalForm,
} from "./utils/journalAdmin.js";
import {
  getJournalMedia,
} from "../../../features/journal/utils/journal.js";

const FILTERS = [
  ["all", "All posts"],
  ["published", "Published"],
  ["draft", "Hidden"],
  ["pinned", "Pinned"],
  ["media", "With media"],
];

export default function JournalPostsPage({
  refreshToken,
}) {
  const data =
    useJournalPosts(
      refreshToken
    );

  const toast = useToast();

  const [query, setQuery] =
    useState("");
  const [filter, setFilter] =
    useState("all");
  const [editorOpen, setEditorOpen] =
    useState(false);
  const [editingId, setEditingId] =
    useState("");
  const [form, setForm] =
    useState(() =>
      createEmptyJournalForm(1)
    );
  const [
    existingMedia,
    setExistingMedia,
  ] = useState([]);
  const [files, setFiles] =
    useState([]);
  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const filePreviews = useMemo(
    () =>
      files.map(
        (file, index) => ({
          file,
          url:
            URL.createObjectURL(
              file
            ),
          key: `file-${index}-${file.name}-${file.lastModified}`,
          originalName:
            file.name,
          resourceType:
            file.type.startsWith(
              "video/"
            )
              ? "video"
              : "image",
        })
      ),
    [files]
  );

  useEffect(
    () => () => {
      filePreviews.forEach(
        (item) =>
          URL.revokeObjectURL(
            item.url
          )
      );
    },
    [filePreviews]
  );

  const filteredPosts =
    useMemo(
      () =>
        filterJournalPosts(
          data.posts,
          query,
          filter
        ),
      [
        data.posts,
        query,
        filter,
      ]
    );

  function resetEditor() {
    setEditingId("");
    setForm(
      createEmptyJournalForm(
        getNextJournalOrder(
          data.posts
        )
      )
    );
    setExistingMedia([]);
    setFiles([]);
    setEditorOpen(false);
  }

  function createPost() {
    setEditingId("");
    setForm(
      createEmptyJournalForm(
        getNextJournalOrder(
          data.posts
        )
      )
    );
    setExistingMedia([]);
    setFiles([]);
    setEditorOpen(true);
  }

  function editPost(post) {
    setEditingId(
      getAdminJournalId(
        post
      )
    );
    setForm(
      postToJournalForm(
        post
      )
    );
    setExistingMedia(
      getJournalMedia(post)
    );
    setFiles([]);
    setEditorOpen(true);
  }

  function updateForm(
    name,
    value
  ) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function moveMedia(
    index,
    direction
  ) {
    const combined = [
      ...existingMedia.map(
        (item) => ({
          ...item,
          source: "existing",
        })
      ),
      ...files.map(
        (file) => ({
          file,
          source: "file",
        })
      ),
    ];

    const nextIndex =
      index + direction;

    if (
      nextIndex < 0 ||
      nextIndex >=
        combined.length
    ) {
      return;
    }

    [
      combined[index],
      combined[nextIndex],
    ] = [
      combined[nextIndex],
      combined[index],
    ];

    setExistingMedia(
      combined
        .filter(
          (item) =>
            item.source ===
            "existing"
        )
        .map(
          ({
            source,
            ...item
          }) => item
        )
    );

    setFiles(
      combined
        .filter(
          (item) =>
            item.source ===
            "file"
        )
        .map(
          (item) =>
            item.file
        )
    );
  }

  async function submit(
    event
  ) {
    event.preventDefault();

    try {
      await data.save({
        editingId,
        form,
        existingMedia,
        files,
      });

      toast.show(
        editingId
          ? "Journal post updated."
          : "Journal post created."
      );

      resetEditor();
    } catch (error) {
      toast.show(
        error.message,
        "error"
      );
    }
  }

  async function togglePublished(
    post
  ) {
    try {
      const nextValue =
        post.isPublished ===
        false;

      await data.patchPost(
        post,
        {
          isPublished:
            nextValue,
        }
      );

      toast.show(
        nextValue
          ? "Post published."
          : "Post hidden from the client."
      );
    } catch (error) {
      toast.show(
        error.message,
        "error"
      );
    }
  }

  async function togglePinned(
    post
  ) {
    try {
      await data.patchPost(
        post,
        {
          isPinned:
            !post.isPinned,
        }
      );

      toast.show(
        post.isPinned
          ? "Post unpinned."
          : "Post pinned."
      );
    } catch (error) {
      toast.show(
        error.message,
        "error"
      );
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await data.remove(
        deleteTarget
      );

      if (
        editingId ===
        getAdminJournalId(
          deleteTarget
        )
      ) {
        resetEditor();
      }

      setDeleteTarget(null);
      toast.show(
        "Journal post deleted."
      );
    } catch (error) {
      toast.show(
        error.message,
        "error"
      );
    }
  }

  return (
    <div data-admin-responsive-page="JournalPostsManager">
      <AdminPageHeader
        eyebrow="Publishing"
        title="journal posts."
        description="Write, organize and publish complete stories for the TRAP Room client."
        actions={
          <button
            type="button"
            className="admin-button-primary"
            onClick={createPost}
          >
            <Plus size={16} />
            New post
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_480px] xl:items-start">
        <section className="min-w-0">
          <div className="admin-card p-4 sm:p-5">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-trap-blue/45"
              />

              <input
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
                placeholder="Search title, excerpt or article content..."
                className="admin-input min-h-12 pl-11 pr-11"
              />

              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() =>
                    setQuery("")
                  }
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-trap-blue hover:bg-[#eef1ff]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1">
              {FILTERS.map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={
                      filter === value
                    }
                    onClick={() =>
                      setFilter(
                        value
                      )
                    }
                    className={[
                      "min-h-10 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.08em] transition",
                      filter === value
                        ? "border-trap-blue bg-trap-blue text-trap-yellow"
                        : "border-trap-blue/12 bg-white text-trap-blue hover:bg-[#eef1ff]",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-trap-blue/10 pt-4">
              <p className="text-xs font-semibold text-trap-ink/45">
                Showing{" "}
                {filteredPosts.length}{" "}
                of{" "}
                {data.posts.length}{" "}
                posts
              </p>

              <button
                type="button"
                onClick={() =>
                  data.load()
                }
                className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-trap-blue"
              >
                Reload posts
              </button>
            </div>
          </div>

          <div className="mt-5">
            <JournalPostList
              posts={
                filteredPosts
              }
              loading={
                data.loading
              }
              onCreate={
                createPost
              }
              onEdit={
                editPost
              }
              onDelete={
                setDeleteTarget
              }
              onTogglePublished={
                togglePublished
              }
              onTogglePinned={
                togglePinned
              }
            />
          </div>
        </section>

        <JournalPostEditor
          open={editorOpen}
          editingId={
            editingId
          }
          form={form}
          existingMedia={
            existingMedia
          }
          filePreviews={
            filePreviews
          }
          saving={
            data.saving
          }
          onChange={
            updateForm
          }
          onFilesChange={(
            nextFiles
          ) =>
            setFiles(
              (current) => [
                ...current,
                ...nextFiles,
              ]
            )
          }
          onRemoveExisting={(
            index
          ) =>
            setExistingMedia(
              (current) =>
                current.filter(
                  (_, itemIndex) =>
                    itemIndex !==
                    index
                )
            )
          }
          onRemoveFile={(
            index
          ) =>
            setFiles(
              (current) =>
                current.filter(
                  (_, itemIndex) =>
                    itemIndex !==
                    index
                )
            )
          }
          onMoveMedia={
            moveMedia
          }
          onClose={
            resetEditor
          }
          onSubmit={submit}
          onCreate={
            createPost
          }
        />
      </div>

      <AdminConfirmDialog
        open={Boolean(
          deleteTarget
        )}
        title="Delete journal post?"
        description={`Delete "${
          deleteTarget?.title ||
          "this story"
        }"? This action cannot be undone.`}
        confirmLabel="Delete post"
        busy={
          data.deleting
        }
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
