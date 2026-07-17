
export default function AdminPageHeader({
  eyebrow = "TRAP Room admin",
  title,
  description,
  actions,
}) {
  return (
    <div data-admin-page-header="true" className="mb-6 flex flex-col gap-5 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-trap-orange">
          {eyebrow}
        </p>

        <h2 className="mt-2 font-display text-[clamp(2.2rem,5vw,4rem)] lowercase leading-[0.9] tracking-[-0.06em] text-trap-blue text-balance">
          {title}
        </h2>

        {description && (
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-trap-ink/55 text-pretty">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
