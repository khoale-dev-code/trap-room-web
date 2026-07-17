
import { CalendarDays, Sparkles } from "lucide-react";
import Logo from "../../components/Logo.jsx";
import ButtonLink from "../../components/ui/ButtonLink.jsx";

export default function HomeHero({ shop, heroImage, offer }) {
  return (
    <section className="client-hero-height grid overflow-hidden border-b border-trap-blue/10 bg-white lg:grid-cols-[0.9fr_1.1fr]">
      <div className="order-2 flex flex-col justify-center px-4 py-12 sm:px-8 sm:py-16 lg:order-1 lg:px-12 xl:px-20">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-trap-blue px-4 py-2 text-[9px] font-extrabold uppercase tracking-[0.17em] text-trap-yellow">
            {shop.tagline || "Coffee · Matcha · Homebaked"}
          </span>

          {offer && (
            <span className="rounded-full bg-[#fff0e9] px-4 py-2 text-[9px] font-extrabold uppercase tracking-[0.15em] text-trap-orange">
              New at TRAP
            </span>
          )}
        </div>

        <h1 className="mt-8 max-w-[900px] font-display text-[clamp(4rem,12vw,10rem)] lowercase leading-[0.72] tracking-[-0.105em] text-trap-blue text-balance">
          coffee made bright.
        </h1>

        <p className="mt-7 max-w-xl text-base font-semibold leading-8 text-trap-ink/62 text-pretty sm:text-lg">
          {shop.description ||
            "Friendly drinks, fresh bakes and a colorful room made for everyday plans."}
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/menu">Explore the menu</ButtonLink>

          <ButtonLink
            to="/reservation"
            variant="secondary"
            icon={false}
          >
            <CalendarDays size={16} />
            Book a table
          </ButtonLink>
        </div>
      </div>

      <div className="order-1 relative min-h-[52svh] overflow-hidden bg-[#fff9d7] sm:min-h-[62svh] lg:order-2 lg:min-h-full">
        {heroImage ? (
          <img
            src={heroImage}
            alt={shop.name || "TRAP Room"}
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[#fff0e9]">
            <Logo
              src={shop.logoUrl}
              className="h-44 w-44 rounded-full object-cover shadow-2xl sm:h-60 sm:w-60"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-trap-blue/65 via-transparent to-transparent" />

        <span className="absolute left-4 top-4 grid h-24 w-24 rotate-[-8deg] place-items-center rounded-full bg-trap-yellow text-center text-[9px] font-extrabold uppercase leading-4 tracking-[0.13em] text-trap-blue shadow-xl sm:left-8 sm:top-8 sm:h-28 sm:w-28">
          Good
          <br />
          days only
        </span>

        <Sparkles
          className="absolute right-5 top-5 text-white/80 sm:right-8 sm:top-8"
          size={34}
        />

        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8 lg:p-10">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.19em] text-trap-yellow">
            Stay awhile
          </p>

          <p className="font-editorial mt-3 max-w-2xl text-3xl italic leading-[1.02] text-balance sm:text-5xl">
            A colorful room for coffee, cake and conversation.
          </p>
        </div>
      </div>
    </section>
  );
}
