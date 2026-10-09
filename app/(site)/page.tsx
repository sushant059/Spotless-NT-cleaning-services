import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, MessageSquareText, Phone, ShieldCheck } from "lucide-react";
import { BeforeAfter } from "@/components/before-after";
import { CategoryShowcase, CtaBand, FaqList, GoogleReviewButton, Pillars, ReviewCard, SectionHeading, Steps, TeamVisual, TrustMarquee } from "@/components/content";
import { FadeIn } from "@/components/fade-in";
import { SuburbChecker, VideoShowcase } from "@/components/home/interactive";
import { MediaImage } from "@/components/media-image";
import { OfferCard } from "@/components/offers";
import { ServiceIcon } from "@/components/icons";
import { Sparkle } from "@/components/art/sparkle";
import { Technician } from "@/components/art/people";
import { whatsappHref } from "@/components/social";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { getDb } from "@/lib/store";
import { byOrder, filled } from "@/lib/utils";
import { isOfferLive } from "@/lib/validators";

export default async function HomePage() {
  const db = await getDb();
  const s = db.settings;
  const offers = byOrder(db.offers).filter((offer) => isOfferLive(offer));
  const services = byOrder(db.services).filter((service) => service.visible);
  const results = byOrder(db.results);
  const reviews = byOrder(db.reviews).filter((review) => review.status === "approved").slice(0, 3);
  const faqs = byOrder(db.faqs).slice(0, 5);
  const [featured, ...moreResults] = results;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
        <div className="container-x relative grid items-center gap-12 pb-24 pt-12 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:pb-32">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-sky-soft ring-1 ring-white/15">
              <span className="h-2 w-2 animate-pulse rounded-full bg-leaf" /> Taking bookings across Darwin & Palmerston
            </p>
            <h1 className="mt-6 font-display text-[44px] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              {s.heroHeadline.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="relative whitespace-nowrap text-sky">
                {s.heroHeadline.split(" ").slice(-2).join(" ")}
                <Sparkle className="absolute -right-7 -top-4 h-7 w-7 text-leaf" animated />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/75 md:text-xl">{s.heroSubtext}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/free-quote" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-leaf-dark px-7 text-lg font-bold text-white shadow-[0_14px_30px_-12px_rgba(59,169,53,.9)] transition hover:bg-[#1d6a19]">Get a free quote <ArrowRight className="h-5 w-5" aria-hidden /></Link>
              <button type="button" data-open-chat className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-lg font-bold text-navy transition hover:bg-brand-light"><MessageSquareText className="h-5 w-5" aria-hidden /> Book in chat</button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/80">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-leaf" aria-hidden /> Fixed price, no call-out fee</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-leaf" aria-hidden /> Kid & pet friendly</span>
              <a href={`tel:${s.phoneTel}`} className="flex items-center gap-2 hover:text-white"><Phone className="h-5 w-5 text-leaf" aria-hidden /> {s.phoneDisplay}</a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            {filled(s.heroImage) ? (
              <MediaImage src={s.heroImage} alt="Spotless NT cleaning a Darwin home" className="aspect-[4/5] w-full rounded-[36px] object-cover shadow-soft" />
            ) : (
              <div className="relative">
                <Technician variant={0} className="w-full animate-floaty drop-shadow-2xl" title="A Spotless NT technician in the branded uniform" />
              </div>
            )}
            <div className="absolute -left-4 top-10 hidden animate-rise rounded-2xl bg-white p-4 text-navy shadow-soft sm:block" style={{ animationDelay: ".3s" }}>
              <p className="flex items-center gap-2 text-sm font-bold"><Clock className="h-4 w-4 text-brand" aria-hidden /> Dry in 4–8 hours</p>
              <p className="text-xs text-slate">Most carpets, with good airflow</p>
            </div>
            <div className="absolute -right-2 bottom-16 hidden animate-rise rounded-2xl bg-white p-4 text-navy shadow-soft sm:block" style={{ animationDelay: ".5s" }}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate">Quote ready</p>
              <p className="mt-1 font-display text-lg font-extrabold">3 rooms + hallway</p>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-leaf-dark"><CheckCircle2 className="h-4 w-4" aria-hidden /> Fixed price confirmed</p>
            </div>
          </div>
        </div>
        {/* Quick picker */}
        <div className="container-x relative -mb-px">
          <div className="grid grid-cols-2 gap-2 rounded-t-[28px] bg-white p-3 text-navy shadow-soft md:grid-cols-4 md:p-4">
            {SERVICE_CATEGORIES.map((category) => (
              <Link key={category.id} href={`/services#${category.id}`} className="group flex items-center gap-3 rounded-2xl p-3 transition hover:bg-mist">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-light text-brand transition group-hover:bg-brand group-hover:text-white"><ServiceIcon name={category.icon} className="h-5 w-5" /></span>
                <span className="min-w-0"><span className="block font-display font-bold leading-tight">{category.title}</span><span className="hidden text-xs text-slate sm:block">View services →</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TrustMarquee />

      {/* Services by category */}
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="What we clean" title="Every service, neatly sorted." lede="Pick a category to see exactly what’s included, how long it takes and real results." action={<Link href="/services" className="link-arrow">All services <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
          <div className="mt-10"><CategoryShowcase services={services} /></div>
        </div>
      </section>

      {/* Offers */}
      {offers.length > 0 && (
        <section className="section bg-mist">
          <div className="container-x">
            <SectionHeading eyebrow="Current offers" title="Specials running right now" action={<Link href="/offers" className="link-arrow">All offers <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {offers.slice(0, 3).map((offer, index) => <FadeIn key={offer.id} delay={index * 80}><OfferCard offer={offer} featured={index === 0} /></FadeIn>)}
            </div>
          </div>
        </section>
      )}

      {/* Videos */}
      <section className="section relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
        <div className="container-x relative">
          <p className="eyebrow text-sky"><Sparkle className="h-3 w-3 text-leaf" /> Watch us work</p>
          <h2 className="mt-3 max-w-3xl font-display text-[32px] font-extrabold leading-[1.08] md:text-5xl">See the clean, service by service.</h2>
          <p className="mt-4 max-w-2xl text-lg text-white/70">Short clips of carpets, lounges and mattresses coming back to life.</p>
          <div className="mt-10"><VideoShowcase services={services} /></div>
        </div>
      </section>

      {/* Before and after */}
      {featured && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="Before & after" title="Drag the slider. See the difference." action={<Link href="/results" className="link-arrow">Full gallery <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <FadeIn>
                <figure>
                  <BeforeAfter scene={featured.scene || featured.serviceSlug} beforeSrc={featured.beforeImage} afterSrc={featured.afterImage} beforeAlt={`Before: ${featured.caption}`} afterAlt={`After: ${featured.caption}`} className="aspect-[16/11]" />
                  <figcaption className="mt-3 font-semibold text-navy">{featured.caption}</figcaption>
                </figure>
              </FadeIn>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                {moreResults.slice(0, 2).map((item, index) => (
                  <FadeIn key={item.id} delay={index * 100}>
                    <figure>
                      <BeforeAfter scene={item.scene || item.serviceSlug} beforeSrc={item.beforeImage} afterSrc={item.afterImage} beforeAlt={`Before: ${item.caption}`} afterAlt={`After: ${item.caption}`} />
                      <figcaption className="mt-2 text-sm font-semibold text-navy">{item.caption}</figcaption>
                    </figure>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="section bg-navy-deep text-white">
        <div className="container-x">
          <p className="eyebrow text-sky"><Sparkle className="h-3 w-3 text-leaf" /> How it works</p>
          <h2 className="mt-3 font-display text-[32px] font-extrabold leading-[1.08] md:text-5xl">Booked in four easy steps.</h2>
          <div className="mt-10"><Steps tone="dark" /></div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <FadeIn><TeamVisual photo={s.teamPhoto} /></FadeIn>
          <div>
            <SectionHeading eyebrow="Why Spotless NT" title="A local crew you’ll be happy to let in." lede="Uniformed, friendly and careful in your home. Look for the Spotless NT logo on our shirts." />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Uniformed & easy to spot", "Commercial-grade equipment", "Fixed price before we start", "Honest about tough stains"].map((item) => (
                <li key={item} className="flex items-center gap-2 font-semibold text-navy"><CheckCircle2 className="h-5 w-5 shrink-0 text-leaf-dark" aria-hidden /> {item}</li>
              ))}
            </ul>
            <Link href="/why-us" className="link-arrow mt-8">Meet the team <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
        </div>
        <div className="container-x mt-16"><Pillars /></div>
      </section>

      {/* Reviews */}
      <section className="section bg-mist">
        <div className="container-x">
          <SectionHeading
            eyebrow="Reviews"
            title="What Top End customers say"
            action={
              <div className="flex flex-wrap gap-3">
                <Link href="/reviews#write" className="inline-flex min-h-12 items-center rounded-full bg-navy px-5 font-semibold text-white hover:bg-navy-deep">Leave a review</Link>
                <GoogleReviewButton settings={s} />
              </div>
            }
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((review, index) => <FadeIn key={review.id} delay={index * 80}><ReviewCard review={review} /></FadeIn>)}
          </div>
          {reviews.length === 0 && <p className="mt-10 card p-6 text-slate">Be the first to leave a review.</p>}
        </div>
      </section>

      {/* Areas */}
      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Service area" title="Darwin, Palmerston & the rural area." lede="From the CBD to Humpty Doo. If you’re just outside, ask. We’ll give you a straight yes or no." />
            <div className="mt-6 flex flex-wrap gap-2">
              {s.serviceAreas.slice(0, 14).map((area) => <span key={area} className="chip border border-line bg-white text-navy">{area}</span>)}
              <span className="chip bg-brand-light text-brand">+{Math.max(0, s.serviceAreas.length - 14)} more</span>
            </div>
          </div>
          <SuburbChecker areas={s.serviceAreas} />
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-mist">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeading eyebrow="FAQs" title="Good questions, straight answers." />
            <p className="mt-4 text-slate">Can’t see yours? Ask our chat assistant or message us on <a href={whatsappHref(s)} className="font-semibold text-brand underline" target="_blank" rel="noopener noreferrer">WhatsApp</a>.</p>
            <Link href="/faqs" className="link-arrow mt-6">All FAQs <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <FaqList faqs={faqs} />
        </div>
      </section>

      <CtaBand settings={s} />
    </>
  );
}
