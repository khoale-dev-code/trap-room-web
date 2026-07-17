
import {
  Activity,
  ArrowUpRight,
  BookOpenText,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coffee,
  ExternalLink,
  GalleryHorizontalEnd,
  ImageIcon,
  LayoutDashboard,
  Loader2,
  Megaphone,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Store,
  Tags,
  UsersRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
} from "react-router-dom";
import {
  api,
} from "../../../lib/api.js";
import {
  useI18n,
} from "../../../i18n/I18nProvider.jsx";
import "../../styles/admin-overview-v10.css";

const ENDPOINTS = {
  shop: ["/shop"],
  categories: ["/categories"],
  menuItems: ["/menu-items"],
  extras: ["/extras", "/toppings"],
  posts: ["/journal-posts", "/posts"],
  promotions: ["/promotions"],
  gallery: ["/gallery"],
  reservations: ["/reservations"],
  employees: ["/employees"],
  shifts: ["/work-shifts"],
};

export default function DashboardView() {
  const { language } = useI18n();
  const vi = language === "vi";

  const copy = vi
    ? {
        eyebrow: "Không gian làm việc",
        title: "Tổng quan cửa hàng",
        description:
          "Theo dõi nội dung, vận hành và những việc cần xử lý trong một màn hình rõ ràng.",
        refresh: "Làm mới",
        refreshing: "Đang cập nhật",
        website: "Xem website",
        live: "Dữ liệu trực tiếp",
        menuItems: "Món đang quản lý",
        published: "Nội dung đang hiển thị",
        todayBookings: "Đặt bàn hôm nay",
        staffOnDuty: "Nhân viên có ca hôm nay",
        versusTotal: "trên tổng số",
        activeItems: "món đang hoạt động",
        publicItems: "bài viết, ưu đãi và thư viện",
        noBookings: "Chưa có đặt bàn hôm nay",
        noShifts: "Chưa có ca làm hôm nay",
        operations: "Vận hành hôm nay",
        operationsDescription:
          "Các chỉ số cần chú ý trong ngày.",
        reservations: "Đặt bàn",
        shifts: "Ca làm việc",
        employees: "Nhân viên",
        hiddenContent: "Nội dung đang ẩn",
        storeHealth: "Mức độ hoàn thiện cửa hàng",
        storeHealthDescription:
          "Bổ sung đủ thông tin giúp Client hiển thị chuyên nghiệp và đồng bộ hơn.",
        complete: "Hoàn thiện",
        completeFields: "trường đã có dữ liệu",
        missingFields: "Cần bổ sung",
        allGood: "Thông tin cửa hàng đã khá đầy đủ.",
        quickActions: "Thao tác nhanh",
        quickActionsDescription:
          "Đi đến các tác vụ thường dùng mà không cần tìm trong sidebar.",
        addMenu: "Quản lý thực đơn",
        addMenuDescription: "Thêm món, giá, tag và trạng thái hiển thị.",
        journal: "Viết bài mới",
        journalDescription: "Xuất bản tin tức và câu chuyện từ TRAP Room.",
        gallery: "Cập nhật thư viện",
        galleryDescription: "Đăng hình ảnh mới cho Client.",
        reservationsAction: "Xem đặt bàn",
        reservationsDescription: "Kiểm tra và xử lý yêu cầu của khách.",
        employeesAction: "Quản lý nhân viên",
        employeesDescription: "Tài khoản, vai trò và trạng thái làm việc.",
        scheduleAction: "Xếp lịch làm",
        scheduleDescription: "Tạo và kiểm tra ca làm của đội ngũ.",
        latestActivity: "Hoạt động gần đây",
        latestActivityDescription:
          "Nội dung và dữ liệu vừa được cập nhật.",
        noActivity: "Chưa có hoạt động gần đây.",
        open: "Mở",
        storeSettings: "Thông tin cửa hàng",
        contentOverview: "Tổng quan nội dung",
        categories: "Danh mục",
        menu: "Món trong thực đơn",
        posts: "Bài viết",
        offers: "Ưu đãi",
        galleryItems: "Mục thư viện",
        extrasLabel: "Món thêm",
        error:
          "Một vài nguồn dữ liệu chưa phản hồi. Overview vẫn hiển thị phần dữ liệu tải được.",
        updated: "Cập nhật lúc",
        unknown: "Chưa đặt tên",
        reservationActivity: "Đặt bàn mới",
        postActivity: "Bài viết",
        promotionActivity: "Ưu đãi",
        galleryActivity: "Thư viện",
      }
    : {
        eyebrow: "Workspace",
        title: "Store overview",
        description:
          "Track content, operations and the next actions from one clear dashboard.",
        refresh: "Refresh",
        refreshing: "Refreshing",
        website: "Open website",
        live: "Live data",
        menuItems: "Managed menu items",
        published: "Published content",
        todayBookings: "Today's reservations",
        staffOnDuty: "Staff scheduled today",
        versusTotal: "out of",
        activeItems: "active menu items",
        publicItems: "journal, offers and gallery items",
        noBookings: "No reservations today",
        noShifts: "No shifts scheduled today",
        operations: "Today's operations",
        operationsDescription:
          "The numbers that need attention today.",
        reservations: "Reservations",
        shifts: "Work shifts",
        employees: "Employees",
        hiddenContent: "Hidden content",
        storeHealth: "Store setup health",
        storeHealthDescription:
          "Complete the store information so the client remains polished and consistent.",
        complete: "Complete",
        completeFields: "fields completed",
        missingFields: "Needs attention",
        allGood: "Your store information is in good shape.",
        quickActions: "Quick actions",
        quickActionsDescription:
          "Jump directly to frequent tasks without searching the sidebar.",
        addMenu: "Manage menu",
        addMenuDescription: "Add items, prices, tags and visibility.",
        journal: "Create a journal post",
        journalDescription: "Publish news and stories from TRAP Room.",
        gallery: "Update gallery",
        galleryDescription: "Publish fresh visual content to the client.",
        reservationsAction: "Review reservations",
        reservationsDescription: "Check and process customer requests.",
        employeesAction: "Manage employees",
        employeesDescription: "Accounts, roles and work status.",
        scheduleAction: "Build work schedule",
        scheduleDescription: "Create and review team shifts.",
        latestActivity: "Recent activity",
        latestActivityDescription:
          "Content and records that changed recently.",
        noActivity: "No recent activity yet.",
        open: "Open",
        storeSettings: "Store settings",
        contentOverview: "Content overview",
        categories: "Categories",
        menu: "Menu items",
        posts: "Journal posts",
        offers: "Offers",
        galleryItems: "Gallery items",
        extrasLabel: "Extras",
        error:
          "Some data sources did not respond. Overview is showing the data that loaded successfully.",
        updated: "Updated",
        unknown: "Untitled",
        reservationActivity: "New reservation",
        postActivity: "Journal post",
        promotionActivity: "Offer",
        galleryActivity: "Gallery",
      };

  const [dashboard, setDashboard] = useState(
    createEmptyDashboard()
  );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [hasErrors, setHasErrors] =
    useState(false);

  const [updatedAt, setUpdatedAt] =
    useState("");

  const loadDashboard =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const entries =
          await Promise.all(
            Object.entries(
              ENDPOINTS
            ).map(
              async ([
                key,
                paths,
              ]) => {
                const result =
                  await requestFirst(
                    paths
                  );

                return [
                  key,
                  result,
                ];
              }
            )
          );

        const next =
          createEmptyDashboard();

        let errors = false;

        for (
          const [
            key,
            result,
          ] of entries
        ) {
          if (!result.ok) {
            errors = true;
          }

          if (key === "shop") {
            next.shop =
              extractObject(
                result.data,
                "shop"
              );

            continue;
          }

          next[key] =
            extractList(
              result.data,
              key
            );
        }

        setDashboard(next);
        setHasErrors(errors);
        setUpdatedAt(
          new Date().toISOString()
        );
        setLoading(false);
        setRefreshing(false);
      },
      []
    );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    function handleDataChange() {
      loadDashboard({
        silent: true,
      });
    }

    window.addEventListener(
      "trap:data-changed",
      handleDataChange
    );

    return () => {
      window.removeEventListener(
        "trap:data-changed",
        handleDataChange
      );
    };
  }, [loadDashboard]);

  const view = useMemo(
    () =>
      buildDashboardView(
        dashboard,
        copy
      ),
    [dashboard, copy]
  );

  if (loading) {
    return (
      <div className="admin-overview-loading">
        <span>
          <Loader2
            className="animate-spin"
            size={26}
          />
        </span>

        <p>
          {copy.refreshing}
        </p>
      </div>
    );
  }

  return (
    <main
      className="admin-overview"
      data-admin-overview="true"
    >
      <section className="admin-overview-hero">
        <div className="admin-overview-hero__copy">
          <div className="admin-overview-eyebrow">
            <span>
              <LayoutDashboard
                size={14}
              />
            </span>

            {copy.eyebrow}
          </div>

          <h1>
            {copy.title}
          </h1>

          <p>
            {copy.description}
          </p>

          <div className="admin-overview-live">
            <span />
            {copy.live}

            {updatedAt && (
              <small>
                {copy.updated}{" "}
                {formatTime(
                  updatedAt,
                  language
                )}
              </small>
            )}
          </div>
        </div>

        <div className="admin-overview-hero__actions">
          <button
            type="button"
            className="admin-overview-button admin-overview-button--light"
            disabled={refreshing}
            onClick={() =>
              loadDashboard({
                silent: true,
              })
            }
          >
            {refreshing ? (
              <Loader2
                className="animate-spin"
                size={16}
              />
            ) : (
              <RefreshCw
                size={16}
              />
            )}

            {refreshing
              ? copy.refreshing
              : copy.refresh}
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="admin-overview-button admin-overview-button--yellow"
          >
            <ExternalLink
              size={16}
            />
            {copy.website}
          </a>
        </div>
      </section>

      {hasErrors && (
        <div className="admin-overview-alert">
          <ShieldCheck
            size={18}
          />
          <p>
            {copy.error}
          </p>
        </div>
      )}

      <section className="admin-overview-stats">
        <OverviewStat
          icon={Coffee}
          value={view.activeMenu}
          label={copy.menuItems}
          description={`${view.activeMenu} ${copy.versusTotal} ${view.totalMenu} ${copy.activeItems}`}
          tone="blue"
        />

        <OverviewStat
          icon={Sparkles}
          value={view.publishedContent}
          label={copy.published}
          description={copy.publicItems}
          tone="yellow"
        />

        <OverviewStat
          icon={CalendarDays}
          value={view.todayReservations}
          label={copy.todayBookings}
          description={
            view.todayReservations
              ? `${view.pendingReservations} ${copy.versusTotal} ${view.todayReservations} ${copy.reservations.toLowerCase()}`
              : copy.noBookings
          }
          tone="orange"
        />

        <OverviewStat
          icon={UsersRound}
          value={view.staffToday}
          label={copy.staffOnDuty}
          description={
            view.staffToday
              ? `${view.todayShifts} ${copy.shifts.toLowerCase()}`
              : copy.noShifts
          }
          tone="ink"
        />
      </section>

      <section className="admin-overview-grid">
        <div className="admin-overview-panel admin-overview-panel--operations">
          <PanelHeading
            icon={Activity}
            title={copy.operations}
            description={
              copy.operationsDescription
            }
          />

          <div className="admin-overview-operation-list">
            <OperationRow
              icon={CalendarDays}
              label={copy.reservations}
              value={view.todayReservations}
              meta={`${view.pendingReservations} pending`}
              href="/admin/reservations"
            />

            <OperationRow
              icon={CalendarClock}
              label={copy.shifts}
              value={view.todayShifts}
              meta={`${view.staffToday} ${copy.employees.toLowerCase()}`}
              href="/admin/work-schedule"
            />

            <OperationRow
              icon={UsersRound}
              label={copy.employees}
              value={view.activeEmployees}
              meta={`${view.totalEmployees} total`}
              href="/admin/employees"
            />

            <OperationRow
              icon={ImageIcon}
              label={copy.hiddenContent}
              value={view.hiddenContent}
              meta={copy.contentOverview}
              href="/admin/gallery"
            />
          </div>
        </div>

        <StoreHealth
          copy={copy}
          shopHealth={view.shopHealth}
        />
      </section>

      <section className="admin-overview-panel">
        <PanelHeading
          icon={Sparkles}
          title={copy.quickActions}
          description={
            copy.quickActionsDescription
          }
        />

        <div className="admin-overview-actions-grid">
          <QuickAction
            icon={Coffee}
            title={copy.addMenu}
            description={
              copy.addMenuDescription
            }
            href="/admin/menu-items"
            tone="blue"
          />

          <QuickAction
            icon={BookOpenText}
            title={copy.journal}
            description={
              copy.journalDescription
            }
            href="/admin/posts"
            tone="orange"
          />

          <QuickAction
            icon={GalleryHorizontalEnd}
            title={copy.gallery}
            description={
              copy.galleryDescription
            }
            href="/admin/gallery"
            tone="yellow"
          />

          <QuickAction
            icon={CalendarDays}
            title={
              copy.reservationsAction
            }
            description={
              copy.reservationsDescription
            }
            href="/admin/reservations"
            tone="ink"
          />

          <QuickAction
            icon={UsersRound}
            title={
              copy.employeesAction
            }
            description={
              copy.employeesDescription
            }
            href="/admin/employees"
            tone="blue"
          />

          <QuickAction
            icon={CalendarClock}
            title={
              copy.scheduleAction
            }
            description={
              copy.scheduleDescription
            }
            href="/admin/work-schedule"
            tone="orange"
          />
        </div>
      </section>

      <section className="admin-overview-bottom-grid">
        <div className="admin-overview-panel">
          <PanelHeading
            icon={Clock3}
            title={copy.latestActivity}
            description={
              copy.latestActivityDescription
            }
          />

          <div className="admin-overview-activity-list">
            {view.activity.length ? (
              view.activity.map(
                (item) => (
                  <ActivityRow
                    key={item.id}
                    item={item}
                    openLabel={copy.open}
                    language={language}
                  />
                )
              )
            ) : (
              <div className="admin-overview-empty">
                <Clock3 size={22} />
                <p>
                  {copy.noActivity}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="admin-overview-panel">
          <PanelHeading
            icon={Tags}
            title={copy.contentOverview}
            description={
              copy.publicItems
            }
          />

          <div className="admin-overview-content-list">
            <ContentRow
              label={copy.categories}
              value={
                dashboard.categories
                  .length
              }
              href="/admin/categories"
            />

            <ContentRow
              label={copy.menu}
              value={
                dashboard.menuItems
                  .length
              }
              href="/admin/menu-items"
            />

            <ContentRow
              label={copy.extrasLabel}
              value={
                dashboard.extras.length
              }
              href="/admin/extras"
            />

            <ContentRow
              label={copy.posts}
              value={
                dashboard.posts.length
              }
              href="/admin/posts"
            />

            <ContentRow
              label={copy.offers}
              value={
                dashboard.promotions
                  .length
              }
              href="/admin/promotions"
            />

            <ContentRow
              label={copy.galleryItems}
              value={
                dashboard.gallery.length
              }
              href="/admin/gallery"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function OverviewStat({
  icon: Icon,
  value,
  label,
  description,
  tone,
}) {
  return (
    <article
      className={`admin-overview-stat is-${tone}`}
    >
      <span className="admin-overview-stat__icon">
        <Icon size={20} />
      </span>

      <div>
        <strong>
          {value}
        </strong>

        <h2>
          {label}
        </h2>

        <p>
          {description}
        </p>
      </div>
    </article>
  );
}

function PanelHeading({
  icon: Icon,
  title,
  description,
}) {
  return (
    <header className="admin-overview-panel__heading">
      <span>
        <Icon size={18} />
      </span>

      <div>
        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>
      </div>
    </header>
  );
}

function OperationRow({
  icon: Icon,
  label,
  value,
  meta,
  href,
}) {
  return (
    <Link
      to={href}
      className="admin-overview-operation"
    >
      <span>
        <Icon size={17} />
      </span>

      <div>
        <p>
          {label}
        </p>

        <small>
          {meta}
        </small>
      </div>

      <strong>
        {value}
      </strong>

      <ArrowUpRight
        size={16}
      />
    </Link>
  );
}

function StoreHealth({
  copy,
  shopHealth,
}) {
  return (
    <div className="admin-overview-panel admin-overview-health">
      <PanelHeading
        icon={Store}
        title={copy.storeHealth}
        description={
          copy.storeHealthDescription
        }
      />

      <div className="admin-overview-health__body">
        <div
          className="admin-overview-health__ring"
          style={{
            "--health":
              `${shopHealth.percent}%`,
          }}
        >
          <div>
            <strong>
              {shopHealth.percent}%
            </strong>

            <span>
              {copy.complete}
            </span>
          </div>
        </div>

        <div className="admin-overview-health__details">
          <p>
            <CheckCircle2
              size={16}
            />

            {shopHealth.completed}/
            {shopHealth.total}{" "}
            {copy.completeFields}
          </p>

          {shopHealth.missing.length ? (
            <div>
              <small>
                {copy.missingFields}
              </small>

              <ul>
                {shopHealth.missing.map(
                  (item) => (
                    <li key={item}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : (
            <div className="admin-overview-health__good">
              {copy.allGood}
            </div>
          )}

          <Link
            to="/admin/store"
            className="admin-overview-text-link"
          >
            <Settings2 size={15} />
            {copy.storeSettings}
            <ArrowUpRight
              size={14}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  href,
  tone,
}) {
  return (
    <Link
      to={href}
      className={`admin-overview-quick-action is-${tone}`}
    >
      <span>
        <Icon size={19} />
      </span>

      <div>
        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>
      </div>

      <ArrowUpRight
        size={17}
      />
    </Link>
  );
}

function ActivityRow({
  item,
  openLabel,
  language,
}) {
  return (
    <Link
      to={item.href}
      className="admin-overview-activity"
    >
      <span
        className={`is-${item.tone}`}
      >
        <item.icon size={17} />
      </span>

      <div>
        <small>
          {item.type}
        </small>

        <h3>
          {item.title}
        </h3>

        <p>
          {formatRelativeDate(
            item.date,
            language
          )}
        </p>
      </div>

      <em>
        {openLabel}
        <ArrowUpRight
          size={14}
        />
      </em>
    </Link>
  );
}

function ContentRow({
  label,
  value,
  href,
}) {
  return (
    <Link
      to={href}
      className="admin-overview-content-row"
    >
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <ArrowUpRight
        size={15}
      />
    </Link>
  );
}

async function requestFirst(
  paths
) {
  let lastError = null;

  for (
    const path of paths
  ) {
    try {
      const separator =
        path.includes("?")
          ? "&"
          : "?";

      const data =
        await api.request(
          `${path}${separator}t=${Date.now()}`
        );

      return {
        ok: true,
        data,
      };
    } catch (error) {
      lastError = error;
    }
  }

  return {
    ok: false,
    data: null,
    error: lastError,
  };
}

function createEmptyDashboard() {
  return {
    shop: {},
    categories: [],
    menuItems: [],
    extras: [],
    posts: [],
    promotions: [],
    gallery: [],
    reservations: [],
    employees: [],
    shifts: [],
  };
}

function extractList(
  response,
  key
) {
  if (Array.isArray(response)) {
    return response;
  }

  const aliases = {
    categories: [
      "categories",
      "items",
      "data",
      "results",
    ],
    menuItems: [
      "menuItems",
      "products",
      "items",
      "data",
      "results",
    ],
    extras: [
      "extras",
      "toppings",
      "items",
      "data",
      "results",
    ],
    posts: [
      "posts",
      "journalPosts",
      "items",
      "data",
      "results",
    ],
    promotions: [
      "promotions",
      "offers",
      "items",
      "data",
      "results",
    ],
    gallery: [
      "gallery",
      "galleryItems",
      "items",
      "data",
      "results",
    ],
    reservations: [
      "reservations",
      "bookings",
      "items",
      "data",
      "results",
    ],
    employees: [
      "employees",
      "users",
      "items",
      "data",
      "results",
    ],
    shifts: [
      "shifts",
      "workShifts",
      "items",
      "data",
      "results",
    ],
  };

  for (
    const alias of
    aliases[key] || []
  ) {
    const candidate =
      response?.[alias];

    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (
      candidate &&
      typeof candidate ===
        "object"
    ) {
      const nested =
        extractList(
          candidate,
          key
        );

      if (nested.length) {
        return nested;
      }
    }
  }

  return [];
}

function extractObject(
  response,
  key
) {
  if (
    !response ||
    typeof response !== "object"
  ) {
    return {};
  }

  if (
    response[key] &&
    typeof response[key] ===
      "object"
  ) {
    return response[key];
  }

  if (
    response.data &&
    typeof response.data ===
      "object"
  ) {
    return extractObject(
      response.data,
      key
    );
  }

  return response;
}

function buildDashboardView(
  dashboard,
  copy
) {
  const activeMenu =
    dashboard.menuItems.filter(
      isActive
    ).length;

  const publishedPosts =
    dashboard.posts.filter(
      isPublished
    ).length;

  const publishedPromotions =
    dashboard.promotions.filter(
      isPublished
    ).length;

  const visibleGallery =
    dashboard.gallery.filter(
      isActive
    ).length;

  const hiddenContent =
    [
      ...dashboard.posts,
      ...dashboard.promotions,
      ...dashboard.gallery,
    ].filter(
      (item) =>
        item?.isActive ===
          false ||
        item?.isPublished ===
          false
    ).length;

  const todayReservations =
    dashboard.reservations.filter(
      (item) =>
        isToday(
          getItemDate(item)
        )
    );

  const pendingReservations =
    todayReservations.filter(
      (item) =>
        ![
          "confirmed",
          "completed",
          "cancelled",
          "canceled",
          "declined",
        ].includes(
          String(
            item?.status || ""
          ).toLowerCase()
        )
    ).length;

  const todayShifts =
    dashboard.shifts.filter(
      (item) =>
        isToday(
          getItemDate(item)
        )
    );

  const staffToday =
    new Set(
      todayShifts
        .map(
          (item) =>
            item?.employee?._id ||
            item?.employeeId ||
            item?.employee ||
            item?.userId ||
            item?.staffId ||
            ""
        )
        .filter(Boolean)
        .map(String)
    ).size;

  const activeEmployees =
    dashboard.employees.filter(
      isActive
    ).length;

  return {
    activeMenu,
    totalMenu:
      dashboard.menuItems.length,
    publishedContent:
      publishedPosts +
      publishedPromotions +
      visibleGallery,
    hiddenContent,
    todayReservations:
      todayReservations.length,
    pendingReservations,
    todayShifts:
      todayShifts.length,
    staffToday,
    activeEmployees,
    totalEmployees:
      dashboard.employees.length,
    shopHealth:
      buildShopHealth(
        dashboard.shop
      ),
    activity:
      buildActivity(
        dashboard,
        copy
      ),
  };
}

function buildShopHealth(shop) {
  const fields = [
    [
      "Store name",
      shop?.name,
    ],
    [
      "Tagline",
      shop?.tagline,
    ],
    [
      "Description",
      shop?.description,
    ],
    [
      "Logo",
      shop?.logoUrl,
    ],
    [
      "Cover image",
      shop?.coverImageUrl,
    ],
    [
      "Address",
      shop?.address,
    ],
    [
      "Opening hours",
      shop?.openingHours ||
        shop?.openingHoursText ||
        shop?.structuredOpeningHours,
    ],
    [
      "Google Maps",
      shop?.googleMapsEmbedUrl ||
        shop?.googleMapsUrl,
    ],
    [
      "Instagram",
      shop?.instagramUrl,
    ],
    [
      "Homepage Hero",
      shop?.homeHeroImageUrl ||
        shop?.heroImageUrl,
    ],
  ];

  const completed =
    fields.filter(
      ([, value]) =>
        hasValue(value)
    ).length;

  const missing =
    fields
      .filter(
        ([, value]) =>
          !hasValue(value)
      )
      .map(
        ([label]) => label
      )
      .slice(0, 4);

  return {
    completed,
    total:
      fields.length,
    percent:
      Math.round(
        (
          completed /
          fields.length
        ) *
          100
      ),
    missing,
  };
}

function buildActivity(
  dashboard,
  copy
) {
  const items = [
    ...dashboard.reservations.map(
      (item) => ({
        id:
          `reservation-${
            item?._id ||
            item?.id ||
            Math.random()
          }`,
        type:
          copy.reservationActivity,
        title:
          item?.customerName ||
          item?.name ||
          item?.phone ||
          copy.unknown,
        date:
          getUpdatedDate(item),
        href:
          "/admin/reservations",
        icon:
          CalendarDays,
        tone:
          "orange",
      })
    ),
    ...dashboard.posts.map(
      (item) => ({
        id:
          `post-${
            item?._id ||
            item?.id ||
            Math.random()
          }`,
        type:
          copy.postActivity,
        title:
          item?.title ||
          copy.unknown,
        date:
          getUpdatedDate(item),
        href:
          "/admin/posts",
        icon:
          BookOpenText,
        tone:
          "blue",
      })
    ),
    ...dashboard.promotions.map(
      (item) => ({
        id:
          `promotion-${
            item?._id ||
            item?.id ||
            Math.random()
          }`,
        type:
          copy.promotionActivity,
        title:
          item?.title ||
          copy.unknown,
        date:
          getUpdatedDate(item),
        href:
          "/admin/promotions",
        icon:
          Megaphone,
        tone:
          "yellow",
      })
    ),
    ...dashboard.gallery.map(
      (item) => ({
        id:
          `gallery-${
            item?._id ||
            item?.id ||
            Math.random()
          }`,
        type:
          copy.galleryActivity,
        title:
          item?.title ||
          copy.unknown,
        date:
          getUpdatedDate(item),
        href:
          "/admin/gallery",
        icon:
          GalleryHorizontalEnd,
        tone:
          "ink",
      })
    ),
  ];

  return items
    .filter(
      (item) =>
        Boolean(item.date)
    )
    .sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    )
    .slice(0, 6);
}

function isActive(item) {
  return (
    item?.isActive !== false &&
    item?.isAvailable !== false
  );
}

function isPublished(item) {
  return (
    item?.isActive !== false &&
    item?.isPublished !== false
  );
}

function hasValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.keys(
      value
    ).length > 0;
  }

  return Boolean(
    String(
      value || ""
    ).trim()
  );
}

function getItemDate(item) {
  return (
    item?.reservationDate ||
    item?.bookingDate ||
    item?.shiftDate ||
    item?.date ||
    item?.startAt ||
    item?.startTime ||
    item?.scheduledAt ||
    ""
  );
}

function getUpdatedDate(item) {
  return (
    item?.updatedAt ||
    item?.createdAt ||
    getItemDate(item)
  );
}

function isToday(value) {
  if (!value) {
    return false;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return false;
  }

  const today =
    new Date();

  return (
    date.getFullYear() ===
      today.getFullYear() &&
    date.getMonth() ===
      today.getMonth() &&
    date.getDate() ===
      today.getDate()
  );
}

function formatTime(
  value,
  language
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    language === "vi"
      ? "vi-VN"
      : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function formatRelativeDate(
  value,
  language
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const difference =
    date.getTime() -
    Date.now();

  const minutes =
    Math.round(
      difference / 60000
    );

  const formatter =
    new Intl.RelativeTimeFormat(
      language === "vi"
        ? "vi-VN"
        : "en-US",
      {
        numeric: "auto",
      }
    );

  if (
    Math.abs(minutes) < 60
  ) {
    return formatter.format(
      minutes,
      "minute"
    );
  }

  const hours =
    Math.round(
      minutes / 60
    );

  if (
    Math.abs(hours) < 24
  ) {
    return formatter.format(
      hours,
      "hour"
    );
  }

  const days =
    Math.round(
      hours / 24
    );

  return formatter.format(
    days,
    "day"
  );
}
