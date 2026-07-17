
import {
  BadgePercent,
  BookOpenCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Coffee,
  Database,
  GalleryHorizontalEnd,
  Languages,
  LayoutDashboard,
  ListTree,
  Loader2,
  Newspaper,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  UserCog,
  UsersRound,
  Utensils,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../../../lib/api.js";
import { useI18n } from "../../../i18n/I18nProvider.jsx";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import AdminConfirmDialog from "../../components/AdminConfirmDialog.jsx";
import AdminPageHeader from "../../components/AdminPageHeader.jsx";

const moduleGroups = [
  {
    id: "workspace",
    en: "Workspace",
    vi: "Tổng quan",
    description: {
      en: "Start here to understand the Admin workspace and shared store data.",
      vi: "Bắt đầu tại đây để hiểu khu vực quản trị và dữ liệu dùng chung.",
    },
    modules: [
      {
        id: "dashboard",
        icon: LayoutDashboard,
        countKey: "",
        en: {
          title: "Overview",
          purpose:
            "Shows store activity, quick totals and shortcuts to daily tasks.",
          practice: [
            "Read store totals",
            "Use quick actions",
            "Identify items that need attention",
          ],
          result:
            "Helps the team understand what should be handled first.",
        },
        vi: {
          title: "Tổng quan",
          purpose:
            "Hiển thị hoạt động, số liệu nhanh và lối tắt cho công việc hằng ngày.",
          practice: [
            "Đọc số liệu cửa hàng",
            "Dùng thao tác nhanh",
            "Xác định việc cần ưu tiên",
          ],
          result:
            "Giúp đội ngũ biết việc nào cần xử lý trước.",
        },
      },
      {
        id: "shop",
        icon: Store,
        countKey: "",
        en: {
          title: "Store settings",
          purpose:
            "Controls shared brand, contact, map and opening-hours information.",
          practice: [
            "Update logo and brand copy",
            "Edit address and Google Maps",
            "Maintain structured opening hours",
          ],
          result:
            "Changes can appear in the header, homepage, visit section and footer.",
        },
        vi: {
          title: "Thông tin cửa hàng",
          purpose:
            "Quản lý thương hiệu, liên hệ, bản đồ và giờ hoạt động dùng chung.",
          practice: [
            "Cập nhật logo và nội dung thương hiệu",
            "Sửa địa chỉ và Google Maps",
            "Quản lý giờ mở cửa có cấu trúc",
          ],
          result:
            "Thay đổi có thể xuất hiện ở header, homepage, khu vực ghé quán và footer.",
        },
      },
      {
        id: "guide",
        icon: BookOpenCheck,
        countKey: "",
        en: {
          title: "Admin guide",
          purpose:
            "Explains every module and provides safe training data.",
          practice: [
            "Create sample records",
            "Open modules from this page",
            "Remove training data after practice",
          ],
          result:
            "Developers can train administrators without modifying real store records.",
        },
        vi: {
          title: "Hướng dẫn Admin",
          purpose:
            "Giải thích từng chức năng và cung cấp dữ liệu đào tạo an toàn.",
          practice: [
            "Tạo dữ liệu mẫu",
            "Mở chức năng ngay từ trang này",
            "Xóa dữ liệu đào tạo sau khi thực hành",
          ],
          result:
            "Dev có thể hướng dẫn Admin mà không làm thay đổi dữ liệu thật.",
        },
      },
    ],
  },
  {
    id: "menu",
    en: "Menu management",
    vi: "Quản lý thực đơn",
    description: {
      en: "Organize products, prices, tags and optional extras.",
      vi: "Tổ chức sản phẩm, giá, tag và các món thêm.",
    },
    modules: [
      {
        id: "categories",
        icon: ListTree,
        countKey: "categories",
        en: {
          title: "Categories",
          purpose:
            "Groups menu items so customers can browse drinks and bakes quickly.",
          practice: [
            "Create a category",
            "Change display order",
            "Hide a category without deleting it",
          ],
          result:
            "Categories organize menu filters and product sections on the client.",
        },
        vi: {
          title: "Danh mục",
          purpose:
            "Nhóm món để khách tìm đồ uống và bánh nhanh hơn.",
          practice: [
            "Tạo danh mục",
            "Thay đổi thứ tự",
            "Ẩn danh mục mà không cần xóa",
          ],
          result:
            "Danh mục tổ chức bộ lọc và nhóm sản phẩm ngoài client.",
        },
      },
      {
        id: "products",
        icon: Coffee,
        countKey: "products",
        en: {
          title: "Menu items",
          purpose:
            "Stores drinks and bakes with VND price, sizes, tags and visibility.",
          practice: [
            "Set current and previous price",
            "Add multiple sizes and reusable tags",
            "Control featured and available status",
          ],
          result:
            "Published items appear on Menu, homepage highlights and product detail pages.",
        },
        vi: {
          title: "Món trong thực đơn",
          purpose:
            "Lưu đồ uống và bánh cùng giá VND, kích thước, tag và trạng thái.",
          practice: [
            "Thiết lập giá hiện tại và giá cũ",
            "Thêm nhiều kích thước và tag tái sử dụng",
            "Quản lý trạng thái nổi bật và đang phục vụ",
          ],
          result:
            "Món hiển thị ở Menu, khu vực nổi bật và trang chi tiết sản phẩm.",
        },
      },
      {
        id: "toppings",
        icon: Utensils,
        countKey: "toppings",
        en: {
          title: "Extras",
          purpose:
            "Manages optional add-ons such as milk choices, cream and extra shots.",
          practice: [
            "Group related extras",
            "Set additional VND price",
            "Control availability",
          ],
          result:
            "Extras describe add-ons without creating another main menu item.",
        },
        vi: {
          title: "Món thêm",
          purpose:
            "Quản lý tùy chọn thêm như loại sữa, kem và shot cà phê.",
          practice: [
            "Nhóm các món thêm liên quan",
            "Thiết lập giá cộng thêm",
            "Quản lý trạng thái phục vụ",
          ],
          result:
            "Món thêm mô tả tùy chọn bổ sung mà không cần tạo món chính mới.",
        },
      },
    ],
  },
  {
    id: "publishing",
    en: "Publishing",
    vi: "Xuất bản nội dung",
    description: {
      en: "Prepare stories, offers and visual content for the client website.",
      vi: "Chuẩn bị bài viết, ưu đãi và nội dung hình ảnh cho website client.",
    },
    modules: [
      {
        id: "posts",
        icon: Newspaper,
        countKey: "posts",
        en: {
          title: "Journal",
          purpose:
            "Publishes store stories, new menu notes and important updates.",
          practice: [
            "Use draft and published status",
            "Pin important posts",
            "Edit excerpt, full content and media",
          ],
          result:
            "Published posts appear on Journal and may be highlighted on the homepage.",
        },
        vi: {
          title: "Bài viết",
          purpose:
            "Xuất bản câu chuyện, món mới và cập nhật quan trọng của cửa hàng.",
          practice: [
            "Dùng trạng thái bản nháp và đã xuất bản",
            "Ghim bài quan trọng",
            "Sửa mô tả ngắn, nội dung và media",
          ],
          result:
            "Bài đã xuất bản hiển thị ở Journal và có thể xuất hiện trên homepage.",
        },
      },
      {
        id: "promotions",
        icon: BadgePercent,
        countKey: "promotions",
        en: {
          title: "Offers",
          purpose:
            "Controls campaigns, labels, promo codes, date ranges and action links.",
          practice: [
            "Create active and hidden campaigns",
            "Set start and end dates",
            "Feature an important offer",
          ],
          result:
            "Active offers appear on the Offers page and campaign sections.",
        },
        vi: {
          title: "Ưu đãi",
          purpose:
            "Quản lý chiến dịch, nhãn, mã ưu đãi, thời gian và liên kết hành động.",
          practice: [
            "Tạo chiến dịch hoạt động hoặc đang ẩn",
            "Thiết lập ngày bắt đầu và kết thúc",
            "Đánh dấu ưu đãi nổi bật",
          ],
          result:
            "Ưu đãi đang hoạt động hiển thị ở trang Offers và khu vực chiến dịch.",
        },
      },
      {
        id: "gallery",
        icon: GalleryHorizontalEnd,
        countKey: "gallery",
        en: {
          title: "Gallery",
          purpose:
            "Organizes photos and videos about the room, drinks, bakes and events.",
          practice: [
            "Upload image or video media",
            "Set category and crop focus",
            "Control featured, hidden and display order",
          ],
          result:
            "Visible media appears on Gallery and may supply homepage imagery.",
        },
        vi: {
          title: "Thư viện",
          purpose:
            "Tổ chức hình ảnh và video về không gian, đồ uống, bánh và sự kiện.",
          practice: [
            "Tải ảnh hoặc video",
            "Thiết lập danh mục và vị trí lấy nét",
            "Quản lý nổi bật, ẩn và thứ tự hiển thị",
          ],
          result:
            "Media đang hiển thị xuất hiện ở Gallery và có thể dùng trên homepage.",
        },
      },
    ],
  },
  {
    id: "operations",
    en: "Team operations",
    vi: "Vận hành nhân sự",
    description: {
      en: "Manage employees, permissions, weekly schedules and customer bookings.",
      vi: "Quản lý nhân viên, phân quyền, lịch làm theo tuần và đặt bàn.",
    },
    modules: [
      {
        id: "employees",
        icon: UsersRound,
        countKey: "employees",
        en: {
          title: "Employees",
          purpose:
            "Creates employee profiles, login accounts, roles and detailed permissions.",
          practice: [
            "Create and deactivate an employee account",
            "Apply a role template",
            "Customize permissions and reset a temporary password",
          ],
          result:
            "Each employee sees only the Admin modules allowed by their permissions.",
        },
        vi: {
          title: "Nhân viên",
          purpose:
            "Tạo hồ sơ, tài khoản đăng nhập, vai trò và quyền chi tiết cho nhân viên.",
          practice: [
            "Tạo và ngừng hoạt động tài khoản",
            "Áp dụng mẫu vai trò",
            "Tùy chỉnh quyền và đặt lại mật khẩu tạm",
          ],
          result:
            "Mỗi nhân viên chỉ thấy các chức năng Admin được cấp quyền.",
        },
      },
      {
        id: "schedules",
        icon: CalendarClock,
        countKey: "workShifts",
        en: {
          title: "Work schedule",
          purpose:
            "Creates weekly shifts and assigns one or more employees.",
          practice: [
            "Create, edit and copy shifts",
            "Prevent overlapping assignments",
            "Review hours and short-staffed warnings",
          ],
          result:
            "Assigned employees can review their shifts from My schedule.",
        },
        vi: {
          title: "Xếp lịch làm",
          purpose:
            "Tạo ca theo tuần và phân công một hoặc nhiều nhân viên.",
          practice: [
            "Tạo, sửa và sao chép ca",
            "Ngăn phân công trùng giờ",
            "Theo dõi tổng giờ và cảnh báo thiếu người",
          ],
          result:
            "Nhân viên được phân công có thể xem ca tại Lịch của tôi.",
        },
      },
      {
        id: "my-schedule",
        icon: CalendarDays,
        countKey: "",
        en: {
          title: "My schedule",
          purpose:
            "Shows the signed-in employee's own weekly shifts and total hours.",
          practice: [
            "Move between weeks",
            "Review assigned coworkers",
            "Check weekly working hours",
          ],
          result:
            "Employees can review their work plan without permission to edit the team schedule.",
        },
        vi: {
          title: "Lịch của tôi",
          purpose:
            "Hiển thị ca làm và tổng giờ theo tuần của nhân viên đang đăng nhập.",
          practice: [
            "Chuyển tuần trước và tuần sau",
            "Xem đồng nghiệp cùng ca",
            "Kiểm tra tổng giờ làm",
          ],
          result:
            "Nhân viên xem kế hoạch làm việc mà không cần quyền sửa lịch toàn đội.",
        },
      },
      {
        id: "reservations",
        icon: CalendarDays,
        countKey: "reservations",
        en: {
          title: "Bookings",
          purpose:
            "Tracks customer table requests from submission to completion.",
          practice: [
            "Review pending requests",
            "Confirm, complete or cancel",
            "Keep operational notes",
          ],
          result:
            "Staff can follow every request without deleting its history.",
        },
        vi: {
          title: "Đặt bàn",
          purpose:
            "Theo dõi yêu cầu đặt bàn từ lúc tiếp nhận đến khi hoàn thành.",
          practice: [
            "Kiểm tra yêu cầu đang chờ",
            "Xác nhận, hoàn thành hoặc hủy",
            "Lưu ghi chú vận hành",
          ],
          result:
            "Nhân viên theo dõi toàn bộ vòng đời đặt bàn mà không mất lịch sử.",
        },
      },
    ],
  },
  {
    id: "system",
    en: "Language and access",
    vi: "Ngôn ngữ và quyền truy cập",
    description: {
      en: "Keep bilingual content consistent and understand access control.",
      vi: "Giữ nội dung song ngữ nhất quán và hiểu cách phân quyền.",
    },
    modules: [
      {
        id: "translations",
        icon: Languages,
        countKey: "",
        en: {
          title: "Translations",
          purpose:
            "Adds Vietnamese content while English remains the source language.",
          practice: [
            "Edit original English content",
            "Add Vietnamese translations",
            "Check English fallback when a translation is empty",
          ],
          result:
            "Client content changes when visitors switch EN or VI.",
        },
        vi: {
          title: "Chuyển ngữ",
          purpose:
            "Thêm nội dung tiếng Việt trong khi tiếng Anh vẫn là nội dung gốc.",
          practice: [
            "Sửa nội dung tiếng Anh gốc",
            "Thêm bản dịch tiếng Việt",
            "Kiểm tra tự dùng tiếng Anh khi bản dịch để trống",
          ],
          result:
            "Nội dung client thay đổi khi khách chuyển EN hoặc VI.",
        },
      },
      {
        id: "employees",
        icon: ShieldCheck,
        countKey: "employees",
        en: {
          title: "Roles and permissions",
          purpose:
            "Limits the Admin tools and APIs available to each employee account.",
          practice: [
            "Compare Manager, Supervisor and Barista roles",
            "Enable or remove individual permissions",
            "Confirm unauthorized modules are hidden",
          ],
          result:
            "The sidebar and backend both reject functions the employee cannot use.",
        },
        vi: {
          title: "Vai trò và phân quyền",
          purpose:
            "Giới hạn chức năng Admin và API mà từng tài khoản nhân viên được sử dụng.",
          practice: [
            "So sánh vai trò Manager, Supervisor và Barista",
            "Bật hoặc tắt từng quyền",
            "Kiểm tra chức năng không có quyền đã được ẩn",
          ],
          result:
            "Sidebar và backend đều từ chối chức năng nhân viên không được sử dụng.",
        },
      },
    ],
  },
];

export default function AdminGuideManager({
  refreshToken,
  onNavigate,
}) {
  const { language } = useI18n();
  const vi = language === "vi";
  const toast = useToast();

  const [status, setStatus] = useState({
    demoPresent: false,
    total: 0,
    counts: {},
  });
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [activeGroup, setActiveGroup] = useState("workspace");

  const copy = useMemo(
    () =>
      vi
        ? {
            eyebrow: "Hướng dẫn và dữ liệu đào tạo",
            title: "admin guide.",
            description:
              "Hiểu rõ từng chức năng, tạo dữ liệu mẫu an toàn và mở trực tiếp module cần thực hành.",
            create: "Tạo dữ liệu mẫu",
            addMissing: "Bổ sung dữ liệu còn thiếu",
            remove: "Xóa dữ liệu mẫu",
            refresh: "Làm mới",
            creating: "Đang tạo...",
            ready: "Bộ đào tạo đã sẵn sàng",
            empty: "Chưa có dữ liệu đào tạo",
            readyBody:
              "Có thể mở từng chức năng bên dưới để thực hành. Nhân viên mẫu được khóa đăng nhập mặc định để an toàn.",
            emptyBody:
              "Tạo danh mục, món, bài viết, ưu đãi, thư viện, đặt bàn, nhân viên và ca làm mẫu.",
            total: "Tổng bản ghi mẫu",
            completed: "Module có dữ liệu",
            modules: "Tổng module",
            quickStart: "Quy trình hướng dẫn đề xuất",
            steps: [
              "Tạo bộ dữ liệu mẫu",
              "Mở một module từ thẻ hướng dẫn",
              "Thực hành thêm, sửa, ẩn, phân quyền hoặc xếp lịch",
              "Xóa dữ liệu mẫu sau buổi hướng dẫn",
            ],
            what: "Chức năng này là gì?",
            practice: "Nên thực hành gì?",
            result: "Kết quả sau khi lưu",
            open: "Mở chức năng",
            records: "mục mẫu",
            noSeed: "Không cần seed",
            safeTitle: "An toàn với dữ liệu thật",
            safeBody:
              "Seed chạy lặp lại không tạo trùng. Nhân viên mẫu có tiền tố [DEMO], tài khoản bị khóa mặc định và chỉ dữ liệu có cờ isDemo mới bị xóa.",
            clearTitle: "Xóa toàn bộ dữ liệu đào tạo?",
            clearBody:
              "Danh mục, món, nội dung, nhân viên và ca làm [DEMO] sẽ bị xóa. Dữ liệu thật được giữ nguyên.",
            clearConfirm: "Xóa dữ liệu mẫu",
            created: "Đã tạo hoặc bổ sung dữ liệu đào tạo.",
            removed: "Đã xóa dữ liệu đào tạo.",
          }
        : {
            eyebrow: "Training guide and sample data",
            title: "admin guide.",
            description:
              "Understand every feature, create safe sample data and open the module you need to practice.",
            create: "Create sample data",
            addMissing: "Add missing sample data",
            remove: "Remove sample data",
            refresh: "Refresh",
            creating: "Creating...",
            ready: "Training set is ready",
            empty: "No training data yet",
            readyBody:
              "Open any module below and practice. Demo employee logins are disabled by default for safety.",
            emptyBody:
              "Create sample categories, items, posts, offers, gallery media, bookings, employees and work shifts.",
            total: "Total demo records",
            completed: "Modules with data",
            modules: "Total modules",
            quickStart: "Recommended training flow",
            steps: [
              "Create the sample data set",
              "Open a module from its guide card",
              "Practice create, edit, hide, permissions or scheduling",
              "Remove sample data after training",
            ],
            what: "What is this feature?",
            practice: "What should Admin practice?",
            result: "Result after saving",
            open: "Open module",
            records: "demo records",
            noSeed: "No seed needed",
            safeTitle: "Safe for real store data",
            safeBody:
              "Running the seed again does not create duplicates. Demo employees use [DEMO], login is disabled by default and removal only targets isDemo records.",
            clearTitle: "Remove all training data?",
            clearBody:
              "All [DEMO] categories, items, content, employees and work shifts are removed. Real store data remains unchanged.",
            clearConfirm: "Remove sample data",
            created: "Training data created or completed.",
            removed: "Training data removed.",
          },
    [vi]
  );

  const allModules = useMemo(
    () =>
      moduleGroups.flatMap(
        (group) => group.modules
      ),
    []
  );

  const populatedModules = useMemo(
    () =>
      new Set(
        allModules
          .filter(
            (module) =>
              module.countKey &&
              Number(
                status.counts?.[
                  module.countKey
                ] || 0
              ) > 0
          )
          .map((module) => module.id)
      ).size,
    [allModules, status.counts]
  );

  useEffect(() => {
    loadStatus();
  }, [refreshToken]);

  async function loadStatus() {
    try {
      setLoading(true);

      const data = await api.request(
        `/admin-demo/status?t=${Date.now()}`
      );

      setStatus(
        data.status || {
          demoPresent: false,
          total: 0,
          counts: {},
        }
      );
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function seed() {
    try {
      setWorking(true);

      const data = await api.request(
        "/admin-demo/seed",
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );

      setStatus(data.status);
      toast.show(copy.created);
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setWorking(false);
    }
  }

  async function clearDemo() {
    try {
      setWorking(true);

      const data = await api.request(
        "/admin-demo",
        {
          method: "DELETE",
        }
      );

      setStatus(data.status);
      setConfirmClear(false);
      toast.show(copy.removed);
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div
      data-admin-responsive-page="AdminGuideManager"
      data-no-auto-translate
    >
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <>
            <button
              type="button"
              className="admin-button-secondary"
              onClick={loadStatus}
              disabled={loading || working}
            >
              <RefreshCw
                size={16}
                className={
                  loading ? "animate-spin" : ""
                }
              />
              {copy.refresh}
            </button>

            <button
              type="button"
              className="admin-button-primary"
              onClick={seed}
              disabled={working}
            >
              {working ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Database size={16} />
              )}

              {working
                ? copy.creating
                : status.demoPresent
                  ? copy.addMissing
                  : copy.create}
            </button>

            {status.demoPresent && (
              <button
                type="button"
                className="admin-button-danger"
                onClick={() =>
                  setConfirmClear(true)
                }
                disabled={working}
              >
                <Trash2 size={16} />
                {copy.remove}
              </button>
            )}
          </>
        }
      />

      <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-trap-blue/10 bg-trap-blue p-5 text-white shadow-[0_24px_70px_rgb(7_17_63_/_14%)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[42px] border-trap-yellow/12" />
        <div className="pointer-events-none absolute -bottom-24 left-[35%] h-52 w-52 rounded-full bg-trap-orange/15" />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <span
              className={[
                "grid h-14 w-14 shrink-0 place-items-center rounded-2xl",
                status.demoPresent
                  ? "bg-emerald-400 text-trap-blue"
                  : "bg-trap-yellow text-trap-blue",
              ].join(" ")}
            >
              {status.demoPresent ? (
                <CheckCircle2 size={26} />
              ) : (
                <CircleDashed size={26} />
              )}
            </span>

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-trap-yellow">
                {status.demoPresent
                  ? copy.ready
                  : copy.empty}
              </p>

              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/72">
                {status.demoPresent
                  ? copy.readyBody
                  : copy.emptyBody}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Metric
              label={copy.total}
              value={
                loading
                  ? "—"
                  : status.total || 0
              }
            />
            <Metric
              label={copy.completed}
              value={populatedModules}
            />
            <Metric
              label={copy.modules}
              value={allModules.length}
            />
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)]">
        <article className="admin-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-trap-yellow text-trap-blue">
              <Sparkles size={19} />
            </span>

            <h2 className="text-lg font-extrabold text-trap-blue">
              {copy.quickStart}
            </h2>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {copy.steps.map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-3 rounded-2xl border border-trap-blue/10 bg-[#f8f9fd] p-4"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-trap-blue text-xs font-extrabold text-trap-yellow">
                  {index + 1}
                </span>

                <p className="text-sm font-semibold leading-6 text-trap-ink/65">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card border border-trap-yellow/60 bg-[#fffbea] p-5 sm:p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-trap-yellow text-trap-blue">
            <ShieldCheck size={19} />
          </span>

          <h2 className="mt-4 text-lg font-extrabold text-trap-blue">
            {copy.safeTitle}
          </h2>

          <p className="mt-3 text-sm font-medium leading-6 text-trap-ink/60">
            {copy.safeBody}
          </p>
        </article>
      </section>

      <nav className="admin-scrollbar mb-6 flex gap-2 overflow-x-auto pb-2">
        {moduleGroups.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() =>
              setActiveGroup(group.id)
            }
            className={[
              "min-h-11 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.1em] transition",
              activeGroup === group.id
                ? "border-trap-blue bg-trap-blue text-trap-yellow"
                : "border-trap-blue/12 bg-white text-trap-blue hover:border-trap-blue/35",
            ].join(" ")}
          >
            {group[language]}
          </button>
        ))}
      </nav>

      <div className="grid gap-8">
        {moduleGroups.map((group) => {
          const visible =
            activeGroup === group.id;

          return (
            <section
              key={group.id}
              className={
                visible ? "block" : "hidden"
              }
            >
              <div className="mb-5">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-trap-orange">
                  {group[language]}
                </p>

                <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-trap-ink/50">
                  {group.description[language]}
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                {group.modules.map((module) => (
                  <GuideCard
                    key={`${group.id}-${module.id}-${module.countKey}`}
                    module={module}
                    content={
                      module[language] || module.en
                    }
                    count={
                      module.countKey
                        ? Number(
                            status.counts?.[
                              module.countKey
                            ] || 0
                          )
                        : null
                    }
                    copy={copy}
                    onOpen={() =>
                      onNavigate?.(module.id)
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <AdminConfirmDialog
        open={confirmClear}
        title={copy.clearTitle}
        description={copy.clearBody}
        confirmLabel={copy.clearConfirm}
        busy={working}
        onCancel={() =>
          setConfirmClear(false)
        }
        onConfirm={clearDemo}
      />
    </div>
  );
}

function Metric({
  label,
  value,
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/14 bg-white/10 px-3 py-4 text-center backdrop-blur-sm sm:px-5">
      <p className="truncate text-[7px] font-extrabold uppercase tracking-[0.1em] text-white/52">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-trap-yellow">
        {value}
      </p>
    </div>
  );
}

function GuideCard({
  module,
  content,
  count,
  copy,
  onOpen,
}) {
  const Icon = module.icon;
  const hasData =
    count === null || count > 0;

  return (
    <article className="admin-card-flat overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-trap-blue/10 bg-[#f8f9fd] p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-trap-blue text-trap-yellow shadow-[0_10px_24px_rgb(1_30_160_/_16%)]">
            <Icon size={20} />
          </span>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-extrabold text-trap-blue">
              {content.title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={[
                  "admin-badge",
                  hasData
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-orange-100 text-orange-800",
                ].join(" ")}
              >
                {count === null
                  ? copy.noSeed
                  : `${count} ${copy.records}`}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="admin-icon-button shrink-0"
          onClick={onOpen}
          aria-label={copy.open}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid gap-5 p-5">
        <GuideSection
          title={copy.what}
          body={content.purpose}
        />

        <div>
          <p className="admin-label">
            {copy.practice}
          </p>

          <ul className="grid gap-2">
            {content.practice.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm font-medium leading-6 text-trap-ink/62"
              >
                <CheckCircle2
                  size={15}
                  className="mt-1 shrink-0 text-emerald-600"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <GuideSection
          title={copy.result}
          body={content.result}
        />

        <button
          type="button"
          className="admin-button-secondary w-full"
          onClick={onOpen}
        >
          {copy.open}
          <ChevronRight size={15} />
        </button>
      </div>
    </article>
  );
}

function GuideSection({
  title,
  body,
}) {
  return (
    <div>
      <p className="admin-label">
        {title}
      </p>

      <p className="text-sm font-medium leading-6 text-trap-ink/62">
        {body}
      </p>
    </div>
  );
}
