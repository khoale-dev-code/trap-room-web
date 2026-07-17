import {
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Pin,
  PinOff,
  Trash2,
  Video,
} from "lucide-react";
import AdminEmptyState from "../../../components/AdminEmptyState.jsx";
import {
  getJournalExcerpt,
  getJournalMedia,
  isJournalVideo,
} from "../../../../features/journal/utils/journal.js";
import {
  formatAdminJournalDate,
  getAdminJournalId,
} from "../utils/journalAdmin.js";

export default function JournalPostList({
  posts,
  loading,
  onCreate,
  onEdit,
  onDelete,
  onTogglePublished,
  onTogglePinned,
}) {
  if (loading) {
    return (
      <div className="admin-card grid min-h-64 place-items-center">
        <p className="text-sm font-bold text-trap-blue/55">
          Loading journal posts...
        </p>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <AdminEmptyState
        icon={FileText}
        title="No matching journal posts"
        description="Create a new story or change the current search and filters."
        actionLabel="New post"
        onAction={onCreate}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => {
        const media =
          getJournalMedia(post);

        const cover =
          media[0];

        return (
          <article
            key={
              getAdminJournalId(
                post
              )
            }
            className="admin-card overflow-hidden"
          >
            <div className="grid min-w-0 sm:grid-cols-[170px_minmax(0,1fr)]">
              <div className="relative min-h-44 overflow-hidden bg-[#eef1ff]">
                {cover ? (
                  isJournalVideo(
                    cover
                  ) ? (
                    <>
                      <video
                        src={cover.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-trap-blue">
                        <Video size={15} />
                      </span>
                    </>
                  ) : (
                    <img
                      src={cover.url}
                      alt={
                        post.title || ""
                      }
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <div className="grid h-full min-h-44 place-items-center text-trap-blue/40">
                    <FileText size={38} />
                  </div>
                )}

                <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-trap-blue shadow-sm">
                  {media.length} media
                </span>
              </div>

              <div className="min-w-0 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "rounded-full px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.1em]",
                      post.isPublished === false
                        ? "bg-[#f1f3f8] text-trap-ink/55"
                        : "bg-emerald-100 text-emerald-700",
                    ].join(" ")}
                  >
                    {post.isPublished ===
                    false
                      ? "Hidden"
                      : "Published"}
                  </span>

                  {post.isPinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fff9d7] px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-trap-blue">
                      <Pin size={10} />
                      Pinned
                    </span>
                  )}

                  <span className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-trap-ink/35">
                    Order{" "}
                    {Number(
                      post.sortOrder ||
                      999
                    )}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-extrabold leading-tight text-trap-blue text-balance">
                  {post.title ||
                    "Untitled journal post"}
                </h3>

                <p className="mt-2 text-sm font-medium leading-6 text-trap-ink/55 line-clamp-2">
                  {getJournalExcerpt(
                    post,
                    170
                  ) ||
                    "No excerpt yet."}
                </p>

                <p className="mt-3 text-[8px] font-extrabold uppercase tracking-[0.11em] text-trap-ink/35">
                  {formatAdminJournalDate(
                    post
                  )}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="admin-button-secondary"
                    onClick={() =>
                      onEdit(post)
                    }
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="admin-button-secondary"
                    onClick={() =>
                      onTogglePublished(
                        post
                      )
                    }
                  >
                    {post.isPublished ===
                    false ? (
                      <Eye size={14} />
                    ) : (
                      <EyeOff size={14} />
                    )}
                    {post.isPublished ===
                    false
                      ? "Publish"
                      : "Hide"}
                  </button>

                  <button
                    type="button"
                    className="admin-button-secondary"
                    onClick={() =>
                      onTogglePinned(
                        post
                      )
                    }
                  >
                    {post.isPinned ? (
                      <PinOff size={14} />
                    ) : (
                      <Pin size={14} />
                    )}
                    {post.isPinned
                      ? "Unpin"
                      : "Pin"}
                  </button>

                  <button
                    type="button"
                    className="admin-button-danger"
                    onClick={() =>
                      onDelete(post)
                    }
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
