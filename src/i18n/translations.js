
export const SUPPORTED_LANGUAGES = ["en", "vi"];
export const DEFAULT_LANGUAGE = "en";
export const LANGUAGE_STORAGE_KEY = "trap-room-language";

export const uiMessages = {
  en: {
    language: {
      label: "Language",
      english: "English",
      vietnamese: "Vietnamese",
      switchToEnglish: "Switch to English",
      switchToVietnamese: "Switch to Vietnamese",
    },
  },
  vi: {
    language: {
      label: "Ngôn ngữ",
      english: "Tiếng Anh",
      vietnamese: "Tiếng Việt",
      switchToEnglish: "Chuyển sang tiếng Anh",
      switchToVietnamese: "Chuyển sang tiếng Việt",
    },
  },
};

/*
 * Compatibility dictionary for the existing UI.
 *
 * This lets the current pages switch language immediately without requiring
 * every old component to be rewritten in one release. New components should
 * use useI18n().t(...) directly.
 */
export const phraseTranslations = {
  "Home": "Trang chủ",
  "Menu": "Thực đơn",
  "Our story": "Câu chuyện",
  "Gallery": "Thư viện",
  "Journal": "Bài viết",
  "Journal posts": "Bài viết",
  "Offers": "Ưu đãi",
  "Promotions": "Khuyến mãi",
  "Book a table": "Đặt bàn",
  "Book": "Đặt bàn",
  "Reservations": "Đặt bàn",
  "Instagram": "Instagram",
  "Open navigation menu": "Mở menu điều hướng",
  "Close navigation menu": "Đóng menu điều hướng",
  "Open TRAP Room Instagram": "Mở Instagram của TRAP Room",
  "TRAP Room homepage": "Trang chủ TRAP Room",
  "Coffee · Matcha · Homebaked": "Cà phê · Matcha · Bánh nhà làm",
  "Coffee": "Cà phê",
  "Matcha": "Matcha",
  "Homebaked": "Bánh nhà làm",
  "Good mood": "Tâm trạng vui",
  "Bright colors": "Sắc màu rực rỡ",
  "Scroll to explore ↓": "Cuộn để khám phá ↓",
  "Explore the menu": "Khám phá thực đơn",
  "Start here": "Bắt đầu tại đây",
  "Find what you need, fast.": "Tìm điều bạn cần thật nhanh.",
  "Full menu": "Thực đơn đầy đủ",
  "Your next favorite.": "Món yêu thích tiếp theo.",
  "Coffee, matcha, tea, fresh bakes and everything currently available at TRAP.": "Cà phê, matcha, trà, bánh mới ra lò và mọi món đang có tại TRAP.",
  "Menu highlights": "Món nổi bật",
  "House favorites.": "Món được yêu thích.",
  "See the full menu": "Xem toàn bộ thực đơn",
  "No products yet. Add menu items in the Admin dashboard.": "Chưa có sản phẩm. Hãy thêm món trong trang quản trị.",
  "The TRAP feeling": "Cảm giác TRAP",
  "Our room": "Không gian của chúng tôi",
  "Bright color. Easy energy.": "Sắc màu rực rỡ. Năng lượng dễ chịu.",
  "Read our story": "Đọc câu chuyện của chúng tôi",
  "Latest from TRAP": "Tin mới từ TRAP",
  "Stories and updates.": "Câu chuyện và cập nhật.",
  "More journal posts": "Xem thêm bài viết",
  "Journal posts will appear here after they are published in Admin.": "Bài viết sẽ xuất hiện tại đây sau khi được xuất bản trong trang quản trị.",
  "Find us": "Tìm chúng tôi",
  "Visit TRAP.": "Ghé TRAP.",
  "Visit trap.": "Ghé TRAP.",
  "Get directions": "Chỉ đường",
  "Opening hours": "Giờ mở cửa",
  "Address": "Địa chỉ",
  "Phone": "Điện thoại",
  "Google Maps Preview": "Xem trước Google Maps",
  "Stay awhile": "Ở lại một chút",
  "A colorful room for coffee, cake and conversation.": "Một không gian đầy màu sắc cho cà phê, bánh ngọt và những cuộc trò chuyện.",
  "Welcome in": "Chào mừng bạn",
  "A neighborhood cafe with a loud palette and an easygoing soul.": "Một quán cà phê gần gũi với bảng màu nổi bật và tinh thần thư thái.",
  "Open gallery": "Mở thư viện",
  "Inside TRAP Room": "Bên trong TRAP Room",
  "View details": "Xem chi tiết",
  "Back to menu": "Quay lại thực đơn",
  "Available today": "Đang phục vụ",
  "Unavailable": "Tạm hết",
  "Featured": "Nổi bật",
  "Price": "Giá",
  "Size": "Kích thước",
  "Choose a size": "Chọn kích thước",
  "Description": "Mô tả",
  "Related items": "Món liên quan",
  "No matching products.": "Không tìm thấy sản phẩm phù hợp.",
  "All": "Tất cả",
  "All categories": "Tất cả danh mục",
  "Search menu": "Tìm trong thực đơn",
  "Search products...": "Tìm sản phẩm...",
  "Search": "Tìm kiếm",
  "Clear search": "Xóa tìm kiếm",
  "New": "Mới",
  "Previous": "Trước",
  "Next": "Tiếp theo",
  "Close": "Đóng",
  "Preview": "Xem trước",
  "View": "Xem",
  "Image": "Hình ảnh",
  "Images": "Hình ảnh",
  "Video": "Video",
  "Videos": "Video",
  "Published": "Đã xuất bản",
  "Hidden": "Đang ẩn",
  "Active": "Đang hoạt động",
  "Inactive": "Không hoạt động",
  "Visible": "Đang hiển thị",
  "Draft": "Bản nháp",
  "Pinned": "Đã ghim",
  "Create": "Tạo mới",
  "Add": "Thêm",
  "Edit": "Chỉnh sửa",
  "Update": "Cập nhật",
  "Save": "Lưu",
  "Save changes": "Lưu thay đổi",
  "Saving...": "Đang lưu...",
  "Delete": "Xóa",
  "Cancel": "Hủy",
  "Reload": "Tải lại",
  "Refresh": "Làm mới",
  "Duplicate": "Nhân bản",
  "Show": "Hiện",
  "Hide": "Ẩn",
  "Feature": "Đặt nổi bật",
  "Unfeature": "Bỏ nổi bật",
  "Upload": "Tải lên",
  "Uploading...": "Đang tải lên...",
  "Quick upload": "Tải nhanh",
  "Select visible": "Chọn mục đang hiển thị",
  "Clear selection": "Bỏ chọn",
  "Grid view": "Dạng lưới",
  "List view": "Dạng danh sách",
  "Category": "Danh mục",
  "Title": "Tiêu đề",
  "Content": "Nội dung",
  "Short excerpt": "Mô tả ngắn",
  "Display order": "Thứ tự hiển thị",
  "Alternative text": "Văn bản thay thế",
  "Crop focus": "Vị trí lấy nét",
  "Center": "Chính giữa",
  "Top": "Phía trên",
  "Bottom": "Phía dưới",
  "Left": "Bên trái",
  "Right": "Bên phải",
  "Top left": "Trên trái",
  "Top right": "Trên phải",
  "Bottom left": "Dưới trái",
  "Bottom right": "Dưới phải",
  "Earlier": "Lên trước",
  "Later": "Xuống sau",
  "Move earlier": "Đưa lên trước",
  "Move later": "Đưa xuống sau",
  "Space": "Không gian",
  "Drinks": "Đồ uống",
  "Bakes": "Bánh",
  "Events": "Sự kiện",
  "Other": "Khác",
  "Admin": "Quản trị",
  "Workspace": "Không gian làm việc",
  "Overview": "Tổng quan",
  "Store settings": "Thông tin cửa hàng",
  "Categories": "Danh mục",
  "Menu items": "Món trong thực đơn",
  "Extras": "Món thêm",
  "Bookings": "Đặt bàn",
  "Operations": "Vận hành",
  "Content manager": "Quản lý nội dung",
  "Publishing": "Xuất bản",
  "Translations": "Chuyển ngữ",
  "Bilingual content": "Nội dung song ngữ",
  "Manage Vietnamese translations while keeping English as the original content.": "Quản lý bản dịch tiếng Việt trong khi giữ tiếng Anh làm nội dung gốc.",
  "Dashboard": "Bảng điều khiển",
  "Sign out": "Đăng xuất",
  "Signed in": "Đã đăng nhập",
  "Website": "Website",
  "View website": "Xem website",
  "Administrator": "Quản trị viên",
  "Checking admin session": "Đang kiểm tra phiên quản trị",
  "Sign in": "Đăng nhập",
  "Signing in...": "Đang đăng nhập...",
  "Username": "Tên đăng nhập",
  "Password": "Mật khẩu",
  "Show password": "Hiện mật khẩu",
  "Hide password": "Ẩn mật khẩu",
  "Welcome back.": "Chào mừng quay lại.",
  "TRAP Room administration": "Quản trị TRAP Room",
  "Quick actions": "Thao tác nhanh",
  "Latest bookings": "Đặt bàn mới nhất",
  "View all": "Xem tất cả",
  "Pending": "Chờ xác nhận",
  "Confirmed": "Đã xác nhận",
  "Completed": "Hoàn thành",
  "Cancelled": "Đã hủy",
  "Booking status": "Trạng thái đặt bàn",
  "Customer note": "Ghi chú của khách",
  "Customer name": "Tên khách hàng",
  "Guest count": "Số khách",
  "Guests": "Khách",
  "Date": "Ngày",
  "Time": "Giờ",
  "Note": "Ghi chú",
  "Submit reservation": "Gửi yêu cầu đặt bàn",
  "Send reservation": "Gửi yêu cầu đặt bàn",
  "Your name": "Tên của bạn",
  "Phone number": "Số điện thoại",
  "Number of guests": "Số lượng khách",
  "Reservation note": "Ghi chú đặt bàn",
  "We have received your reservation request.": "Chúng tôi đã nhận được yêu cầu đặt bàn của bạn.",
  "Store profile": "Thông tin cửa hàng",
  "Brand identity": "Nhận diện thương hiệu",
  "Contact and location": "Liên hệ và địa điểm",
  "Social and maps": "Mạng xã hội và bản đồ",
  "Brand media": "Hình ảnh thương hiệu",
  "Store name": "Tên cửa hàng",
  "Tagline": "Khẩu hiệu",
  "Short description": "Mô tả ngắn",
  "Brand story": "Câu chuyện thương hiệu",
  "Instagram URL": "Đường dẫn Instagram",
  "Google Maps URL": "Đường dẫn Google Maps",
  "Google Maps Embed URL": "Đường dẫn nhúng Google Maps",
  "Upload logo": "Tải logo",
  "Upload cover": "Tải ảnh bìa",
  "Add hero media": "Thêm media đầu trang",
  "Live preview": "Xem trước trực tiếp",
  "Menu categories": "Danh mục thực đơn",
  "Menu category": "Danh mục thực đơn",
  "Category name": "Tên danh mục",
  "Item name": "Tên món",
  "Base price": "Giá cơ bản",
  "Previous price": "Giá cũ",
  "Size options": "Tùy chọn kích thước",
  "Tags": "Thẻ",
  "House favorite": "Món nổi bật",
  "Visible on client": "Hiển thị ngoài website",
  "Available": "Đang có",
  "Available today": "Đang phục vụ",
  "Extra name": "Tên món thêm",
  "Group": "Nhóm",
  "Offer name": "Tên ưu đãi",
  "Offer label": "Nhãn ưu đãi",
  "Promo code": "Mã khuyến mãi",
  "Start date": "Ngày bắt đầu",
  "End date": "Ngày kết thúc",
  "Homepage feature": "Nổi bật ở trang chủ",
  "Gallery category": "Danh mục thư viện",
  "Search gallery": "Tìm trong thư viện",
  "Search journal posts": "Tìm bài viết",
  "Search bookings": "Tìm đặt bàn",
  "Search translations": "Tìm nội dung cần dịch",
  "Original English": "Nội dung tiếng Anh",
  "Vietnamese translation": "Bản dịch tiếng Việt",
  "Translation progress": "Tiến độ chuyển ngữ",
  "Select a resource": "Chọn loại nội dung",
  "Select an item to translate": "Chọn nội dung để dịch",
  "No translation added.": "Chưa có bản dịch.",
  "Copy original": "Sao chép bản gốc",
  "Save translation": "Lưu bản dịch",
  "Translation saved.": "Đã lưu bản dịch.",
  "English is the source language. Vietnamese fields fall back to English when empty.": "Tiếng Anh là ngôn ngữ gốc. Trường tiếng Việt sẽ dùng nội dung tiếng Anh khi để trống.",
  "No items found.": "Không tìm thấy nội dung.",
  "Nothing here yet.": "Chưa có nội dung.",
  "Try another search.": "Hãy thử từ khóa khác.",
  "Loading...": "Đang tải...",
  "Something went wrong.": "Đã xảy ra lỗi.",
  "Unable to load data.": "Không thể tải dữ liệu.",
  "Changes saved.": "Đã lưu thay đổi.",
  "Status updated.": "Đã cập nhật trạng thái.",
  "This action cannot be undone.": "Thao tác này không thể hoàn tác.",
  "Are you sure?": "Bạn có chắc chắn không?",
  "Delete item": "Xóa mục",
  "Delete selected": "Xóa mục đã chọn",
  "Create item": "Tạo mục",
  "New item": "Mục mới",
  "New post": "Bài viết mới",
  "New gallery item": "Mục thư viện mới",
  "New menu item": "Món mới",
  "Add menu item": "Thêm món",
  "Add size": "Thêm kích thước",
  "Size name": "Tên kích thước",
  "Use as the default size": "Dùng làm kích thước mặc định",
  "No address added": "Chưa thêm địa chỉ",
  "No description added.": "Chưa thêm mô tả.",
  "No written content.": "Chưa có nội dung chữ.",
  "No date": "Chưa có ngày",
};

