
import {
  Loader2,
  Plus,
} from "lucide-react";
import AdminEmptyState from "../../../components/AdminEmptyState.jsx";
import ResourceCard from "./ResourceCard.jsx";

export default function ResourceList({
  loading,
  items,
  config,
  copy,
  language,
  onCreate,
  onEdit,
  onDelete,
  onToggle,
}) {
  if (loading) {
    return (
      <div className="admin-card grid min-h-72 place-items-center">
        <Loader2
          className="animate-spin text-trap-blue"
          size={28}
        />
      </div>
    );
  }

  if (!items.length) {
    return (
      <AdminEmptyState
        title={copy.emptyTitle}
        description={copy.emptyDescription}
        action={
          <button
            type="button"
            className="admin-button-primary"
            onClick={onCreate}
          >
            <Plus size={16} />
            {copy.newItem}
          </button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <ResourceCard
          key={item._id}
          item={item}
          config={config}
          copy={copy}
          language={language}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
