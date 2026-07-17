const VIDEO_EXTENSIONS =
  /\.(mp4|webm|mov|m4v|ogg)(?:$|\?)/i;

export function getJournalId(post) {
  return String(
    post?._id ||
    post?.id ||
    post?.slug ||
    ""
  );
}

export function isJournalVideo(media) {
  const type = String(
    media?.resourceType ||
    media?.type ||
    ""
  ).toLowerCase();

  const url = String(
    media?.url ||
    media?.secureUrl ||
    media?.secure_url ||
    ""
  );

  return (
    type === "video" ||
    VIDEO_EXTENSIONS.test(url)
  );
}

export function getJournalMedia(post) {
  const media = Array.isArray(post?.media)
    ? post.media
        .map((item, index) => ({
          ...item,
          url:
            item?.url ||
            item?.secureUrl ||
            item?.secure_url ||
            "",
          sortOrder: Number(
            item?.sortOrder ||
            item?.order ||
            index + 1
          ),
        }))
        .filter((item) => item.url)
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder
        )
    : [];

  if (media.length > 0) {
    return media;
  }

  if (post?.imageUrl) {
    return [
      {
        url: post.imageUrl,
        resourceType: "image",
        sortOrder: 1,
        alt: post.title || "",
      },
    ];
  }

  return [];
}

export function getJournalCover(post) {
  const media = getJournalMedia(post);

  return (
    media.find(
      (item) =>
        !isJournalVideo(item)
    ) ||
    media[0] ||
    null
  );
}

export function getJournalExcerpt(
  post,
  limit = 180
) {
  const explicit = String(
    post?.excerpt || ""
  ).trim();

  const content = String(
    post?.content || ""
  )
    .replace(/\s+/g, " ")
    .trim();

  const value =
    explicit || content;

  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit).trim()}…`;
}

export function getJournalDate(post) {
  const value =
    post?.publishedAt ||
    post?.updatedAt ||
    post?.createdAt ||
    "";

  const date = new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

export function formatJournalDate(
  post,
  language = "en"
) {
  const date =
    getJournalDate(post);

  if (!date) {
    return language === "vi"
      ? "Chưa có ngày"
      : "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    language === "vi"
      ? "vi-VN"
      : "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

export function sortJournalPosts(
  posts
) {
  return [
    ...(Array.isArray(posts)
      ? posts
      : []),
  ].sort((a, b) => {
    const pinnedDifference =
      Number(Boolean(b?.isPinned)) -
      Number(Boolean(a?.isPinned));

    if (pinnedDifference) {
      return pinnedDifference;
    }

    const orderDifference =
      Number(a?.sortOrder || 999) -
      Number(b?.sortOrder || 999);

    if (orderDifference) {
      return orderDifference;
    }

    return (
      Number(
        getJournalDate(b)?.getTime() ||
        0
      ) -
      Number(
        getJournalDate(a)?.getTime() ||
        0
      )
    );
  });
}

export function searchJournalPosts(
  posts,
  query
) {
  const keyword = String(
    query || ""
  )
    .trim()
    .toLowerCase();

  if (!keyword) {
    return posts;
  }

  return posts.filter((post) =>
    [
      post?.title,
      post?.excerpt,
      post?.content,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(keyword)
  );
}

export function splitJournalContent(
  content
) {
  return String(content || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) =>
      paragraph.trim()
    )
    .filter(Boolean);
}
