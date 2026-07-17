
import {
  Plus,
  Trash2,
} from "lucide-react";

export default function SizeEditor({
  value,
  copy,
  onChange,
}) {
  const sizes = Array.isArray(value) ? value : [];

  function addSize() {
    onChange([
      ...sizes,
      {
        name: "",
        price: 0,
        oldPrice: 0,
        isDefault: sizes.length === 0,
      },
    ]);
  }

  function update(index, key, nextValue) {
    onChange(
      sizes.map((size, sizeIndex) => {
        if (key === "isDefault" && nextValue) {
          return {
            ...size,
            isDefault: sizeIndex === index,
          };
        }

        return sizeIndex === index
          ? {
              ...size,
              [key]: nextValue,
            }
          : size;
      })
    );
  }

  function remove(index) {
    const next = sizes.filter(
      (_, sizeIndex) => sizeIndex !== index
    );

    if (
      next.length > 0 &&
      !next.some((size) => size.isDefault)
    ) {
      next[0] = {
        ...next[0],
        isDefault: true,
      };
    }

    onChange(next);
  }

  return (
    <div className="admin-card-flat p-3">
      <div className="grid gap-3">
        {sizes.map((size, index) => (
          <article
            key={size._id || index}
            className="rounded-xl bg-[#f8f9fd] p-3"
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_44px] sm:items-end">
              <label>
                <span className="admin-label">
                  {copy.sizeName}
                </span>

                <input
                  className="admin-input text-base sm:text-sm"
                  value={size.name || ""}
                  placeholder="Regular"
                  onChange={(event) =>
                    update(index, "name", event.target.value)
                  }
                />
              </label>

              <label>
                <span className="admin-label">
                  {copy.price}
                </span>

                <input
                  className="admin-input text-base sm:text-sm"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={size.price ?? 0}
                  onChange={(event) =>
                    update(index, "price", Number(event.target.value))
                  }
                />
              </label>

              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-700"
                onClick={() => remove(index)}
                aria-label={`${copy.removeSize} ${index + 1}`}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <label className="mt-3 inline-flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="default-resource-size"
                checked={Boolean(size.isDefault)}
                onChange={() => update(index, "isDefault", true)}
                className="h-4 w-4 accent-trap-blue"
              />

              <span className="text-xs font-bold text-trap-blue">
                {copy.defaultSize}
              </span>
            </label>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="admin-button-secondary mt-3 w-full"
        onClick={addSize}
      >
        <Plus size={15} />
        {copy.addSize}
      </button>
    </div>
  );
}
