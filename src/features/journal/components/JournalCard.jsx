import {
  ArrowUpRight,
  Pin,
} from "lucide-react";
import {
  Link,
} from "react-router-dom";
import JournalMedia from "./JournalMedia.jsx";
import {
  formatJournalDate,
  getJournalExcerpt,
  getJournalId,
} from "../utils/journal.js";

export default function JournalCard({
  post,
  index = 0,
  featured = false,
  language = "en",
}) {
  const id =
    getJournalId(post);

  return (
    <Link
      to={`/posts/${encodeURIComponent(id)}`}
      className={[
        "group overflow-hidden rounded-[1.5rem] border border-trap-blue/10 bg-white shadow-[0_18px_60px_rgba(1,30,160,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_75px_rgba(1,30,160,0.12)] sm:rounded-[2rem]",
        featured
          ? "grid lg:grid-cols-[1.15fr_.85fr]"
          : "flex h-full flex-col",
      ].join(" ")}
    >
      <JournalMedia
        post={post}
        priority={
          featured ||
          index === 0
        }
        className={
          featured
            ? "h-[52svh] min-h-[320px] max-h-[620px] lg:h-full lg:max-h-none"
            : "aspect-[4/3] w-full sm:aspect-[16/11]"
        }
      />

      <div
        className={[
          "flex min-w-0 flex-1 flex-col p-5 sm:p-6",
          featured
            ? "justify-center lg:p-9 xl:p-12"
            : "",
        ].join(" ")}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-trap-orange">
            {language === "vi"
              ? "Nhật ký"
              : "TRAP journal"}
          </p>

          {post?.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff9d7] px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-trap-blue">
              <Pin size={11} />
              {language === "vi"
                ? "Đã ghim"
                : "Pinned"}
            </span>
          )}
        </div>

        <h3
          className={[
            "mt-3 font-extrabold leading-[1.02] tracking-[-0.035em] text-trap-blue text-balance",
            featured
              ? "text-[clamp(2.5rem,5vw,5.3rem)]"
              : "text-[clamp(1.55rem,2.4vw,2.15rem)]",
          ].join(" ")}
        >
          {post?.title ||
            "TRAP Room journal"}
        </h3>

        <p
          className={[
            "mt-4 font-medium text-trap-ink/58",
            featured
              ? "text-base leading-7 sm:text-lg sm:leading-8"
              : "text-sm leading-6 line-clamp-3",
          ].join(" ")}
        >
          {getJournalExcerpt(
            post,
            featured ? 260 : 150
          )}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-trap-ink/40">
            {formatJournalDate(
              post,
              language
            )}
          </span>

          <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#eef1ff] px-4 text-[9px] font-extrabold uppercase tracking-[0.13em] text-trap-blue transition group-hover:bg-trap-blue group-hover:text-trap-yellow">
            {language === "vi"
              ? "Đọc bài"
              : "Read story"}
            <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
