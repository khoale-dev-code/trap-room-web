import {
  getJournalDate,
  getJournalMedia,
  getJournalId,
  isJournalVideo,
  sortJournalPosts,
} from "../../../../features/journal/utils/journal.js";

export function createEmptyJournalForm(
  nextOrder = 1
) {
  return {
    title: "",
    excerpt: "",
    content: "",
    sortOrder: nextOrder,
    isPinned: false,
    isPublished: true,
  };
}

export function postToJournalForm(
  post
) {
  return {
    title: post?.title || "",
    excerpt:
      post?.excerpt || "",
    content:
      post?.content || "",
    sortOrder: Math.max(
      1,
      Number(
        post?.sortOrder || 1
      )
    ),
    isPinned:
      post?.isPinned === true,
    isPublished:
      post?.isPublished !== false,
  };
}

export function normalizeJournalCollection(
  payload
) {
  if (Array.isArray(payload)) {
    return payload;
  }

  const candidates = [
    payload?.posts,
    payload?.journalPosts,
    payload?.items,
    payload?.data?.items,
    payload?.data?.posts,
    payload?.data,
  ];

  return (
    candidates.find(
      Array.isArray
    ) || []
  );
}

export function normalizeJournalEntity(
  payload
) {
  if (
    payload?._id ||
    payload?.id
  ) {
    return payload;
  }

  return (
    payload?.post ||
    payload?.journalPost ||
    payload?.item ||
    payload?.data?.item ||
    payload?.data?.post ||
    null
  );
}

export function getNextJournalOrder(
  posts
) {
  const orders = (
    Array.isArray(posts)
      ? posts
      : []
  )
    .map((post) =>
      Number(post?.sortOrder)
    )
    .filter(Number.isFinite);

  return orders.length
    ? Math.max(...orders) + 1
    : 1;
}

export function buildJournalPayload(
  form,
  media
) {
  const title = String(
    form?.title || ""
  ).trim();

  const content = String(
    form?.content || ""
  ).trim();

  const explicitExcerpt =
    String(
      form?.excerpt || ""
    ).trim();

  const normalizedMedia = (
    Array.isArray(media)
      ? media
      : []
  )
    .filter(
      (item) => item?.url
    )
    .map((item, index) => ({
      ...item,
      resourceType:
        isJournalVideo(item)
          ? "video"
          : "image",
      sortOrder: index + 1,
    }));

  const firstImage =
    normalizedMedia.find(
      (item) =>
        !isJournalVideo(item)
    );

  return {
    title,
    content,
    excerpt:
      explicitExcerpt ||
      content
        .replace(/\s+/g, " ")
        .slice(0, 220),
    sortOrder: Math.max(
      1,
      Number(
        form?.sortOrder || 1
      )
    ),
    isPinned:
      Boolean(form?.isPinned),
    isPublished:
      Boolean(
        form?.isPublished
      ),
    // Compatibility flag used by older Admin/public filters.
    isActive:
      Boolean(
        form?.isPublished
      ),
    media: normalizedMedia,
    imageUrl:
      firstImage?.url || "",
  };
}

export function filterJournalPosts(
  posts,
  query,
  filter
) {
  const keyword = String(
    query || ""
  )
    .trim()
    .toLowerCase();

  return sortJournalPosts(posts)
    .filter((post) => {
      if (
        filter === "published" &&
        post?.isPublished === false
      ) {
        return false;
      }

      if (
        filter === "draft" &&
        post?.isPublished !== false
      ) {
        return false;
      }

      if (
        filter === "pinned" &&
        post?.isPinned !== true
      ) {
        return false;
      }

      if (
        filter === "media" &&
        getJournalMedia(post).length === 0
      ) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        post?.title,
        post?.excerpt,
        post?.content,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
}

export function replaceJournalPost(
  posts,
  nextPost
) {
  const nextId =
    getJournalId(nextPost);

  return sortJournalPosts(
    posts.map((post) =>
      getJournalId(post) ===
      nextId
        ? nextPost
        : post
    )
  );
}

export function formatAdminJournalDate(
  post
) {
  const date =
    getJournalDate(post);

  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

export function getAdminJournalId(
  post
) {
  return getJournalId(post);
}
