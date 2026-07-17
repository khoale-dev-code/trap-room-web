
export function getResourceManagerCopy(language, config) {
  const vi = language === "vi";
  const title = String(config?.title || "Resources");
  const singular = String(config?.singular || "item");

  return {
    eyebrow: vi ? "Quản lý nội dung" : "Content manager",
    title: `${title}.`,
    description:
      config?.description ||
      (vi
        ? "Quản lý nội dung, trạng thái và hình ảnh trong một giao diện thống nhất."
        : "Manage content, status and media in one consistent interface."),
    newItem: vi ? `Thêm ${singular}` : `New ${singular}`,
    editItem: vi ? `Chỉnh sửa ${singular}` : `Edit ${singular}`,
    createItem: vi ? `Tạo ${singular}` : `Create ${singular}`,
    editorHint: vi
      ? "Điền thông tin cần thiết rồi lưu thay đổi."
      : "Complete the required information, then save your changes.",
    searchLabel: vi ? `Tìm trong ${title}` : `Search ${title.toLowerCase()}`,
    searchPlaceholder: vi
      ? "Tìm theo tên, tiêu đề, mô tả, danh mục hoặc tag..."
      : "Search name, title, description, category or tags...",
    showing: (visible, total) =>
      vi
        ? `Hiển thị ${visible} trên ${total} mục`
        : `Showing ${visible} of ${total} items`,
    all: vi ? "Tất cả" : "All",
    visible: vi ? "Đang hiển thị" : "Visible",
    hidden: vi ? "Đang ẩn" : "Hidden",
    available: vi ? "Đang bán" : "Available",
    unavailable: vi ? "Tạm hết" : "Unavailable",
    featured: vi ? "Nổi bật" : "Featured",
    totalLabel: vi ? "Tổng nội dung" : "Total items",
    activeLabel: vi ? "Đang hoạt động" : "Active",
    hiddenLabel: vi ? "Đang ẩn" : "Hidden",
    featuredLabel: vi ? "Nổi bật" : "Featured",
    cancel: vi ? "Hủy" : "Cancel",
    close: vi ? "Đóng" : "Close",
    save: vi ? "Lưu thay đổi" : "Save changes",
    saving: vi ? "Đang lưu..." : "Saving...",
    created: vi ? "Đã tạo nội dung." : `${capitalize(singular)} created.`,
    updated: vi ? "Đã lưu thay đổi." : "Changes saved.",
    deleted: vi ? "Đã xóa nội dung." : `${capitalize(singular)} deleted.`,
    statusUpdated: vi ? "Đã cập nhật trạng thái." : "Status updated.",
    loadFailed: vi ? "Không tải được dữ liệu." : "Could not load data.",
    saveFailed: vi ? "Không lưu được dữ liệu." : "Could not save changes.",
    deleteFailed: vi ? "Không xóa được dữ liệu." : "Could not delete item.",
    noDescription: vi ? "Chưa có mô tả." : "No description added.",
    noMedia: vi ? "Chưa có hình ảnh" : "No media",
    imagesAndVideo: vi ? "Hình ảnh và video" : "Images and video",
    mediaHelp: vi
      ? "Ảnh đầu tiên được dùng làm ảnh đại diện."
      : "The first image is used as the cover.",
    selectMedia: vi ? "Chọn hình ảnh hoặc video" : "Select images or video",
    selectedFiles: (count) =>
      vi ? `${count} tệp mới đã chọn` : `${count} new file(s) selected`,
    savedMedia: vi ? "Đã lưu" : "Saved",
    newMedia: vi ? "Mới" : "New",
    addSize: vi ? "Thêm kích thước" : "Add size",
    sizeName: vi ? "Tên kích thước" : "Size name",
    price: vi ? "Giá" : "Price",
    defaultSize: vi ? "Kích thước mặc định" : "Use as the default size",
    removeSize: vi ? "Xóa kích thước" : "Remove size",
    noLinkedCategory: vi ? "Không liên kết danh mục" : "No linked category",
    edit: vi ? "Chỉnh sửa" : "Edit item",
    hide: vi ? "Ẩn nội dung" : "Hide item",
    show: vi ? "Hiện nội dung" : "Show item",
    delete: vi ? "Xóa nội dung" : "Delete item",
    deleteTitle: vi ? `Xóa ${singular}?` : `Delete ${singular}?`,
    deleteDescription: (name) =>
      vi
        ? `“${name}” sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.`
        : `“${name}” will be permanently removed. This action cannot be undone.`,
    emptyTitle: vi ? "Không tìm thấy nội dung phù hợp." : "No matching items.",
    emptyDescription: vi
      ? "Thử từ khóa hoặc bộ lọc khác, hoặc tạo nội dung mới."
      : "Try another search or filter, or create a new item.",
    orderText: (order) =>
      vi ? `Thứ tự ${order}` : `Order ${order}`,
    sizesText: (count) =>
      vi ? `${count} kích thước` : `${count} size${count === 1 ? "" : "s"}`,
    tagsText: (count) =>
      vi ? `${count} tag` : `${count} tag${count === 1 ? "" : "s"}`,
  };
}

function capitalize(value) {
  return String(value || "").replace(/^./, (character) =>
    character.toUpperCase()
  );
}
