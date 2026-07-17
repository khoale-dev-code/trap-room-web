import { ArrowDownRight } from "lucide-react";
import InstagramIcon from "./icons/InstagramIcon.jsx";
import Logo from "./Logo.jsx";

export default function Hero({ shop }) {
  return (
    <section id="top" className="border-b-[3px] border-trap-blue">
      <div className="grid min-h-[calc(100svh-83px)] lg:grid-cols-[1.08fr_.92fr]">
        <div className="flex flex-col justify-between bg-trap-yellow px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="inline-flex w-fit items-center border-[3px] border-trap-blue bg-trap-paper px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em]">
            {shop.tagline}
          </div>

          <div className="my-10">
            <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.2em]">
              Cafe culture in bold color
            </p>

            <h1 className="max-w-[850px] font-display text-[clamp(4.7rem,15vw,12rem)] lowercase leading-[0.74] tracking-[-0.095em] text-trap-blue">
              trap
            </h1>

            <p className="mt-8 max-w-xl text-lg font-semibold leading-8 text-trap-ink sm:text-xl">
              {shop.description}
            </p>
          </div>

          <a
            href="#about"
            className="flex w-fit items-center gap-3 text-sm font-extrabold uppercase tracking-[0.14em]"
          >
            Khám phá không gian
            <ArrowDownRight size={22} />
          </a>
        </div>

        <div className="relative flex min-h-[500px] flex-col justify-between overflow-hidden bg-trap-orange px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="absolute -right-24 top-24 h-72 w-72 rounded-full border-[28px] border-trap-blue/20" />

          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full border-[40px] border-trap-yellow/25" />

          <div className="relative z-10 ml-auto w-fit border-[3px] border-trap-blue bg-trap-yellow px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em]">
            Drink · Bake · Stay
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-md place-items-center">
            <div className="trap-card rotate-[-3deg] bg-trap-paper p-5 transition-transform duration-300 hover:rotate-0">
              <Logo className="aspect-square w-full max-w-[380px]" />
            </div>
          </div>

          <a
            href={shop.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="trap-button relative z-10 ml-auto inline-flex h-14 items-center gap-3 bg-trap-blue px-6 font-extrabold uppercase tracking-[0.12em] text-white"
          >
            <InstagramIcon size={20} />
            @trapart.room
          </a>
        </div>
      </div>
    </section>
  );
}
