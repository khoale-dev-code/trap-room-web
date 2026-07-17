
import {
  ArrowUpRight,
  Clock3,
  Coffee,
  MapPin,
} from "lucide-react";
import ButtonLink from "../../components/ui/ButtonLink.jsx";
import GoogleMapFrame from "../../components/maps/GoogleMapFrame.jsx";
import OpeningHoursDisplay from "../../components/store/OpeningHoursDisplay.jsx";
import {
  buildGoogleMapsDirectionsUrl,
} from "../../lib/googleMaps.js";

export default function VisitSection({
  shop = {},
  fallbackImage = "",
}) {
  const directionsUrl =
    buildGoogleMapsDirectionsUrl(shop);

  const address =
    shop.address ||
    "Store address coming soon";

  const openingHours =
    shop.openingHours ||
    "Opening hours coming soon";

  return (
    <section className="grid overflow-hidden border-y border-trap-blue/10 bg-[#fff8f2] lg:min-h-[78svh] lg:grid-cols-[0.72fr_1.28fr]">
      <div className="flex flex-col justify-center px-5 py-14 sm:px-8 sm:py-18 lg:px-[clamp(3rem,5vw,6rem)] lg:py-24">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-trap-yellow px-4 text-[9px] font-extrabold uppercase tracking-[0.12em] text-trap-blue">
            <Coffee size={14} />
            TRAP Room
          </span>

          <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-trap-orange">
            Visit · Relax · Repeat
          </span>
        </div>

        <h2 className="mt-10 max-w-[640px] font-display text-[clamp(4rem,8vw,8rem)] lowercase leading-[0.78] tracking-[-0.085em] text-trap-blue text-balance">
          find your way to the room.
        </h2>

        <div className="mt-9 grid gap-4">
          <InfoCard
            icon={MapPin}
            label="Address"
            value={address}
          />

          <article className="flex min-h-[112px] items-start gap-4 border border-trap-blue/12 bg-white p-4 sm:p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eef1ff] text-trap-blue">
              <Clock3 size={18} />
            </span>

            <span className="min-w-0">
              <small className="block text-[8px] font-extrabold uppercase tracking-[0.14em] text-trap-orange">
                Opening hours
              </small>

              <OpeningHoursDisplay
                shop={shop}
                className="mt-3"
              />
            </span>
          </article>
        </div>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            to="/reservation"
            variant="orange"
          >
            Book a table
          </ButtonLink>

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full border border-trap-blue/20 bg-white px-6 text-[10px] font-extrabold uppercase tracking-[0.13em] text-trap-blue transition hover:-translate-y-1 hover:border-trap-blue"
            >
              Get directions
              <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      </div>

      <div className="relative min-h-[500px] overflow-hidden bg-[#eef1f4] lg:min-h-full">
        <GoogleMapFrame
          shop={shop}
          fallbackImage={fallbackImage}
          className="lg:min-h-full"
        />

        <div className="pointer-events-none absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-auto sm:w-[330px]">
          <div className="flex items-start gap-4 border border-white/80 bg-white/94 p-5 shadow-[0_18px_55px_rgb(7_17_63_/_16%)] backdrop-blur-xl">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-trap-blue text-trap-yellow">
              <MapPin size={20} />
            </span>

            <span className="min-w-0">
              <small className="block text-[8px] font-extrabold uppercase tracking-[0.13em] text-trap-orange">
                TRAP Room location
              </small>

              <b className="mt-2 block text-sm leading-6 text-trap-blue">
                {address}
              </b>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <article className="flex min-h-[88px] items-center gap-4 border border-trap-blue/12 bg-white p-4 sm:p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eef1ff] text-trap-blue">
        <Icon size={18} />
      </span>

      <span className="min-w-0">
        <small className="block text-[8px] font-extrabold uppercase tracking-[0.14em] text-trap-orange">
          {label}
        </small>

        <b className="mt-2 block text-sm font-semibold leading-6 text-trap-blue">
          {value}
        </b>
      </span>
    </article>
  );
}
