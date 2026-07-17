
import {
  Loader2,
  Plus,
} from "lucide-react";
import AdminEmptyState from "../../../components/AdminEmptyState.jsx";
import MenuItemCard from "./MenuItemCard.jsx";

export default function MenuItemList({
  loading,
  products,
  copy,
  language,
  onCreate,
  onEdit,
  onDelete,
  onToggleAvailable,
  onToggleFeatured,
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

  if (!products.length) {
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
      {products.map((product) => (
        <MenuItemCard
          key={product._id}
          product={product}
          copy={copy}
          language={language}
          onEdit={() => onEdit(product)}
          onDelete={() => onDelete(product)}
          onToggleAvailable={() =>
            onToggleAvailable(product)
          }
          onToggleFeatured={() =>
            onToggleFeatured(product)
          }
        />
      ))}
    </div>
  );
}
