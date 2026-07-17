import {
  api,
} from "../../../../lib/api.js";

export function listJournalPosts() {
  return api.posts.list();
}

export function createJournalPost(
  payload
) {
  return api.posts.create(
    payload
  );
}

export function updateJournalPost(
  id,
  payload
) {
  return api.posts.update(
    id,
    payload
  );
}

export function removeJournalPost(
  id
) {
  return api.posts.remove(id);
}

export async function uploadJournalMedia(
  files
) {
  if (!files.length) {
    return [];
  }

  let result;

  if (
    typeof api.upload ===
    "function"
  ) {
    result = await api.upload(
      files
    );
  } else if (
    typeof api.uploadMedia ===
    "function"
  ) {
    result =
      await api.uploadMedia(
        files
      );
  } else {
    throw new Error(
      "Media upload API is unavailable."
    );
  }

  return (
    result?.media ||
    result?.files ||
    result?.data?.media ||
    result?.data ||
    []
  );
}
