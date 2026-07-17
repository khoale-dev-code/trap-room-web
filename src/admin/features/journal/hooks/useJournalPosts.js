import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  createJournalPost,
  listJournalPosts,
  removeJournalPost,
  updateJournalPost,
  uploadJournalMedia,
} from "../services/journalApi.js";
import {
  buildJournalPayload,
  normalizeJournalCollection,
  normalizeJournalEntity,
  replaceJournalPost,
} from "../utils/journalAdmin.js";
import {
  sortJournalPosts,
} from "../../../../features/journal/utils/journal.js";

export default function useJournalPosts(
  refreshToken
) {
  const [posts, setPosts] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [deleting, setDeleting] =
    useState(false);

  const load = useCallback(
    async ({
      silent = false,
    } = {}) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        const payload =
          await listJournalPosts();

        const items =
          normalizeJournalCollection(
            payload
          );

        setPosts(
          sortJournalPosts(items)
        );

        return items;
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  async function save({
    editingId,
    form,
    existingMedia,
    files,
  }) {
    setSaving(true);

    try {
      const uploaded =
        await uploadJournalMedia(
          files
        );

      const media = [
        ...existingMedia,
        ...uploaded,
      ];

      const payload =
        buildJournalPayload(
          form,
          media
        );

      const response =
        editingId
          ? await updateJournalPost(
              editingId,
              payload
            )
          : await createJournalPost(
              payload
            );

      const saved =
        normalizeJournalEntity(
          response
        );

      if (saved) {
        setPosts((current) =>
          editingId
            ? replaceJournalPost(
                current,
                saved
              )
            : sortJournalPosts([
                saved,
                ...current,
              ])
        );
      } else {
        await load({
          silent: true,
        });
      }

      return saved;
    } finally {
      setSaving(false);
    }
  }

  async function patchPost(
    post,
    patch
  ) {
    const response =
      await updateJournalPost(
        post._id || post.id,
        patch
      );

    const saved =
      normalizeJournalEntity(
        response
      );

    if (saved) {
      setPosts((current) =>
        replaceJournalPost(
          current,
          saved
        )
      );
    } else {
      await load({
        silent: true,
      });
    }

    return saved;
  }

  async function remove(post) {
    setDeleting(true);

    try {
      await removeJournalPost(
        post._id || post.id
      );

      setPosts((current) =>
        current.filter(
          (item) =>
            String(
              item._id ||
              item.id
            ) !==
            String(
              post._id ||
              post.id
            )
        )
      );
    } finally {
      setDeleting(false);
    }
  }

  return {
    posts,
    loading,
    saving,
    deleting,
    load,
    save,
    patchPost,
    remove,
  };
}
