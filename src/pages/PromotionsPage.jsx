
import { Check, Copy, Gift } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import ClientPageHero from "../components/ui/ClientPageHero.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { getImage } from "../lib/media.js";
import { useToast } from "../components/ui/ToastProvider.jsx";

export default function PromotionsPage() {
  const { store } = useOutletContext();
  const toast = useToast();
  const [copiedCode, setCopiedCode] = useState("");

  async function copy(code) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.show(`Copied code ${code}`);
      window.setTimeout(() => setCopiedCode(""), 1800);
    } catch {
      toast.show("Could not copy the code.", "error");
    }
  }

  return (
    <main className="client-page">
      <ClientPageHero
        eyebrow="TRAP offers"
        title="something extra."
        description="Current promotions, limited drops and reasons to stop by again."
        accent="orange"
      />

      <section className="client-section bg-white">
        <div className="client-shell">
          {store.promotions.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {store.promotions.map((item, index) => {
                const image = getImage(item);

                return (
                  <article
                    key={item._id}
                    className="client-card group"
                  >
                    <div
                      className={[
                        "client-media aspect-[16/10]",
                        index % 2 === 0
                          ? "bg-[#fff9d7]"
                          : "bg-[#eef1ff]",
                      ].join(" ")}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={item.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-trap-blue">
                          <Gift size={48} />
                        </div>
                      )}
                    </div>

                    <div className="p-6 sm:p-8">
                      <p className="client-eyebrow">
                        {item.discountText || "TRAP offer"}
                      </p>

                      <h2 className="mt-4 font-display text-4xl lowercase leading-[0.9] tracking-[-0.06em] text-trap-blue text-balance sm:text-5xl">
                        {item.title}
                      </h2>

                      <p className="mt-5 text-sm font-medium leading-7 text-trap-ink/60">
                        {item.description}
                      </p>

                      {item.code && (
                        <button
                          type="button"
                          onClick={() => copy(item.code)}
                          className="client-touch mt-7 inline-flex items-center gap-3 rounded-full border border-trap-blue/20 bg-[#fff9d7] px-5 text-[9px] font-extrabold uppercase tracking-[0.13em] text-trap-blue"
                        >
                          {copiedCode === item.code ? (
                            <Check size={15} />
                          ) : (
                            <Copy size={15} />
                          )}
                          {item.code}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No active offers right now."
              description="New offers will appear here when published."
            />
          )}
        </div>
      </section>
    </main>
  );
}
