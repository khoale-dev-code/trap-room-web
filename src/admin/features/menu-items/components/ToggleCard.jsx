
export default function ToggleCard({
  title,
  description,
  checked,
  icon: Icon,
  onChange,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "admin-card-flat flex min-h-[96px] items-center justify-between gap-4 p-4 text-left transition",
        checked ? "border-trap-blue bg-[#eef1ff]" : "",
      ].join(" ")}
    >
      <span className="flex min-w-0 items-start gap-3">
        <span
          className={[
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
            checked
              ? "bg-trap-blue text-trap-yellow"
              : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          <Icon size={17} />
        </span>

        <span>
          <b className="block text-sm text-trap-blue">{title}</b>
          <small className="mt-1 block text-xs font-medium leading-5 text-trap-ink/42">
            {description}
          </small>
        </span>
      </span>

      <span
        className={[
          "relative h-7 w-12 shrink-0 rounded-full transition",
          checked ? "bg-trap-blue" : "bg-slate-300",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
