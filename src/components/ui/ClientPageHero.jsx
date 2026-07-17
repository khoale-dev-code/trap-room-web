
export default function ClientPageHero({
  eyebrow,
  title,
  description,
  accent = "yellow",
}) {
  const accentClass =
    accent === "orange"
      ? "bg-[#fff0e9]"
      : accent === "blue"
        ? "bg-[#eef1ff]"
        : "bg-[#fff9d7]";

  return (
    <section className="relative overflow-hidden border-b border-trap-blue/10 bg-white">
      <div
        aria-hidden="true"
        className={`absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full ${accentClass} sm:h-96 sm:w-96`}
      />

      <div className="client-shell relative py-20 sm:py-24 lg:py-32">
        <p className="client-eyebrow">{eyebrow}</p>

        <h1 className="client-title mt-5 max-w-[1200px]">
          {title}
        </h1>

        {description && (
          <p className="client-copy mt-7">{description}</p>
        )}
      </div>
    </section>
  );
}
