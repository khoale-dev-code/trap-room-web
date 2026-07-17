
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function SectionHeader({
  eyebrow,
  title,
  description,
  link,
  linkLabel = "View more",
  align = "left",
}) {
  const centered = align === "center";

  return (
    <div
      className={[
        "flex flex-col gap-7",
        centered
          ? "items-center text-center"
          : "lg:flex-row lg:items-end lg:justify-between",
      ].join(" ")}
    >
      <div className={centered ? "flex flex-col items-center" : ""}>
        <p className="client-eyebrow">{eyebrow}</p>
        <h2 className="client-title mt-4 max-w-[1100px]">{title}</h2>

        {description && (
          <p
            className={[
              "client-copy mt-6",
              centered ? "mx-auto" : "",
            ].join(" ")}
          >
            {description}
          </p>
        )}
      </div>

      {link && (
        <Link
          to={link}
          className="group inline-flex min-h-[48px] w-fit items-center gap-2 rounded-full border border-trap-blue/20 bg-white px-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-trap-blue transition hover:bg-trap-blue hover:text-trap-yellow"
        >
          {linkLabel}
          <ArrowRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      )}
    </div>
  );
}
