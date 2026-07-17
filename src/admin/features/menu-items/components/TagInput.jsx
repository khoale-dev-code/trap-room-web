
import {
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";

export default function TagInput({
  value,
  suggestions,
  placeholder,
  help,
  existingLabel,
  onChange,
}) {
  const [draft, setDraft] = useState("");
  const tags = Array.isArray(value) ? value : [];

  const available = suggestions.filter(
    (suggestion) =>
      !tags.some(
        (tag) =>
          tag.toLowerCase() === suggestion.toLowerCase()
      ) &&
      (!draft.trim() ||
        suggestion
          .toLowerCase()
          .includes(draft.trim().toLowerCase()))
  );

  function addTag(rawValue) {
    const tag = String(rawValue || "")
      .replace(/^#+/, "")
      .trim()
      .replace(/\s+/g, " ");

    if (!tag) return;

    if (
      tags.some(
        (current) =>
          current.toLowerCase() === tag.toLowerCase()
      )
    ) {
      setDraft("");
      return;
    }

    onChange([...tags, tag]);
    setDraft("");
  }

  function removeTag(tag) {
    onChange(tags.filter((current) => current !== tag));
  }

  return (
    <div className="admin-card-flat p-3">
      <div className="flex min-h-[50px] flex-wrap items-center gap-2 rounded-xl border border-trap-blue/12 bg-white p-2 focus-within:border-trap-blue focus-within:ring-4 focus-within:ring-trap-blue/8">
        {tags.map((tagValue) => (
          <span
            key={tagValue}
            className="inline-flex min-h-8 items-center gap-2 rounded-full bg-trap-blue px-3 text-[9px] font-extrabold text-trap-yellow"
          >
            #{tagValue}

            <button
              type="button"
              onClick={() => removeTag(tagValue)}
              className="grid h-5 w-5 place-items-center rounded-full bg-white/15"
              aria-label={`Remove ${tagValue}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        <input
          className="min-h-9 min-w-[150px] flex-1 border-0 bg-transparent px-2 text-base font-semibold text-trap-ink outline-none sm:text-sm"
          value={draft}
          placeholder={placeholder}
          onChange={(event) => {
            const next = event.target.value;

            if (next.includes(",")) {
              next.split(",").forEach(addTag);
            } else {
              setDraft(next);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addTag(draft);
            }

            if (
              event.key === "Backspace" &&
              !draft &&
              tags.length > 0
            ) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          onBlur={() => {
            if (draft.trim()) addTag(draft);
          }}
        />
      </div>

      <p className="mt-2 text-xs font-medium leading-5 text-trap-ink/42">
        {help}
      </p>

      {available.length > 0 && (
        <div className="mt-4">
          <p className="admin-label">{existingLabel}</p>

          <div className="flex flex-wrap gap-2">
            {available.slice(0, 16).map((tagValue) => (
              <button
                key={tagValue}
                type="button"
                onClick={() => addTag(tagValue)}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-trap-blue/12 bg-[#eef1ff] px-3 text-[8px] font-extrabold uppercase tracking-[0.08em] text-trap-blue transition hover:border-trap-blue"
              >
                <Plus size={12} />
                {tagValue}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
