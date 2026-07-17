
export function getCategoriesCopy(language) {
  const vi = language === "vi";

  return {
    eyebrow: vi ? "Nội dung thực đơn" : "Menu structure",
    title: vi ? "danh mục." : "categories.",
    description: vi
      ? "Tạo, chỉnh sửa và sắp xếp cấu trúc thực đơn trong một giao diện gọn gàng, phù hợp cả điện thoại và máy tính."
      : "Create, edit and arrange the menu structure in a clean interface for both mobile and desktop.",
    newCategory: vi ? "Thêm danh mục" : "New category",
    totalLabel: vi ? "Tổng danh mục" : "Total categories",
    visibleLabel: vi ? "Đang hiển thị" : "Visible",
    hiddenLabel: vi ? "Đang ẩn" : "Hidden",
    searchLabel: vi ? "Tìm danh mục" : "Search categories",
    searchPlaceholder: vi
      ? "Tìm theo tên hoặc mô tả..."
      : "Search by name or description...",
    showing: (visible, total) =>
      vi
        ? `Hiển thị ${visible} trên ${total} danh mục`
        : `Showing ${visible} of ${total} categories`,
    all: vi ? "Tất cả" : "All",
    active: vi ? "Đang hiển thị" : "Visible",
    hidden: vi ? "Đang ẩn" : "Hidden",
    editorCreate: vi ? "Thêm danh mục" : "Create category",
    editorEdit: vi ? "Chỉnh sửa danh mục" : "Edit category",
    editorHint: vi
      ? "Danh mục chỉ sử dụng nội dung chữ, không cần hình ảnh."
      : "Categories use text content only and do not require media.",
    name: vi ? "Tên danh mục" : "Category name",
    namePlaceholder: vi ? "Ví dụ: Cà phê" : "Example: Coffee",
    descriptionLabel: vi ? "Mô tả" : "Description",
    descriptionPlaceholder: vi
      ? "Mô tả ngắn cho danh mục..."
      : "A short category description...",
    order: vi ? "Thứ tự hiển thị" : "Display order",
    orderHelp: vi
      ? "Danh mục mới tự nhận số tiếp theo. Bạn cũng có thể dùng nút lên hoặc xuống trong danh sách."
      : "New categories receive the next number automatically. You can also use the up and down controls in the list.",
    visible: vi ? "Hiển thị ngoài website" : "Visible on client",
    visibleHelp: vi
      ? "Tắt để ẩn danh mục mà không xóa dữ liệu."
      : "Turn off to hide the category without deleting its data.",
    cancel: vi ? "Hủy" : "Cancel",
    close: vi ? "Đóng" : "Close",
    save: vi ? "Lưu thay đổi" : "Save changes",
    create: vi ? "Tạo danh mục" : "Create category",
    saving: vi ? "Đang lưu..." : "Saving...",
    noDescription: vi ? "Chưa thêm mô tả." : "No description added.",
    products: (count) =>
      vi
        ? `${count} sản phẩm`
        : `${count} product${count === 1 ? "" : "s"}`,
    orderText: (order) =>
      vi ? `Thứ tự ${order}` : `Order ${order}`,
    edit: vi ? "Chỉnh sửa" : "Edit",
    hide: vi ? "Ẩn danh mục" : "Hide category",
    show: vi ? "Hiện danh mục" : "Show category",
    moveUp: vi ? "Đưa lên trước" : "Move earlier",
    moveDown: vi ? "Đưa xuống sau" : "Move later",
    delete: vi ? "Xóa danh mục" : "Delete category",
    deleteTitle: vi ? "Xóa danh mục này?" : "Delete this category?",
    deleteDescription: (name) =>
      vi
        ? `Danh mục “${name}” sẽ bị xóa vĩnh viễn. Không thể xóa khi vẫn còn sản phẩm thuộc danh mục này.`
        : `“${name}” will be permanently deleted. It cannot be deleted while products still belong to it.`,
    emptyTitle: vi ? "Chưa có danh mục phù hợp." : "No matching categories.",
    emptyDescription: vi
      ? "Thử từ khóa khác hoặc tạo danh mục mới."
      : "Try another search or create a new category.",
    created: vi ? "Đã tạo danh mục." : "Category created.",
    updated: vi ? "Đã cập nhật danh mục." : "Category updated.",
    deleted: vi ? "Đã xóa danh mục." : "Category deleted.",
    reordered: vi ? "Đã cập nhật thứ tự." : "Category order updated.",
    statusUpdated: vi ? "Đã cập nhật trạng thái." : "Category status updated.",
    loadFailed: vi ? "Không tải được danh mục." : "Could not load categories.",
    saveFailed: vi ? "Không lưu được danh mục." : "Could not save category.",
  };
}
