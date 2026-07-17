
import { ArrowUpRight, Coffee } from "lucide-react";
import { Link } from "react-router-dom";
import { getImage } from "../../lib/media.js";
import {
  getCategoryName,
  getProductPath,
  money,
} from "../../lib/product.js";

export default function ProductCard({ product, index = 0 }) {
  const image = getImage(product);

  const fallback =
    index % 3 === 0
      ? "bg-[#fff0e9]"
      : index % 3 === 1
        ? "bg-[#eef1ff]"
        : "bg-[#fff9d7]";

  return (
    <article className="client-card group h-full">
      <Link
        to={getProductPath(product)}
        className="flex h-full flex-col"
      >
        <div className={`client-media aspect-[4/5] ${fallback}`}>
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
            />
          ) : (
            <div className="grid h-full place-items-center text-trap-blue">
              <div className="text-center">
                <Coffee className="mx-auto" size={46} />
                <span className="mt-4 block font-display text-3xl lowercase">
                  trap
                </span>
              </div>
            </div>
          )}

          {product.isFeatured && (
            <span className="absolute left-4 top-4 rounded-full bg-trap-yellow px-3 py-2 text-[8px] font-extrabold uppercase tracking-[0.14em] text-trap-blue shadow-lg">
              Favorite
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-trap-orange">
            {getCategoryName(product)}
          </p>

          <h3 className="mt-2 text-xl font-extrabold leading-tight text-trap-blue text-balance sm:text-2xl">
            {product.name}
          </h3>

          {product.description && (
            <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-trap-ink/55">
              {product.description}
            </p>
          )}

          <div className="mt-auto flex items-end justify-between gap-4 pt-5">
            <p className="text-sm font-extrabold text-trap-ink">
              {money(product.price)}
            </p>

            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-trap-blue/15 text-trap-blue transition duration-300 group-hover:rotate-45 group-hover:bg-trap-blue group-hover:text-trap-yellow">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
