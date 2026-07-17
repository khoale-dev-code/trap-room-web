
export default function ToggleField({
  label,
  help,
  value,
  onChange,
  full,
}) {
  return (
    <div
      className={[
        "flex min-h-[88px] items-center justify-between gap-4 rounded-2xl border p-4",
        value
          ? "border-trap-blue/20 bg-[#eef1ff]"
          : "border-slate-200 bg-slate-50",
        full ? "sm:col-span-2" : "",
      ].join(" ")}
    >
      <span className="min-w-0">
        <b className="block text-sm text-trap-blue">
          {label}
        </b>

        {help && (
          <small className="mt-1 block text-xs font-medium leading-5 text-trap-ink/45">
            {help}
          </small>
        )}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={Boolean(value)}
        onClick={() => onChange(!value)}
        className={[
          "relative h-7 w-12 shrink-0 rounded-full transition",
          value ? "bg-trap-blue" : "bg-slate-300",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
            value ? "left-6" : "left-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
