
import { Coffee } from "lucide-react";

export default function EmptyState({
  title = "Nothing here yet.",
  description = "Content will appear after it is added in Admin.",
}) {
  return (
    <div className="grid min-h-[280px] place-items-center border border-dashed border-trap-blue/20 bg-white p-8 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eef1ff] text-trap-blue">
          <Coffee size={25} />
        </span>

        <p className="mt-5 text-xl font-extrabold text-trap-blue">
          {title}
        </p>

        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-trap-ink/55">
          {description}
        </p>
      </div>
    </div>
  );
}
