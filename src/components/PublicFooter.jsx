
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Instagram,
  MapPin,
  Phone,
} from "lucide-react";
import {
  Link,
} from "react-router-dom";
import {
  useI18n,
} from "../i18n/I18nProvider.jsx";

const footerLinks = [
  {
    title: {
      en: "Explore",
      vi: "Khám phá",
    },
    links: [
      {
        to: "/menu",
        en: "Menu",
        vi: "Thực đơn",
      },
      {
        to: "/gallery",
        en: "Gallery",
        vi: "Thư viện",
      },
      {
        to: "/posts",
        en: "Journal",
        vi: "Bài viết",
      },
    ],
  },
  {
    title: {
      en: "TRAP Room",
      vi: "TRAP Room",
    },
    links: [
      {
        to: "/about",
        en: "Our story",
        vi: "Câu chuyện",
      },
      {
        to: "/promotions",
        en: "Offers",
        vi: "Ưu đãi",
      },
      {
        to: "/reservation",
        en: "Book a table",
        vi: "Đặt bàn",
      },
    ],
  },
];

export default function PublicFooter({
  shop = {},
}) {
  const {
    language,
  } = useI18n();

  const vi =
    language === "vi";

  const copy = {
    eyebrow: vi
      ? "Cà phê · Matcha · Bánh nhà làm"
      : "Coffee · Matcha · Homebaked",
    headline: vi
      ? "ghé trap, ở lại lâu hơn."
      : "come for coffee. stay for the room.",
    description: vi
      ? "Một không gian nhiều màu sắc cho cà phê, bánh ngọt và những cuộc trò chuyện thoải mái."
      : "A colorful room for coffee, fresh bakes and easy conversation.",
    book: vi
      ? "Đặt bàn"
      : "Book a table",
    instagram: vi
      ? "Xem Instagram"
      : "View Instagram",
    visit: vi
      ? "Ghé TRAP"
      : "Visit TRAP",
    address: vi
      ? "Địa chỉ"
      : "Address",
    phone: vi
      ? "Điện thoại"
      : "Phone",
    hours: vi
      ? "Giờ hoạt động"
      : "Opening hours",
    directions: vi
      ? "Chỉ đường"
      : "Get directions",
    rights: vi
      ? "Bảo lưu mọi quyền."
      : "All rights reserved.",
  };

  const instagramUrl =
    String(
      shop.instagramUrl ||
        "https://www.instagram.com/trapart.room/"
    ).trim();

  const directionsUrl =
    String(
      shop.googleMapsUrl ||
        shop.googleMapsEmbedUrl ||
        ""
    ).trim();

  const address =
    String(
      shop.address || ""
    ).trim() ||
    (vi
      ? "Địa chỉ đang được cập nhật"
      : "Store address coming soon");

  const phone =
    String(
      shop.phone || ""
    ).trim();

  const openingHours =
    getOpeningHoursText(
      shop,
      language
    );

  const year =
    new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden border-t border-trap-blue/12 bg-trap-blue text-white"
      data-no-auto-translate
    
      data-trap-public-footer="true">
      <Decorations />

      <div
        className="relative z-10 mx-auto w-full max-w-[1600px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20 xl:px-16"
        style={{
          paddingLeft:
            "max(1.25rem, env(safe-area-inset-left))",
          paddingRight:
            "max(1.25rem, env(safe-area-inset-right))",
          paddingBottom:
            "max(3rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.85fr)] lg:gap-14">
          <section className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <BrandMark shop={shop} />

              <span className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-trap-yellow backdrop-blur-sm">
                {copy.eyebrow}
              </span>
            </div>

            <h2 className="mt-8 max-w-[900px] font-display text-[clamp(3.4rem,7vw,8rem)] lowercase leading-[0.82] tracking-[-0.075em] text-white text-balance">
              {copy.headline}
            </h2>

            <p className="mt-7 max-w-xl text-sm font-semibold leading-7 text-white/68 sm:text-base">
              {copy.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/reservation"
                className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-trap-yellow px-6 text-[10px] font-extrabold uppercase tracking-[0.12em] text-trap-blue transition hover:-translate-y-1 hover:bg-white"
              >
                <CalendarDays size={16} />
                {copy.book}
              </Link>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-white/26 bg-white/8 px-6 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white transition hover:-translate-y-1 hover:border-trap-orange hover:bg-trap-orange"
              >
                <Instagram size={16} />
                {copy.instagram}
              </a>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/14 bg-white/8 p-5 shadow-[0_24px_70px_rgb(0_0_0_/_16%)] backdrop-blur-sm sm:p-7">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-trap-yellow">
              {copy.visit}
            </p>

            <div className="mt-6 grid gap-5">
              <ContactRow
                icon={MapPin}
                label={copy.address}
                value={address}
              />

              {phone && (
                <ContactRow
                  icon={Phone}
                  label={copy.phone}
                  value={phone}
                  href={`tel:${phone.replace(
                    /[^0-9+]/g,
                    ""
                  )}`}
                />
              )}

              <ContactRow
                icon={Clock3}
                label={copy.hours}
                value={openingHours}
              />
            </div>

            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-trap-orange px-5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white transition hover:-translate-y-1 hover:bg-white hover:text-trap-blue"
              >
                {copy.directions}
                <ArrowUpRight size={15} />
              </a>
            )}
          </section>
        </div>

        <div className="mt-14 grid gap-10 border-t border-white/16 pt-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start lg:mt-16">
          <div className="grid grid-cols-2 gap-8 sm:max-w-xl sm:grid-cols-2">
            {footerLinks.map(
              (group) => (
                <nav
                  key={group.title.en}
                >
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-trap-yellow">
                    {group.title[language]}
                  </p>

                  <div className="mt-4 grid gap-3">
                    {group.links.map(
                      (link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="w-fit text-sm font-semibold text-white/72 transition hover:translate-x-1 hover:text-white"
                        >
                          {link[language]}
                        </Link>
                      )
                    )}
                  </div>
                </nav>
              )
            )}
          </div>

          <div className="md:max-w-[360px] md:text-right">
            <p className="font-editorial text-[clamp(2.3rem,4vw,4rem)] italic leading-[0.9] text-trap-yellow">
              bright color.
              <br />
              easy energy.
            </p>

            <p className="mt-5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white/45">
              {shop.tagline ||
                "Coffee · Matcha · Homebaked"}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/16 pt-5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/48 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year}{" "}
            {shop.name ||
              "TRAP Room"}.{" "}
            {copy.rights}
          </p>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 text-white/70 transition hover:text-trap-yellow"
          >
            <Instagram size={13} />
            @trapart.room
          </a>
        </div>
      </div>
    </footer>
  );
}

