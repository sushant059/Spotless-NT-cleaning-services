import type { Metadata } from "next";
import { CtaBand, PageHero } from "@/components/content";
import { OfferCard } from "@/components/offers";
import { FadeIn } from "@/components/fade-in";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";
import { isOfferLive } from "@/lib/validators";

export const metadata: Metadata = {
  title: "Offers & specials",
  description: "Current cleaning specials and promotions from Spotless NT in Darwin.",
};

export default async function OffersPage() {
  const db = await getDb();
  const offers = byOrder(db.offers).filter((offer) => isOfferLive(offer));
  return (
    <>
      <PageHero eyebrow="Offers" title="Current specials & promotions." lede="Limited-time deals for Darwin and Palmerston homes. Mention the offer or use the promo code when you book." crumbs={[{ href: "/offers", label: "Offers" }]} />
      <section className="section pt-12">
        <div className="container-x">
          {offers.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer, index) => <FadeIn key={offer.id} delay={index * 80}><OfferCard offer={offer} featured={index === 0} /></FadeIn>)}
            </div>
          ) : (
            <p className="card p-8 text-center text-lg text-slate">No specials are running right now. Check back soon, or follow us on social media to hear first.</p>
          )}
        </div>
      </section>
      <CtaBand settings={db.settings} />
    </>
  );
}
