import {
  ArrowLeft,
  Pin,
} from "lucide-react";
import {
  Link,
  useOutletContext,
  useParams,
} from "react-router-dom";
import EmptyState from "../components/ui/EmptyState.jsx";
import JournalCard from "../features/journal/components/JournalCard.jsx";
import {
  JournalMediaGallery,
} from "../features/journal/components/JournalMedia.jsx";
import {
  formatJournalDate,
  getJournalExcerpt,
  getJournalId,
  sortJournalPosts,
  splitJournalContent,
} from "../features/journal/utils/journal.js";

export default function PostDetailPage() {
  const { id } = useParams();
  const { store } =
    useOutletContext();

  const posts =
    sortJournalPosts(
      store?.posts || []
    );

  const post = posts.find(
    (item) =>
      getJournalId(item) ===
      String(id || "")
  );

  if (!post) {
    return (
      <main className="client-page min-h-[70svh] bg-white">
        <section className="client-section">
          <div className="client-shell">
            <EmptyState
              title="Journal story not found."
              description="The story may be hidden, removed or still loading."
            />

            <div className="mt-6 text-center">
              <Link
                to="/posts"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-trap-blue px-6 text-[10px] font-extrabold uppercase tracking-[0.12em] text-trap-yellow"
              >
                <ArrowLeft size={15} />
                Back to journal
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const paragraphs =
    splitJournalContent(
      post.content
    );

  const related = posts
    .filter(
      (item) =>
        getJournalId(item) !==
        getJournalId(post)
    )
    .slice(0, 3);

  return (
    <main className="client-page overflow-x-hidden bg-white">
      <article>
        <header className="relative overflow-hidden border-b border-trap-blue/10 bg-[#fff9d7]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-trap-yellow/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-trap-blue/10 blur-3xl" />

          <div className="client-shell relative py-10 sm:py-14 lg:py-18">
            <Link
              to="/posts"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-trap-blue/15 bg-white/70 px-4 text-[9px] font-extrabold uppercase tracking-[0.13em] text-trap-blue backdrop-blur"
            >
              <ArrowLeft size={15} />
              Back to journal
            </Link>

            <div className="mt-8 max-w-5xl sm:mt-10">
              <div className="flex flex-wrap items-center gap-3">
                <p className="client-eyebrow">
                  TRAP journal
                </p>

                {post.isPinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.1em] text-trap-blue">
                    <Pin size={11} />
                    Pinned story
                  </span>
                )}
              </div>

              <h1 className="mt-5 max-w-6xl font-display text-[clamp(3.25rem,9vw,7.8rem)] lowercase leading-[0.84] tracking-[-0.08em] text-trap-blue text-balance">
                {post.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] font-extrabold uppercase tracking-[0.12em] text-trap-ink/45">
                <span>
                  {formatJournalDate(
                    post
                  )}
                </span>
                <span>TRAP Room</span>
              </div>

              {getJournalExcerpt(
                post,
                300
              ) && (
                <p className="mt-7 max-w-3xl text-base font-semibold leading-7 text-trap-ink/60 sm:text-xl sm:leading-8">
                  {getJournalExcerpt(
                    post,
                    300
                  )}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className="client-shell py-7 sm:py-10 lg:py-16">
          <JournalMediaGallery
            post={post}
          />

          <div className="mx-auto mt-10 max-w-3xl sm:mt-14">
            {paragraphs.length > 0 ? (
              <div className="grid gap-6 sm:gap-7">
                {paragraphs.map(
                  (paragraph, index) => (
                    <p
                      key={index}
                      className={[
                        "whitespace-pre-line font-medium text-trap-ink/76",
                        index === 0
                          ? "text-lg leading-8 sm:text-xl sm:leading-9"
                          : "text-base leading-8 sm:text-lg sm:leading-9",
                      ].join(" ")}
                    >
                      {paragraph}
                    </p>
                  )
                )}
              </div>
            ) : (
              <p className="text-base font-medium leading-8 text-trap-ink/55">
                This journal story does not have article content yet.
              </p>
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="client-section border-t border-trap-blue/10 bg-[#eef1ff]">
          <div className="client-shell">
            <p className="client-eyebrow">
              Keep reading
            </p>

            <h2 className="mt-4 max-w-4xl font-display text-[clamp(3rem,7vw,6rem)] lowercase leading-[0.85] tracking-[-0.075em] text-trap-blue">
              more from the room.
            </h2>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {related.map(
                (item, index) => (
                  <JournalCard
                    key={
                      item._id ||
                      item.id ||
                      index
                    }
                    post={item}
                    index={index}
                  />
                )
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
