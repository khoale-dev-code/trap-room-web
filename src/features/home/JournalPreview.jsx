import JournalCard from "../journal/components/JournalCard.jsx";
import SectionHeader from "../../components/ui/SectionHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import {
  sortJournalPosts,
} from "../journal/utils/journal.js";

export default function JournalPreview({
  posts,
}) {
  const visiblePosts =
    sortJournalPosts(posts).slice(
      0,
      3
    );

  return (
    <section className="client-section bg-[#fff9d7]">
      <div className="client-shell">
        <SectionHeader
          eyebrow="From the room"
          title="news, drinks and small moments."
          description="The latest stories and updates from inside TRAP."
          link="/posts"
          linkLabel="Open the journal"
        />

        {visiblePosts.length > 0 ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map(
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
        ) : (
          <div className="mt-12">
            <EmptyState
              title="No journal posts yet."
              description="Published posts will appear here automatically."
            />
          </div>
        )}
      </div>
    </section>
  );
}
