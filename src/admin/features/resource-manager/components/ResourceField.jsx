
import SizeEditor from "./SizeEditor.jsx";
import ToggleField from "./ToggleField.jsx";

export default function ResourceField({
  field,
  value,
  categories,
  copy,
  onChange,
}) {
  const wrapperClass = field.full
    ? "sm:col-span-2"
    : "";

  if (field.type === "checkbox") {
    return (
      <ToggleField
        label={field.label}
        help={field.help}
        value={Boolean(value)}
        onChange={onChange}
        full={field.full}
      />
    );
  }

  if (field.type === "sizes") {
    return (
      <div className={wrapperClass}>
        <span className="admin-label">
          {field.label}
        </span>

        <SizeEditor
          value={Array.isArray(value) ? value : []}
          copy={copy}
          onChange={onChange}
        />
      </div>
    );
  }

  return (
    <label className={wrapperClass}>
      <span className="admin-label">
        {field.label}
      </span>

      {renderControl({
        field,
        value,
        categories,
        copy,
        onChange,
      })}

      {field.help && (
        <small className="mt-2 block text-xs font-medium leading-5 text-trap-ink/42">
          {field.help}
        </small>
      )}
    </label>
  );
}

function renderControl({
  field,
  value,
  categories,
  copy,
  onChange,
}) {
  const controlClass =
    "text-base sm:text-sm";

  if (field.type === "textarea") {
    return (
      <textarea
        className={`admin-textarea min-h-[120px] ${controlClass}`}
        value={value ?? ""}
        required={field.required}
        placeholder={field.placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    );
  }

  if (field.type === "category-select") {
    return (
      <select
        className={`admin-select ${controlClass}`}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        <option value="">
          {copy.noLinkedCategory}
        </option>

        {categories.map((category) => (
          <option
            key={category._id}
            value={category._id}
          >
            {category.name}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "select") {
    return (
      <select
        className={`admin-select ${controlClass}`}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {(field.options || []).map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className={`admin-input ${controlClass}`}
      type={field.type === "tags" ? "text" : field.type || "text"}
      inputMode={field.type === "number" ? "numeric" : undefined}
      value={value ?? ""}
      required={field.required}
      placeholder={field.placeholder}
      onChange={(event) =>
        onChange(event.target.value)
      }
    />
  );
}
