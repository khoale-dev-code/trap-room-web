
export function getMenuItemsCopy(language) {
  const vi = language === "vi";

  return {
    eyebrow: vi ? "Quản lý thực đơn" : "Menu management",
    title: vi ? "món trong thực đơn." : "menu items.",
    description: vi
      ? "Quản lý giá VND, nhiều tag, kích thước, hình ảnh và thứ tự hiển thị không bị trùng."
      : "Manage VND prices, reusable tags, sizes, media and conflict-free display ordering.",
    newItem: vi ? "Thêm món mới" : "New menu item",
    search: vi ? "Tìm món" : "Search menu items",
    searchPlaceholder: vi
      ? "Tìm theo tên, mô tả, danh mục hoặc tag..."
      : "Search name, description, category or tag...",
    all: vi ? "Tất cả" : "All",
    available: vi ? "Đang bán" : "Available",
    unavailable: vi ? "Tạm hết" : "Unavailable",
    featured: vi ? "Nổi bật" : "Featured",
    allCategories: vi ? "Tất cả danh mục" : "All categories",
    showing: (visible, total) =>
      vi
        ? `Hiển thị ${visible} trên ${total} sản phẩm`
        : `Showing ${visible} of ${total} products`,
    createTitle: vi ? "Thêm món mới" : "Create menu item",
    editTitle: vi ? "Chỉnh sửa món" : "Edit menu item",
    name: vi ? "Tên món" : "Item name",
    namePlaceholder: vi ? "Ví dụ: Matcha dừa" : "Example: Coconut matcha",
    category: vi ? "Danh mục" : "Category",
    noCategory: vi ? "Chưa chọn danh mục" : "No category selected",
    descriptionLabel: vi ? "Mô tả" : "Description",
    descriptionPlaceholder: vi
      ? "Mô tả hương vị, nguyên liệu..."
      : "Describe the flavor and ingredients...",
    price: vi ? "Giá bán" : "Price",
    oldPrice: vi ? "Giá cũ" : "Previous price",
    priceHint: vi
      ? "Nhập số liền, ví dụ 35000. Khi rời ô sẽ hiển thị 35.000 VND."
      : "Enter digits, for example 35000. It is formatted when the field loses focus.",
    tags: vi ? "Tag sản phẩm" : "Product tags",
    tagPlaceholder: vi
      ? "Nhập tag và bấm Enter"
      : "Type a tag and press Enter",
    tagHelp: vi
      ? "Bấm Enter hoặc dấu phẩy để lưu tag. Có thể chọn lại tag đã dùng cho sản phẩm khác."
      : "Press Enter or comma to add a tag. Existing tags can be reused on other products.",
    existingTags: vi ? "Tag đã dùng" : "Existing tags",
    sizes: vi ? "Kích thước và giá" : "Sizes and prices",
    addSize: vi ? "Thêm kích thước" : "Add size",
    sizeName: vi ? "Tên kích thước" : "Size name",
    defaultSize: vi ? "Kích thước mặc định" : "Default size",
    order: vi ? "Thứ tự hiển thị" : "Display order",
    orderHelp: vi
      ? "Món mới tự nhận số tiếp theo. Khi nhập trùng, hệ thống sẽ hỏi trước khi đổi vị trí."
      : "New items receive the next number automatically. A duplicate number requires confirmation before positions change.",
    visible: vi ? "Đang bán" : "Available today",
    visibleHelp: vi
      ? "Tắt khi món tạm hết nhưng vẫn muốn giữ dữ liệu."
      : "Turn off when temporarily unavailable without deleting it.",
    favorite: vi ? "Món nổi bật" : "House favorite",
    favoriteHelp: vi
      ? "Món nổi bật có thể xuất hiện ở trang chủ."
      : "Featured items may appear on the homepage.",
    media: vi ? "Hình ảnh và video" : "Images and video",
    mediaHelp: vi
      ? "Ảnh đầu tiên được dùng làm ảnh đại diện."
      : "The first image is used as the product cover.",
    addMedia: vi ? "Thêm hình ảnh hoặc video" : "Add images or video",
    cancel: vi ? "Hủy" : "Cancel",
    save: vi ? "Lưu thay đổi" : "Save changes",
    create: vi ? "Tạo sản phẩm" : "Create item",
    saving: vi ? "Đang lưu..." : "Saving...",
    noDescription: vi ? "Chưa thêm mô tả." : "No description added.",
    orderText: (order) => (vi ? `Thứ tự ${order}` : `Order ${order}`),
    tagsCount: (count) =>
      vi ? `${count} tag` : `${count} tag${count === 1 ? "" : "s"}`,
    sizesCount: (count) =>
      vi
        ? `${count} kích thước`
        : `${count} size${count === 1 ? "" : "s"}`,
    edit: vi ? "Chỉnh sửa" : "Edit",
    hide: vi ? "Đánh dấu tạm hết" : "Mark unavailable",
    show: vi ? "Đánh dấu đang bán" : "Mark available",
    feature: vi ? "Đặt nổi bật" : "Feature item",
    unfeature: vi ? "Bỏ nổi bật" : "Remove featured",
    delete: vi ? "Xóa sản phẩm" : "Delete item",
    deleteTitle: vi ? "Xóa sản phẩm này?" : "Delete this menu item?",
    deleteDescription: (name) =>
      vi
        ? `Sản phẩm “${name}” sẽ bị xóa vĩnh viễn.`
        : `“${name}” will be permanently deleted.`,
    emptyTitle: vi ? "Không tìm thấy sản phẩm." : "No matching menu items.",
    emptyDescription: vi
      ? "Thử bộ lọc khác hoặc thêm món mới."
      : "Try another filter or create a new menu item.",
    conflictTitle: vi
      ? "Thứ tự hiển thị đang bị trùng"
      : "Display order conflict",
    conflictEdit: (currentName, conflictName, order, oldOrder) =>
      vi
        ? `“${currentName}” đang được chuyển tới vị trí ${order}, nhưng vị trí này thuộc về “${conflictName}”. Bạn muốn đổi vị trí hai sản phẩm không? “${conflictName}” sẽ chuyển sang vị trí ${oldOrder}.`
        : `“${currentName}” is moving to position ${order}, which belongs to “${conflictName}”. Swap the two products? “${conflictName}” will move to position ${oldOrder}.`,
    conflictCreate: (conflictName, order) =>
      vi
        ? `Vị trí ${order} đang thuộc về “${conflictName}”. Bạn muốn chèn sản phẩm mới vào vị trí này và tự động dời các sản phẩm phía sau xuống một bậc không?`
        : `Position ${order} belongs to “${conflictName}”. Insert the new item here and move following products down by one?`,
    keepEditing: vi ? "Quay lại chỉnh sửa" : "Keep editing",
    confirmSwap: vi ? "Đổi vị trí" : "Swap positions",
    confirmInsert: vi ? "Chèn vào vị trí này" : "Insert here",
    created: vi ? "Đã tạo sản phẩm." : "Menu item created.",
    updated: vi ? "Đã cập nhật sản phẩm." : "Menu item updated.",
    deleted: vi ? "Đã xóa sản phẩm." : "Menu item deleted.",
    statusUpdated: vi ? "Đã cập nhật trạng thái." : "Status updated.",
    remove: vi ? "Xóa" : "Remove",
    noImage: vi ? "Chưa có ảnh" : "No image",
    default: vi ? "Mặc định" : "Default",
    loadError: vi
      ? "Không tải được dữ liệu sản phẩm."
      : "Could not load menu item data.",
    uploadUnavailable: vi
      ? "API tải media chưa được cấu hình."
      : "The media upload API is not configured.",
  };
}
