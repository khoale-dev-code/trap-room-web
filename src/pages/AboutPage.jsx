
import { Coffee, Cookie, Leaf } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import ButtonLink from "../components/ui/ButtonLink.jsx";
import ClientPageHero from "../components/ui/ClientPageHero.jsx";
import { getImage } from "../lib/media.js";

export default function AboutPage() {
  const { store } = useOutletContext();
  const shop = store.shop || {};

  const image =
    shop.coverImageUrl ||
    getImage(shop.heroImages?.[0]) ||
    getImage(store.gallery?.[0]);

  return (
    <main className="client-page">
      <ClientPageHero
        eyebrow="About TRAP"
        title="bold color. easy energy."
        description={shop.description}
        accent="blue"
      />

      <section className="client-section bg-white">
        <div className="client-shell grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="client-media min-h-[500px] bg-[#eef1ff]">
            {image ? (
              <img
                src={image}
                alt={shop.name || "TRAP Room"}
                className="min-h-[500px]"
                loading="lazy"
              />
            ) : (
              <div className="grid min-h-[500px] place-items-center font-display text-7xl lowercase text-trap-blue">
                trap
              </div>
            )}
          </div>

          <div className="lg:px-10">
            <p className="client-eyebrow">Our story</p>

            <h2 className="client-title mt-5">
              a place to drink well and stay longer than planned.
            </h2>

            <p className="client-copy mt-8">
              {shop.note ||
                "TRAP Room brings coffee, matcha and fresh bakes into a bright, social space made for everyday rituals and spontaneous plans."}
            </p>

            <div className="mt-9">
              <ButtonLink to="/reservation">
                Book a table
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="client-section bg-[#fff9d7]">
        <div className="client-shell grid gap-5 lg:grid-cols-3">
          <ValueCard
            icon={Coffee}
            title="Coffee"
            text="Carefully made, easy to love and full of character."
            tone="bg-white"
          />

          <ValueCard
            icon={Leaf}
            title="Matcha"
            text="Smooth, vibrant and balanced for every kind of day."
            tone="bg-white"
          />

          <ValueCard
            icon={Cookie}
            title="Homebaked"
            text="Fresh bakes designed to pair naturally with your drink."
            tone="bg-white"
          />
        </div>
      </section>
    </main>
  );
}

function ValueCard({ icon: Icon, title, text, tone }) {
  return (
    <article className={`client-card min-h-[360px] p-8 sm:p-10 ${tone}`}>
      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#eef1ff] text-trap-blue">
        <Icon size={23} />
      </span>

      <h3 className="mt-24 font-display text-4xl lowercase text-trap-blue">
        {title}
      </h3>

      <p className="mt-5 max-w-sm text-sm font-medium leading-7 text-trap-ink/60">
        {text}
      </p>
    </article>
  );
}
