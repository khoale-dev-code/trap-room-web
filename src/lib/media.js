
export function isVideoMedia(media) {
  const type = String(
    media?.resourceType || media?.type || ""
  ).toLowerCase();

  const url = String(media?.url || "").toLowerCase();

  return (
    type === "video" ||
    [".mp4", ".webm", ".mov", ".m4v"].some((extension) =>
      url.includes(extension)
    )
  );
}

export function getImage(item) {
  if (!item) return "";

  if (typeof item === "string") {
    return item;
  }

  if (item.url && !isVideoMedia(item)) {
    return item.url;
  }

  if (item.imageUrl) {
    return item.imageUrl;
  }

  const media = item.media?.find(
    (mediaItem) => mediaItem?.url && !isVideoMedia(mediaItem)
  );

  return media?.url || "";
}

export function getItemMedia(item) {
  if (!item) return [];

  if (Array.isArray(item.media) && item.media.length > 0) {
    return item.media.filter((media) => media?.url);
  }

  if (item.imageUrl) {
    return [
      {
        url: item.imageUrl,
        resourceType: "image",
        originalName: item.name || item.title || "",
      },
    ];
  }

  return [];
}

export function getGalleryMedia(gallery = []) {
  return gallery.flatMap((item) => {
    const media = getItemMedia(item);

    return media.map((mediaItem) => ({
      ...mediaItem,
      title: item.title,
      description: item.description,
      category: item.category,
    }));
  });
}
