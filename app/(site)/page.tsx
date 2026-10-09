import Link from "next/link";
import { BeforeAfter } from "@/components/before-after";
import { FaqList, GoogleButtons, Pillars, ReviewCard, ServiceCards, Steps, TrustBar } from "@/components/content";
import { QuoteForm } from "@/components/forms/quote-form";
import { FadeIn } from "@/components/fade-in";
import { SuburbChecker, VideoShowcase } from "@/components/home/interactive";
import { SunRays, Wave } from "@/components/waves";
import { getDb } from "@/lib/store";
import { byOrder, safeHttpUrl } from "@/lib/utils";
import { isOfferLive } from "@/lib/validators";
import { Phone } from "lucide-react";
import { MediaImage } from "@/components/media-image";

export default async function HomePage() {
  const db = await getDb();
  const offers = byOrder(db.offers).filter((offer) => isOfferLive(offer));
  const services = byOrder(db.services);
  const results = byOrder(db.results).slice(0, 3);
  const reviews = byOrder(db.reviews).filter((review) => review.visible).slice(0, 3);
  const faqs = byOrder(db.faqs).slice(0, 4);
  const hero = results[0];
  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <SunRays />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:py-20 lg:grid-cols-2">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-deep">{db.settings.shortName}</p>
            <h1 className="mt-3 text-[36px] font-bold leading-[1.15] text-ink md:text-[56px]">{db.settings.heroHeadline}</h1>
            <p className="mt-4 max-w-xl text-lg text-slate">{db.settings.heroSubtext}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/free-quote" className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-sun px-6 font-semibold text-ink">Free Quote</Link>
              <a href={`tel:${db.settings.phoneTel}`} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-teal-deep px-6 font-semibold text-teal-deep"><Phone className="h-5 w-5" aria-hidden /> Call {db.settings.phoneDisplay}</a>
              <a href={db.settings.whatsappUrl} className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-whatsapp px-6 font-semibold text-ink">WhatsApp</a>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {["Fixed quote first", "Darwin and surrounds", "Kids and pets considered"].map((chip) => (
                <li key={chip} className="rounded-full bg-sky px-3 py-1 text-sm font-semibold text-teal-deep">{chip}</li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn>
            {db.settings.heroImage ? (
              <MediaImage src={db.settings.heroImage} alt="Spotless NT cleaning a Darwin home" className="aspect-[4/3] w-full rounded-card object-cover shadow-soft" />
            ) : (
              <BeforeAfter scene={hero?.scene || "carpet"} beforeSrc={hero?.beforeImage} afterSrc={hero?.afterImage} beforeAlt="Illustrative carpet before cleaning" afterAlt="Illustrative carpet after cleaning" />
            )}
          </FadeIn>
        </div>
        <Wave fill="#FFFBF0" />
      </section>
      <TrustBar />
      <section className="bg-sky py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">Current offers</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {offers.map((offer) => (
              <article key={offer.id} className="rounded-card bg-white p-6 shadow-card">
                <h3 className="text-2xl font-bold">{offer.title}</h3>
                <p className="mt-2 text-slate">{offer.description}</p>
                <Link href={offer.href || "/free-quote"} className="mt-4 inline-flex font-semibold text-teal-deep">See how to book</Link>
              </article>
            ))}
            {offers.length === 0 && <p className="text-slate">No offers are running right now. A free quote is still the best place to start.</p>}
          </div>
        </div>
      </section>
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">Services</h2>
          <p className="mt-3 max-w-2xl text-slate">Carpet, couches, mattresses, rugs and the urgent jobs that cannot wait until next week.</p>
          <div className="mt-8"><ServiceCards services={services} /></div>
        </div>
      </section>
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">See the work</h2>
          <p className="mt-3 max-w-2xl text-slate">These previews are labelled illustrative until real job videos are added in admin.</p>
          <div className="mt-8"><VideoShowcase services={services} /></div>
        </div>
      </section>
      <section className="bg-sky py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">Why Darwin homes call us</h2>
          <div className="mt-8"><Pillars /></div>
          <Link href="/why-us" className="mt-6 inline-flex font-semibold text-teal-deep">More about the team</Link>
        </div>
      </section>
      <section className="bg-teal-deep py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">How it works</h2>
          <div className="mt-8"><Steps /></div>
          <Link href="/how-it-works" className="mt-6 inline-flex font-semibold text-sun">Drying times and the full process</Link>
        </div>
      </section>
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">Before and after</h2>
            <Link href="/results" className="font-semibold text-teal-deep">All results</Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {results.map((item) => (
              <figure key={item.id}>
                <BeforeAfter scene={item.scene} beforeSrc={item.beforeImage} afterSrc={item.afterImage} beforeAlt={`Before ${item.caption}`} afterAlt={`After ${item.caption}`} />
                <figcaption className="mt-2 text-sm text-slate">{item.caption}. Illustrative.</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">Reviews</h2>
          <p className="mt-3 max-w-2xl text-slate">Sample cards stay up until real reviews replace them. We do not show a star average we have not earned.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
          <GoogleButtons google={db.settings.google} />
          {!safeHttpUrl(db.settings.google) && <p className="mt-4 text-sm text-slate">Add a Google reviews link in settings to show the review buttons.</p>}
          <Link href="/reviews" className="mt-4 inline-flex font-semibold text-teal-deep">Read the review page</Link>
        </div>
      </section>
      <section className="bg-sky py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
          <div>
            <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">Service areas</h2>
            <p className="mt-3 text-slate">Darwin, Palmerston and the surrounding Northern Territory suburbs. If you are just outside the list, ask — we will say yes or no.</p>
          </div>
          <SuburbChecker areas={db.settings.serviceAreas} />
        </div>
      </section>
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">Questions</h2>
          <div className="mt-8"><FaqList faqs={faqs} /></div>
          <Link href="/faqs" className="mt-4 inline-flex font-semibold text-teal-deep">All FAQs</Link>
        </div>
      </section>
      <section className="bg-white py-16 md:py-24" id="quote">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
          <div>
            <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">Free quote</h2>
            <p className="mt-3 text-slate">Tell us the job and the suburb. We call you back with a fixed price. There is no call-out fee just to get the number.</p>
          </div>
          <QuoteForm services={services} areas={db.settings.serviceAreas} settings={db.settings} />
        </div>
      </section>
    </>
  );
}