const reversePhraseTranslations = Object.fromEntries(
  Object.entries(phraseTranslations).map(([english, vietnamese]) => [
    vietnamese,
    english,
  ])
);

export function getMessage(language, key, fallback = key) {
  const value = key
    .split(".")
    .reduce((current, part) => current?.[part], uiMessages[language]);

  return typeof value === "string" ? value : fallback;
}

export function translatePhrase(value, language) {
  if (typeof value !== "string") return value;

  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  const text = value.trim();

  if (!text) return value;

  let translated = text;

  if (language === "vi") {
    translated =
      phraseTranslations[text] ||
      translatePatternToVietnamese(text) ||
      text;
  } else {
    translated =
      reversePhraseTranslations[text] ||
      translatePatternToEnglish(text) ||
      text;
  }

  return `${leading}${translated}${trailing}`;
}

function translatePatternToVietnamese(text) {
  const patterns = [
    [
      /^Showing\s+(\d+)\s+of\s+(\d+)\s+items?$/i,
      (_, visible, total) => `Hiển thị ${visible} trên ${total} mục`,
    ],
    [
      /^Showing\s+(\d+)\s+of\s+(\d+)\s+posts?$/i,
      (_, visible, total) => `Hiển thị ${visible} trên ${total} bài viết`,
    ],
    [
      /^Showing\s+(\d+)\s+of\s+(\d+)\s+bookings?$/i,
      (_, visible, total) => `Hiển thị ${visible} trên ${total} lượt đặt bàn`,
    ],
    [
      /^(\d+)\s+selected$/i,
      (_, count) => `Đã chọn ${count} mục`,
    ],
    [
      /^(\d+)\s+guests?$/i,
      (_, count) => `${count} khách`,
    ],
    [
      /^Order\s+(\d+)$/i,
      (_, order) => `Thứ tự ${order}`,
    ],
    [
      /^Media\s+(\d+)$/i,
      (_, index) => `Media ${index}`,
    ],
    [
      /^Create\s+(\d+)\s+items?$/i,
      (_, count) => `Tạo ${count} mục`,
    ],
    [
      /^(\d+)\s+media$/i,
      (_, count) => `${count} media`,
    ],
    [
      /^(\d+)\s+attachments?$/i,
      (_, count) => `${count} tệp đính kèm`,
    ],
  ];

  for (const [pattern, replacer] of patterns) {
    if (pattern.test(text)) {
      return text.replace(pattern, replacer);
    }
  }

  return "";
}

function translatePatternToEnglish(text) {
  const patterns = [
    [
      /^Hiển thị\s+(\d+)\s+trên\s+(\d+)\s+mục$/i,
      (_, visible, total) => `Showing ${visible} of ${total} items`,
    ],
    [
      /^Hiển thị\s+(\d+)\s+trên\s+(\d+)\s+bài viết$/i,
      (_, visible, total) => `Showing ${visible} of ${total} posts`,
    ],
    [
      /^Hiển thị\s+(\d+)\s+trên\s+(\d+)\s+lượt đặt bàn$/i,
      (_, visible, total) => `Showing ${visible} of ${total} bookings`,
    ],
    [
      /^Đã chọn\s+(\d+)\s+mục$/i,
      (_, count) => `${count} selected`,
    ],
    [
      /^(\d+)\s+khách$/i,
      (_, count) => `${count} guests`,
    ],
    [
      /^Thứ tự\s+(\d+)$/i,
      (_, order) => `Order ${order}`,
    ],
  ];

  for (const [pattern, replacer] of patterns) {
    if (pattern.test(text)) {
      return text.replace(pattern, replacer);
    }
  }

  return "";
}
