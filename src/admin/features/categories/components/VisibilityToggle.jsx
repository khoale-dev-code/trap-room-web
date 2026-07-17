
export default function VisibilityToggle({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "flex min-h-[88px] w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition",
        checked
          ? "border-trap-blue/20 bg-[#eef1ff]"
          : "border-slate-200 bg-slate-50",
      ].join(" ")}
    >
      <span className="min-w-0">
        <b className="block text-sm text-trap-blue">
          {title}
        </b>

        <small className="mt-1 block text-xs font-medium leading-5 text-trap-ink/45">
          {description}
        </small>
      </span>

      <span
        className={[
          "relative h-7 w-12 shrink-0 rounded-full transition",
          checked
            ? "bg-trap-blue"
            : "bg-slate-300",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
            checked
              ? "left-6"
              : "left-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
