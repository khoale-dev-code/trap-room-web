
import { Inbox } from "lucide-react";

export default function AdminEmptyState({
  title = "Nothing here yet.",
  description = "Create the first item to get started.",
  action,
}) {
  return (
    <div className="admin-card-flat grid min-h-64 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eef1ff] text-trap-blue">
          <Inbox size={24} />
        </span>

        <h3 className="mt-5 text-xl font-extrabold text-trap-blue">
          {title}
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-trap-ink/55">
          {description}
        </p>

        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}
