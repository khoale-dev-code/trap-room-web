import {
  ArrowRight,
  CalendarDays,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import InstagramIcon from "./icons/InstagramIcon.jsx";
import Logo from "./Logo.jsx";

const COLORS = {
  blue: "#011ea0",
  yellow: "#ffe53a",
  orange: "#ef4d05",
  ink: "#07113f",
  white: "#ffffff",
  softYellow: "#fff9d7",
  softBlue: "#eef1ff",
};

const leftLinks = [
  {
    to: "/menu",
    label: "Menu",
  },
  {
    to: "/about",
    label: "Our story",
  },
  {
    to: "/gallery",
    label: "Gallery",
  },
];

const rightLinks = [
  {
    to: "/posts",
    label: "Journal",
  },
  {
    to: "/promotions",
    label: "Offers",
  },
];

export default function PublicHeader({ shop = {} }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const mobileMenuId = useId();

  const instagramUrl =
    shop.instagramUrl ||
    "https://www.instagram.com/trapart.room/";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    function handleResize() {
      if (window.innerWidth >= 1280) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [menuOpen]);

  return (
    <header
      className="
        sticky top-0 z-[70]
        border-b border-trap-blue/10
        bg-white/95
        shadow-[0_8px_35px_rgb(1_30_160_/_7%)]
        backdrop-blur-xl
      "
      style={{
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div
        className="
          mx-auto grid min-h-[82px] w-full max-w-[1500px]
          grid-cols-[1fr_auto_1fr] items-center
          px-4 sm:min-h-[86px] sm:px-6
          lg:px-8 xl:px-10
        "
        style={{
          paddingLeft:
            "max(1rem, env(safe-area-inset-left))",
          paddingRight:
            "max(1rem, env(safe-area-inset-right))",
        }}
      >
        {/* Desktop navigation — left */}
        <nav
          aria-label="Primary navigation"
          className="
            hidden min-w-0 items-center justify-end
            gap-5 pr-7
            xl:flex
            2xl:gap-8 2xl:pr-10
          "
        >
          {leftLinks.map((item) => (
            <DesktopNavLink
              key={item.to}
              to={item.to}
            >
              {item.label}
            </DesktopNavLink>
          ))}
        </nav>

        {/* Center logo */}
        <Link
          to="/"
          aria-label="TRAP Room homepage"
          className="
            group col-start-2
            grid h-[62px] w-[62px]
            place-items-center rounded-full
            bg-white
            shadow-[0_10px_30px_rgb(1_30_160_/_13%)]
            ring-1 ring-trap-blue/10
            transition duration-300
            hover:-translate-y-0.5
            hover:shadow-[0_15px_38px_rgb(1_30_160_/_18%)]
            sm:h-[68px] sm:w-[68px]
          "
        >
          <Logo
            src={shop.logoUrl}
            className="
              h-[56px] w-[56px]
              rounded-full object-cover
              transition duration-300
              group-hover:scale-[1.035]
              sm:h-[62px] sm:w-[62px]
            "
          />
        </Link>

        {/* Desktop navigation — right */}
        <nav
          aria-label="Secondary navigation"
          className="
            hidden min-w-0 items-center justify-start
            gap-5 pl-7
            xl:flex
            2xl:gap-8 2xl:pl-10
          "
        >
          {rightLinks.map((item) => (
            <DesktopNavLink
              key={item.to}
              to={item.to}
            >
              {item.label}
            </DesktopNavLink>
          ))}

          <ReservationButton
            className="shrink-0"
          />

          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open TRAP Room Instagram"
            className="
              grid h-[48px] w-[48px]
              shrink-0 place-items-center
              rounded-full
              border border-trap-blue/15
              bg-white
              shadow-[0_6px_20px_rgb(1_30_160_/_7%)]
              transition duration-300
              hover:-translate-y-0.5
              hover:border-trap-orange
              hover:bg-trap-orange
            "
            style={{
              color: COLORS.blue,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.color =
                COLORS.white;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color =
                COLORS.blue;
            }}
          >
            <InstagramIcon size={18} />
          </a>
        </nav>

        {/* Tablet/mobile actions */}
        <div className="col-start-3 flex items-center justify-end gap-2 xl:hidden">
          <Link
            to="/reservation"
            aria-label="Book a table"
            className="
              hidden min-h-[44px]
              items-center justify-center gap-2
              rounded-full
              bg-trap-blue px-5
              text-[9px] font-extrabold
              uppercase tracking-[0.13em]
              shadow-[0_8px_22px_rgb(1_30_160_/_18%)]
              transition duration-300
              active:scale-[0.98]
              sm:inline-flex
            "
            style={{
              color: COLORS.yellow,
              backgroundColor: COLORS.blue,
            }}
          >
            <span
              style={{
                color: COLORS.yellow,
              }}
            >
              Book
            </span>

            <CalendarDays
              size={15}
              style={{
                color: COLORS.yellow,
              }}
            />
          </Link>

          <button
            type="button"
            onClick={() =>
              setMenuOpen((current) => !current)
            }
            aria-expanded={menuOpen}
            aria-controls={mobileMenuId}
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            className="
              grid h-[46px] w-[46px]
              shrink-0 place-items-center
              rounded-full
              border border-trap-blue/15
              bg-white
              shadow-[0_6px_20px_rgb(1_30_160_/_6%)]
              transition duration-300
              active:scale-95
            "
            style={{
              color: COLORS.blue,
            }}
          >
            {menuOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div
          id={mobileMenuId}
          className="
            absolute inset-x-0 top-full
            border-t border-trap-blue/10
            bg-white
            shadow-[0_25px_55px_rgb(1_30_160_/_14%)]
            xl:hidden
          "
        >
          <div
            className="
              max-h-[calc(100vh-82px)]
              max-h-[calc(100dvh-82px)]
              overflow-y-auto
              overscroll-contain
              px-4 py-5
              sm:px-6
            "
            style={{
              paddingLeft:
                "max(1rem, env(safe-area-inset-left))",
              paddingRight:
                "max(1rem, env(safe-area-inset-right))",
              paddingBottom:
                "max(1.5rem, env(safe-area-inset-bottom))",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <nav className="grid">
              {[...leftLinks, ...rightLinks].map(
                (item) => (
                  <MobileNavLink
                    key={item.to}
                    to={item.to}
                  >
                    {item.label}
                  </MobileNavLink>
                )
              )}
            </nav>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ReservationButton
                mobile
                className="w-full"
              />

              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex min-h-[54px]
                  items-center justify-between
                  rounded-full
                  border border-trap-blue/15
                  bg-[#fff9d7] px-6
                  text-[10px] font-extrabold
                  uppercase tracking-[0.15em]
                "
                style={{
                  color: COLORS.blue,
                }}
              >
                <span
                  style={{
                    color: COLORS.blue,
                  }}
                >
                  Instagram
                </span>

                <InstagramIcon
                  size={18}
                  style={{
                    color: COLORS.blue,
                  }}
                />
              </a>
            </div>

            <p
              className="
                mt-7 border-t border-trap-blue/10
                pt-5 text-center
                text-[9px] font-extrabold
                uppercase tracking-[0.18em]
              "
              style={{
                color: "rgba(7, 17, 63, 0.42)",
              }}
            >
              Coffee · Matcha · Homebaked
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

function ReservationButton({
  mobile = false,
  className = "",
}) {
  return (
    <Link
      to="/reservation"
      className={[
        "group inline-flex items-center",
        "justify-center gap-2.5",
        "rounded-full",
        "bg-trap-blue px-6",
        "font-extrabold uppercase",
        "shadow-[0_9px_24px_rgb(1_30_160_/_20%)]",
        "transition duration-300",
        "hover:-translate-y-0.5",
        "hover:shadow-[0_12px_30px_rgb(239_77_5_/_20%)]",
        "active:scale-[0.98]",
        mobile
          ? "min-h-[54px] justify-between text-[10px] tracking-[0.15em]"
          : "min-h-[48px] text-[10px] tracking-[0.15em]",
        className,
      ].join(" ")}
      style={{
        color: COLORS.yellow,
        backgroundColor: COLORS.blue,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.backgroundColor =
          COLORS.orange;
        event.currentTarget.style.color =
          COLORS.white;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor =
          COLORS.blue;
        event.currentTarget.style.color =
          COLORS.yellow;
      }}
    >
      <span
        style={{
          color: "inherit",
        }}
      >
        Book a table
      </span>

      <CalendarDays
        size={mobile ? 17 : 15}
        className="shrink-0 transition-transform duration-300 group-hover:rotate-6"
        style={{
          color: "inherit",
        }}
      />
    </Link>
  );
}

function DesktopNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "group relative inline-flex min-h-[44px]",
          "items-center justify-center whitespace-nowrap",
          "text-[10px] font-extrabold",
          "uppercase tracking-[0.17em]",
          "transition-colors duration-300",
          isActive
            ? "text-trap-orange"
            : "text-trap-blue/75 hover:text-trap-blue",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <span
            style={{
              color: isActive
                ? COLORS.orange
                : "rgba(1, 30, 160, 0.76)",
            }}
          >
            {children}
          </span>

          <span
            className={[
              "absolute bottom-1 left-1/2",
              "h-[2px] -translate-x-1/2",
              "bg-trap-orange",
              "transition-all duration-300",
              isActive
                ? "w-5"
                : "w-0 group-hover:w-5",
            ].join(" ")}
          />
        </>
      )}
    </NavLink>
  );
}

function MobileNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "group flex min-h-[62px]",
          "items-center justify-between",
          "border-b border-trap-blue/10",
          "py-4",
          "text-lg font-extrabold",
          "uppercase tracking-[-0.02em]",
          "transition-colors",
          isActive
            ? "text-trap-orange"
            : "text-trap-blue",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <span
            style={{
              color: isActive
                ? COLORS.orange
                : COLORS.blue,
            }}
          >
            {children}
          </span>

          <span
            className="
              grid h-9 w-9 place-items-center
              rounded-full bg-[#eef1ff]
              transition duration-300
              group-hover:bg-trap-yellow
            "
            style={{
              color: COLORS.blue,
            }}
          >
            <ArrowRight size={15} />
          </span>
        </>
      )}
    </NavLink>
  );
}