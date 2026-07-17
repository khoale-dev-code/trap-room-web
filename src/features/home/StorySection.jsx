
import Logo from "../../components/Logo.jsx";
import ButtonLink from "../../components/ui/ButtonLink.jsx";

export default function StorySection({ shop, image }) {
  return (
    <section className="grid border-y border-trap-blue/10 bg-white lg:min-h-[82svh] lg:grid-cols-2">
      <div className="relative min-h-[460px] overflow-hidden bg-[#eef1ff] sm:min-h-[620px] lg:min-h-full">
        {image ? (
          <img
            src={image}
            alt="Inside TRAP Room"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full min-h-[460px] place-items-center bg-trap-blue">
            <Logo
              src={shop.logoUrl}
              className="h-48 w-48 rounded-full object-cover shadow-2xl"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-trap-blue/55 via-transparent to-transparent" />

        <span className="absolute left-5 top-5 rotate-[-5deg] rounded-full bg-trap-yellow px-5 py-3 text-[9px] font-extrabold uppercase tracking-[0.16em] text-trap-blue sm:left-8 sm:top-8">
          Hello from TRAP
        </span>
      </div>

      <div className="flex flex-col justify-center px-4 py-16 sm:px-8 sm:py-24 lg:px-14 xl:px-20">
        <p className="client-eyebrow">Our story</p>

        <h2 className="client-title mt-5">
          serious about drinks. never too serious.
        </h2>

        <p className="client-copy mt-8">
          {shop.note ||
            "TRAP Room brings carefully made coffee, matcha and fresh bakes into a playful, welcoming space built for everyone."}
        </p>

        <div className="mt-9">
          <ButtonLink to="/about">
            Meet TRAP Room
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
