
import {
  Loader2,
  Plus,
} from "lucide-react";
import AdminEmptyState from "../../../components/AdminEmptyState.jsx";
import CategoryCard from "./CategoryCard.jsx";

export default function CategoryList({
  items,
  loading,
  copy,
  reordering,
  onCreate,
  onEdit,
  onToggle,
  onMove,
  onDelete,
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
        description={
          copy.emptyDescription
        }
        action={
          <button
            type="button"
            className="admin-button-primary"
            onClick={onCreate}
          >
            <Plus size={16} />
            {copy.newCategory}
          </button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item, index) => (
        <CategoryCard
          key={item._id}
          item={item}
          index={index}
          total={items.length}
          copy={copy}
          reordering={reordering}
          onEdit={() =>
            onEdit(item)
          }
          onToggle={() =>
            onToggle(item)
          }
          onMove={(direction) =>
            onMove(
              item,
              direction
            )
          }
          onDelete={() =>
            onDelete(item)
          }
        />
      ))}
    </div>
  );
}