function BrandMark({
  shop,
}) {
  const logoUrl =
    String(
      shop.logoUrl || ""
    ).trim();

  return (
    <Link
      to="/"
      className="inline-flex items-center gap-3"
      aria-label="TRAP Room homepage"
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-white/20 bg-trap-yellow text-trap-blue shadow-[0_12px_28px_rgb(0_0_0_/_18%)]">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-display text-lg lowercase">
            trap
          </span>
        )}
      </span>

      <span>
        <b className="block text-sm font-extrabold uppercase tracking-[0.08em] text-white">
          {shop.name ||
            "TRAP Room"}
        </b>

        <small className="mt-1 block text-[8px] font-extrabold uppercase tracking-[0.13em] text-white/45">
          Coffee room
        </small>
      </span>
    </Link>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href = "",
}) {
  const content = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-trap-yellow text-trap-blue">
        <Icon size={17} />
      </span>

      <span className="min-w-0">
        <small className="block text-[8px] font-extrabold uppercase tracking-[0.12em] text-white/45">
          {label}
        </small>

        <span className="mt-1.5 block whitespace-pre-line text-sm font-semibold leading-6 text-white">
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-start gap-3 transition hover:text-trap-yellow"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-start gap-3">
      {content}
    </div>
  );
}

function Decorations() {
  return (
    <>
      <div className="pointer-events-none absolute -left-20 top-20 h-56 w-56 rounded-[44%_56%_65%_35%/58%_42%_58%_42%] bg-trap-orange/18 blur-[1px]" />

      <div className="pointer-events-none absolute right-[-90px] top-[-70px] h-72 w-72 rounded-[58%_42%_39%_61%/48%_64%_36%_52%] bg-trap-yellow/16" />

      <div className="pointer-events-none absolute bottom-[-150px] right-[18%] h-80 w-80 rounded-full border-[44px] border-white/5" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgb(255_255_255_/_65%)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255_/_65%)_1px,transparent_1px)] [background-size:56px_56px]" />
    </>
  );
}

function getOpeningHoursText(
  shop,
  language
) {
  const schedule =
    shop.openingHoursSchedule;

  if (
    schedule &&
    typeof schedule === "object"
  ) {
    const labels =
      language === "vi"
        ? {
            weekdays:
              "Thứ 2 - Thứ 6",
            weekend:
              "Thứ 7 - Chủ nhật",
            closed: "Đóng cửa",
          }
        : {
            weekdays:
              "Mon - Fri",
            weekend:
              "Sat - Sun",
            closed: "Closed",
          };

    return [
      formatPeriod(
        labels.weekdays,
        schedule.weekdays || {},
        labels.closed
      ),
      formatPeriod(
        labels.weekend,
        schedule.weekend || {},
        labels.closed
      ),
    ].join("\n");
  }

  return (
    String(
      shop.openingHours || ""
    ).trim() ||
    (language === "vi"
      ? "Giờ hoạt động đang được cập nhật"
      : "Opening hours coming soon")
  );
}

function formatPeriod(
  label,
  period,
  closedLabel
) {
  if (period.closed) {
    return `${label}: ${closedLabel}`;
  }

  return `${label}: ${formatTime(
    period.open
  )} – ${formatTime(
    period.close
  )}`;
}

function formatTime(
  value
) {
  const match =
    String(value || "").match(
      /^(\d{2}):(\d{2})$/
    );

  if (!match) {
    return value || "";
  }

  const hours =
    Number(match[1]);

  const suffix =
    hours >= 12
      ? "PM"
      : "AM";

  const displayHours =
    hours % 12 === 0
      ? 12
      : hours % 12;

  return `${displayHours}:${match[2]}${suffix}`;
}
