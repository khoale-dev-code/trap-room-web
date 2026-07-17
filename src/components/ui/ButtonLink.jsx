
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const variants = {
  primary:
    "border-trap-blue bg-trap-blue text-trap-yellow hover:-translate-y-1",
  secondary:
    "border-trap-blue/20 bg-white text-trap-blue hover:border-trap-blue",
  orange:
    "border-trap-orange bg-trap-orange text-white hover:-translate-y-1",
  light:
    "border-white bg-white text-trap-blue hover:-translate-y-1",
};

export default function ButtonLink({
  to,
  children,
  variant = "primary",
  icon = true,
  className = "",
}) {
  return (
    <Link
      to={to}
      className={[
        "group inline-flex min-h-[52px] items-center justify-center gap-3",
        "rounded-full border px-6",
        "text-[10px] font-extrabold uppercase tracking-[0.14em]",
        "transition duration-300",
        variants[variant],
        className,
      ].join(" ")}
    >
      {children}

      {icon && (
        <ArrowRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      )}
    </Link>
  );
}
