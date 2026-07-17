import {
  Search,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import {
  useOutletContext,
} from "react-router-dom";
import EmptyState from "../components/ui/EmptyState.jsx";
import JournalCard from "../features/journal/components/JournalCard.jsx";
import {
  searchJournalPosts,
  sortJournalPosts,
} from "../features/journal/utils/journal.js";

export default function PostsPage() {
  const { store } =
    useOutletContext();

  const [query, setQuery] =
    useState("");

  const posts = useMemo(
    () =>
      sortJournalPosts(
        store?.posts || []
      ),
    [store?.posts]
  );

  const filteredPosts = useMemo(
    () =>
      searchJournalPosts(
        posts,
        query
      ),
    [posts, query]
  );

  const featuredPost =
    query
      ? null
      : filteredPosts[0] ||
        null;

  const listPosts =
    featuredPost
      ? filteredPosts.slice(1)
      : filteredPosts;

  return (
    <main className="client-page overflow-x-hidden bg-white">
      <header className="relative overflow-hidden border-b border-trap-blue/10 bg-[#fff9d7]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-trap-yellow/65 blur-3xl sm:h-96 sm:w-96" />
        <div className="pointer-events-none absolute -bottom-36 -left-28 h-80 w-80 rounded-full bg-trap-blue/10 blur-3xl" />

        <div className="client-shell relative py-12 sm:py-16 lg:py-20">
          <p className="client-eyebrow">
            TRAP journal
          </p>

          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
            <div>
              <h1 className="max-w-5xl font-display text-[clamp(3.7rem,10vw,8.5rem)] lowercase leading-[0.82] tracking-[-0.085em] text-trap-blue text-balance">
                stories from the room.
              </h1>

              <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-trap-ink/58 sm:text-lg sm:leading-8">
                New drinks, small moments and everything happening around TRAP.
              </p>
            </div>

            <label className="relative block w-full">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-trap-blue/45"
              />

              <input
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
                placeholder="Search stories..."
                className="min-h-14 w-full rounded-full border border-trap-blue/15 bg-white/92 pl-12 pr-12 text-sm font-semibold text-trap-ink shadow-sm outline-none backdrop-blur transition focus:border-trap-blue/45 focus:ring-4 focus:ring-trap-blue/5"
              />

              {query && (
                <button
                  type="button"
                  onClick={() =>
                    setQuery("")
                  }
                  aria-label="Clear journal search"
                  className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-trap-blue hover:bg-[#eef1ff]"
                >
                  <X size={16} />
                </button>
              )}
            </label>
          </div>
        </div>
      </header>

      <section className="client-section bg-white">
        <div className="client-shell">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-trap-blue/10 pb-6">
            <div>
              <p className="client-eyebrow">
                Latest stories
              </p>

              <p className="mt-2 text-sm font-semibold text-trap-ink/45">
                {filteredPosts.length} of{" "}
                {posts.length} stories
              </p>
            </div>

            {query && (
              <button
                type="button"
                onClick={() =>
                  setQuery("")
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-trap-blue/15 px-4 text-[9px] font-extrabold uppercase tracking-[0.11em] text-trap-blue"
              >
                <X size={14} />
                Clear search
              </button>
            )}
          </div>

          {featuredPost && (
            <div className="mt-8 sm:mt-10">
              <JournalCard
                post={featuredPost}
                featured
              />
            </div>
          )}

          {listPosts.length > 0 && (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {listPosts.map(
                (post, index) => (
                  <JournalCard
                    key={
                      post._id ||
                      post.id ||
                      index
                    }
                    post={post}
                    index={index}
                  />
                )
              )}
            </div>
          )}

          {filteredPosts.length === 0 && (
            <div className="mt-10">
              <EmptyState
                title={
                  posts.length
                    ? "No matching journal stories."
                    : "No journal posts yet."
                }
                description={
                  posts.length
                    ? "Try another search phrase."
                    : "Published posts will appear here automatically."
                }
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
