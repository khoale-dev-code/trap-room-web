
import {
  UploadCloud,
  X,
} from "lucide-react";
import { getResourceType } from "../utils/resource.js";

export default function MediaEditor({
  copy,
  existingMedia,
  setExistingMedia,
  files,
  setFiles,
  previews,
}) {
  return (
    <section className="mt-6 border-t border-trap-blue/10 pt-6">
      <span className="admin-label">
        {copy.imagesAndVideo}
      </span>

      <p className="mb-4 text-xs font-medium leading-5 text-trap-ink/42">
        {copy.mediaHelp}
      </p>

      <label className="grid min-h-32 cursor-pointer place-items-center rounded-2xl border border-dashed border-trap-blue/25 bg-[#f8f9fd] p-5 text-center transition hover:border-trap-blue hover:bg-[#eef1ff]">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-trap-blue shadow-sm">
          <UploadCloud size={20} />
        </span>

        <span className="mt-3 text-[9px] font-extrabold uppercase tracking-[0.12em] text-trap-blue">
          {files.length
            ? copy.selectedFiles(files.length)
            : copy.selectMedia}
        </span>

        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(event) => {
            setFiles((current) => [
              ...current,
              ...Array.from(event.target.files || []),
            ]);
            event.target.value = "";
          }}
        />
      </label>

      {(existingMedia.length > 0 || previews.length > 0) && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {existingMedia.map((item, index) => (
            <MediaTile
              key={`${item.url}-${index}`}
              item={item}
              label={copy.savedMedia}
              onRemove={() =>
                setExistingMedia((current) =>
                  current.filter(
                    (_, mediaIndex) => mediaIndex !== index
                  )
                )
              }
            />
          ))}

          {previews.map((item, index) => (
            <MediaTile
              key={item.key}
              item={item}
              label={copy.newMedia}
              onRemove={() =>
                setFiles((current) =>
                  current.filter(
                    (_, fileIndex) => fileIndex !== index
                  )
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MediaTile({
  item,
  label,
  onRemove,
}) {
  return (
    <article className="relative aspect-square overflow-hidden rounded-xl bg-[#eef1ff]">
      {getResourceType(item) === "video" ? (
        <video
          src={item.url}
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={item.url}
          alt=""
          className="h-full w-full object-cover"
        />
      )}

      <span className="absolute left-2 top-2 admin-badge bg-white/90 text-trap-blue">
        {label}
      </span>

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white shadow"
        aria-label="Remove media"
      >
        <X size={15} />
      </button>
    </article>
  );
}
