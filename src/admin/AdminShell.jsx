import {
  ExternalLink,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { tabs } from "./adminConfig.js";
import { filterTabsForAccount } from "./access.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import {
  getAdminSidebarCopy,
  localizeAdminTabs,
} from "./sidebarI18n.js";

const SIDEBAR_KEY =
  "trap-room-admin-sidebar-collapsed";

const EXPANDED_SIDEBAR_WIDTH = 272;
const COLLAPSED_SIDEBAR_WIDTH = 88;

function readCollapsed() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(
        SIDEBAR_KEY
      ) === "true"
    );
  } catch {
    return false;
  }
}

function writeCollapsed(value) {
  try {
    window.localStorage.setItem(
      SIDEBAR_KEY,
      String(value)
    );
  } catch {
    // Local storage can be unavailable in private browsing.
  }
}

export default function AdminShell({
  activeTab,
  setActiveTab,
  admin,
  onLogout,
  onRefresh,
  children,
}) {
  const { language } = useI18n();

  const sidebarCopy =
    getAdminSidebarCopy(language);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(readCollapsed);

  const [refreshing, setRefreshing] =
    useState(false);

  const [isDesktop, setIsDesktop] =
    useState(() => {
      if (typeof window === "undefined") {
        return false;
      }

      return window.matchMedia(
        "(min-width: 1024px)"
      ).matches;
    });

  const visibleTabs = useMemo(
    () =>
      localizeAdminTabs(
        filterTabsForAccount(
          tabs,
          admin
        ),
        language
      ),
    [admin, language]
  );

  const current =
    visibleTabs.find(
      (item) =>
        item.id === activeTab
    ) || visibleTabs[0];

  const groups = useMemo(() => {
    return visibleTabs.reduce(
      (result, item) => {
        const group =
          item.group ||
          sidebarCopy.workspace ||
          "Workspace";

        if (!result[group]) {
          result[group] = [];
        }

        result[group].push(item);
        return result;
      },
      {}
    );
  }, [
    sidebarCopy.workspace,
    visibleTabs,
  ]);

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      closeOnEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        closeOnEscape
      );
    };
  }, [mobileOpen]);

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(min-width: 1024px)"
      );

    function handleViewportChange(event) {
      setIsDesktop(event.matches);

      if (event.matches) {
        setMobileOpen(false);
      }
    }

    setIsDesktop(
      mediaQuery.matches
    );

    mediaQuery.addEventListener(
      "change",
      handleViewportChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleViewportChange
      );
    };
  }, []);

  function toggleCollapsed() {
    setCollapsed(
      (currentValue) => {
        const nextValue =
          !currentValue;

        writeCollapsed(nextValue);
        return nextValue;
      }
    );
  }

  function chooseTab(id) {
    setActiveTab(id);
    setMobileOpen(false);

    window.requestAnimationFrame(
      () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    );
  }

  async function refreshAdmin() {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await Promise.resolve(
        onRefresh?.()
      );
    } finally {
      window.setTimeout(
        () => {
          setRefreshing(false);
        },
        450
      );
    }
  }

  const desktopSidebarWidth =
    collapsed
      ? COLLAPSED_SIDEBAR_WIDTH
      : EXPANDED_SIDEBAR_WIDTH;

  return (
    <main
      data-admin-main="true"
      data-admin-shell="true"
      data-admin-sidebar-collapsed={
        collapsed
          ? "true"
          : "false"
      }
      className="admin-page min-h-screen bg-[#f5f7ff] lg:grid"
      style={{
        gridTemplateColumns:
          `${desktopSidebarWidth}px minmax(0, 1fr)`,
      }}
    >
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-trap-ink/45 backdrop-blur-[2px] lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        data-admin-sidebar="desktop"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[min(286px,88vw)] flex-col border-r border-trap-blue/10 bg-white shadow-2xl",
          "transition-[transform,width] duration-300 ease-out",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none",
          collapsed
            ? "lg:w-[88px]"
            : "lg:w-[272px]",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
        style={{
          paddingTop:
            "env(safe-area-inset-top)",
          paddingBottom:
            "env(safe-area-inset-bottom)",
        }}
        aria-label="Admin navigation"
      >
        <SidebarBrand
          collapsed={collapsed}
          copy={sidebarCopy}
          isDesktop={isDesktop}
          onCloseMobile={() =>
            setMobileOpen(false)
          }
        />

        <nav className="admin-scrollbar flex-1 overflow-y-auto overflow-x-hidden py-4">
          <div
            className={[
              "grid gap-5",
              collapsed
                ? "lg:px-3"
                : "px-3",
            ].join(" ")}
          >
            {Object.entries(
              groups
            ).map(
              ([group, items]) => (
                <SidebarGroup
                  key={group}
                  group={group}
                  items={items}
                  activeTab={
                    activeTab
                  }
                  collapsed={
                    collapsed
                  }
                  onChoose={
                    chooseTab
                  }
                />
              )
            )}
          </div>
        </nav>

        <SidebarFooter
          collapsed={collapsed}
          admin={admin}
          copy={sidebarCopy}
          onLogout={onLogout}
        />
      </aside>

      <section className="min-w-0">
        <header
          key={activeTab}
          data-admin-topbar="true"
          data-admin-current-tab={activeTab}
          className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-3 border-b border-trap-blue/10 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8"
          style={{
            paddingTop:
              "env(safe-area-inset-top)",
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            {!isDesktop && (
              <button
                type="button"
                className="admin-icon-button"
                onClick={() =>
                  setMobileOpen(true)
                }
                aria-label="Open sidebar"
                aria-expanded={
                  mobileOpen
                }
              >
                <Menu size={19} />
              </button>
            )}

            {isDesktop && (
              <button
                type="button"
                className="admin-icon-button"
                onClick={
                  toggleCollapsed
                }
                aria-label={
                  collapsed
                    ? "Expand sidebar"
                    : "Collapse sidebar"
                }
                aria-expanded={
                  !collapsed
                }
                title={
                  collapsed
                    ? "Expand sidebar"
                    : "Collapse sidebar"
                }
              >
                {collapsed ? (
                  <PanelLeftOpen
                    size={18}
                  />
                ) : (
                  <PanelLeftClose
                    size={18}
                  />
                )}
              </button>
            )}

            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold text-trap-blue sm:text-xl">
                {current?.label ||
                  sidebarCopy.brandTitle}
              </p>

              {current?.description && (
                <p className="hidden truncate text-[9px] font-semibold text-trap-ink/45 sm:block">
                  {
                    current.description
                  }
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={refreshAdmin}
            disabled={refreshing}
            className="admin-icon-button shrink-0 disabled:cursor-wait disabled:opacity-60"
            aria-label="Refresh admin data"
            title="Refresh"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </header>

        <div
          className="mx-auto w-full max-w-[1680px] p-4 sm:p-6 lg:p-8 xl:p-10"
          style={{
            paddingBottom:
              "max(2rem, env(safe-area-inset-bottom))",
          }}
        >
          {children}
        </div>
      </section>
    </main>
  );
}

function SidebarBrand({
  collapsed,
  copy,
  isDesktop,
  onCloseMobile,
}) {
  return (
    <div
      className={[
        "flex min-h-[82px] shrink-0 items-center border-b border-trap-blue/10",
        collapsed
          ? "justify-between px-4 lg:justify-center lg:px-2"
          : "justify-between px-5",
      ].join(" ")}
    >
      <Link
        to="/"
        className={[
          "flex min-w-0 items-center gap-3",
          collapsed
            ? "lg:gap-0"
            : "",
        ].join(" ")}
        aria-label="Open TRAP Room website"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-trap-blue font-display text-lg lowercase text-trap-yellow shadow-[0_8px_22px_rgb(1_30_160_/_16%)]">
          trap
        </span>

        <span
          className={[
            "min-w-0",
            collapsed
              ? "lg:hidden"
              : "",
          ].join(" ")}
        >
          <b className="block truncate text-sm text-trap-blue">
            {copy.brandTitle}
          </b>

          <small className="block truncate text-[8px] font-extrabold uppercase tracking-[0.13em] text-trap-ink/40">
            {copy.brandSubtitle}
          </small>
        </span>
      </Link>

      {!isDesktop && (
        <button
          type="button"
          className="admin-icon-button"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

function SidebarGroup({
  group,
  items,
  activeTab,
  collapsed,
  onChoose,
}) {
  return (
    <section>
      <p
        className={[
          "mb-2 px-3 text-[8px] font-extrabold uppercase tracking-[0.17em] text-trap-ink/35",
          collapsed
            ? "lg:sr-only"
            : "",
        ].join(" ")}
      >
        {group}
      </p>

      <div className="grid gap-1.5">
        {items.map(
          ({
            id,
            label,
            icon: Icon,
          }) => {
            const active =
              activeTab === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  onChoose(id)
                }
                title={
                  collapsed
                    ? label
                    : undefined
                }
                aria-label={label}
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                className={[
                  "group relative flex min-h-[48px] w-full items-center rounded-xl text-left",
                  "text-[10px] font-extrabold uppercase tracking-[0.1em]",
                  "transition-[background-color,color,box-shadow,transform] duration-200",
                  collapsed
                    ? "lg:justify-center lg:px-0"
                    : "gap-3 px-3",
                  active
                    ? "bg-trap-blue text-trap-yellow shadow-[0_8px_20px_rgb(1_30_160_/_16%)]"
                    : "text-trap-blue/65 hover:bg-[#eef1ff] hover:text-trap-blue",
                ].join(" ")}
              >
                <span
                  className={[
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                    active
                      ? "bg-white/12 text-trap-yellow"
                      : "bg-[#eef1ff] text-trap-blue",
                  ].join(" ")}
                >
                  <Icon size={16} />
                </span>

                <span
                  className={[
                    "min-w-0 truncate",
                    collapsed
                      ? "lg:hidden"
                      : "",
                  ].join(" ")}
                >
                  {label}
                </span>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}

function SidebarFooter({
  collapsed,
  admin,
  copy,
  onLogout,
}) {
  const username =
    admin?.displayName ||
    admin?.username ||
    "Administrator";

  const initial =
    String(username)
      .trim()
      .charAt(0)
      .toUpperCase() || "A";

  return (
    <footer
      className={[
        "shrink-0 border-t border-trap-blue/10 bg-white",
        collapsed
          ? "p-3 lg:px-3"
          : "p-4",
      ].join(" ")}
    >
      <div
        className={[
          "rounded-xl bg-[#eef1ff]",
          collapsed
            ? "p-3 lg:grid lg:min-h-[52px] lg:place-items-center lg:p-0"
            : "p-3",
        ].join(" ")}
        title={
          collapsed
            ? username
            : undefined
        }
      >
        <span
          className={[
            "hidden h-10 w-10 place-items-center rounded-full bg-white text-sm font-extrabold uppercase text-trap-blue shadow-sm",
            collapsed
              ? "lg:grid"
              : "",
          ].join(" ")}
        >
          {initial}
        </span>

        <div
          className={
            collapsed
              ? "lg:hidden"
              : ""
          }
        >
          <p className="truncate text-sm font-extrabold text-trap-blue">
            {username}
          </p>

          <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-trap-ink/40">
            {copy.signedIn}
          </p>
        </div>
      </div>

      <div
        className={[
          "mt-3 grid gap-2",
          collapsed
            ? "grid-cols-2 lg:grid-cols-1"
            : "grid-cols-2",
        ].join(" ")}
      >
        <Link
          to="/"
          className={[
            "flex min-h-[46px] items-center justify-center rounded-xl border border-trap-blue/15",
            "bg-white px-3 text-trap-blue transition hover:-translate-y-0.5 hover:bg-[#eef1ff]",
            collapsed
              ? "gap-2 lg:min-h-[54px] lg:flex-col lg:gap-1 lg:px-0"
              : "gap-2",
          ].join(" ")}
          aria-label={copy.website}
          title={
            collapsed
              ? copy.website
              : undefined
          }
        >
          <ExternalLink size={16} />

          <span
            className={[
              "text-[9px] font-extrabold uppercase tracking-[0.08em]",
              collapsed
                ? "lg:hidden"
                : "",
            ].join(" ")}
          >
            {copy.website}
          </span>

          {collapsed && (
            <span className="hidden text-[7px] font-extrabold uppercase tracking-[0.08em] lg:inline">
              Web
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className={[
            "flex min-h-[46px] items-center justify-center rounded-xl border border-red-200",
            "bg-red-50 px-3 text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100",
            collapsed
              ? "gap-2 lg:min-h-[54px] lg:flex-col lg:gap-1 lg:px-0"
              : "gap-2",
          ].join(" ")}
          aria-label={copy.signOut}
          title={
            collapsed
              ? copy.signOut
              : undefined
          }
        >
          <LogOut size={16} />

          <span
            className={[
              "text-[9px] font-extrabold uppercase tracking-[0.08em]",
              collapsed
                ? "lg:hidden"
                : "",
            ].join(" ")}
          >
            {copy.signOut}
          </span>

          {collapsed && (
            <span className="hidden text-[7px] font-extrabold uppercase tracking-[0.08em] lg:inline">
              Out
            </span>
          )}
        </button>
      </div>
    </footer>
  );
}