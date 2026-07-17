
import {
  useEffect,
  useMemo,
} from "react";

export function useFilePreviews(files) {
  const previews = useMemo(
    () =>
      files.map((file, index) => ({
        file,
        url: URL.createObjectURL(file),
        resourceType: file.type.startsWith("video/")
          ? "video"
          : "image",
        key: `${file.name}-${file.size}-${file.lastModified}-${index}`,
      })),
    [files]
  );

  useEffect(() => {
    return () => {
      previews.forEach((item) => {
        URL.revokeObjectURL(item.url);
      });
    };
  }, [previews]);

  return previews;
}
