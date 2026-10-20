import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, MessageSquareText, Phone, ShieldCheck } from "lucide-react";
import { BeforeAfter } from "@/components/before-after";
import { CategoryShowcase, CtaBand, FaqList, GoogleReviewButton, Pillars, ReviewCard, SectionHeading, ServiceCard, TeamVisual, TrustMarquee } from "@/components/content";
import { Bubbles } from "@/components/clean/bubbles";
import { CountUp } from "@/components/clean/count-up";
import { ProcessPath } from "@/components/clean/process-path";
import { ScrubGame } from "@/components/clean/scrub-game";
import { WipeReveal } from "@/components/clean/wipe-reveal";
import { FadeIn } from "@/components/fade-in";
import { SuburbChecker, VideoShowcase } from "@/components/home/interactive";
import { BackgroundVideo, Photo } from "@/components/photo";
import { OfferCard } from "@/components/offers";
import { ServiceIcon } from "@/components/icons";
import { Sparkle } from "@/components/art/sparkle";
import { whatsappHref } from "@/components/social";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { categoryStock, STOCK, STOCK_CLIPS } from "@/lib/stock";
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
  // Admin can set the hero to their own photo, or to a video file, which then plays instead of the stock clip.
  const heroIsPhoto = filled(s.heroImage) && !/\.(mp4|webm|mov)(\?|$)/i.test(s.heroImage);

  return (
    <>
      {/* Hero: full-bleed video with the booking shortcuts on top */}
      <section className="relative isolate overflow-hidden bg-navy-deep text-white">
        {heroIsPhoto ? (
          <Photo src={s.heroImage} fill priority sizes="100vw" className="-z-20" />
        ) : (
          <BackgroundVideo clip={STOCK_CLIPS[1]} src={s.heroImage} className="-z-20" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep via-navy-deep/80 to-navy-deep/20" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep via-transparent to-navy-deep/40" aria-hidden />
        <Bubbles className="-z-10" />
        <div className="container-x grid min-h-[calc(100svh-120px)] items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.25fr_1fr]">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-sky-soft ring-1 ring-white/20 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-leaf" /> Taking bookings across Darwin & Palmerston
            </p>
            <h1 className="mt-6 font-display text-[42px] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              {s.heroHeadline.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="relative whitespace-nowrap text-sky">
                {s.heroHeadline.split(" ").slice(-2).join(" ")}
                <Sparkle className="absolute -right-7 -top-4 hidden h-7 w-7 text-leaf sm:block" animated />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/85 md:text-xl">{s.heroSubtext}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/free-quote" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-leaf-dark px-7 text-lg font-bold text-white shadow-[0_14px_30px_-12px_rgba(59,169,53,.9)] transition hover:bg-[#1d6a19]">Get a free quote <ArrowRight className="h-5 w-5" aria-hidden /></Link>
              <button type="button" data-open-chat className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white/95 px-7 text-lg font-bold text-navy transition hover:bg-white"><MessageSquareText className="h-5 w-5" aria-hidden /> Book in chat</button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/85">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-leaf" aria-hidden /> Fixed price, no call-out fee</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-leaf" aria-hidden /> Kid & pet friendly</span>
              <a href={`tel:${s.phoneTel}`} className="flex items-center gap-2 hover:text-white"><Phone className="h-5 w-5 text-leaf" aria-hidden /> {s.phoneDisplay}</a>
            </div>
          </div>

          {/* Quick picker */}
          <div className="rounded-[28px] bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-md sm:p-5">
            <p className="flex items-center justify-between gap-3 px-1 font-display text-lg font-bold">What needs cleaning? <Clock className="h-5 w-5 text-sky" aria-hidden /></p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {SERVICE_CATEGORIES.map((category) => (
                <Link key={category.id} href={`/services#${category.id}`} className="group relative isolate flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl p-3 ring-1 ring-white/15">
                  <Photo stock={categoryStock(category.id)} alt="" fill sizes="(max-width: 1024px) 45vw, 20vw" className="-z-20 transition duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep/95 via-navy-deep/40 to-transparent" aria-hidden />
                  <ServiceIcon name={category.icon} className="h-5 w-5 text-sky" />
                  <span className="mt-1 font-display text-[15px] font-bold leading-tight sm:text-base">{category.title}</span>
                </Link>
              ))}
            </div>
            <Link href="/booking" className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white font-bold text-navy hover:bg-brand-light">Pick a date & time <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
        </div>

        {/* Promise strip */}
        <div className="border-t border-white/15 bg-navy-deep/60 backdrop-blur">
          <dl className="container-x grid grid-cols-2 gap-y-4 py-5 md:grid-cols-4">
            {[
              [`${services.length}`, "specialist services"],
              [`${s.serviceAreas.length}+`, "suburbs covered"],
              ["$0", "call-out for a quote"],
              ["4–8 hrs", "typical carpet drying"],
            ].map(([value, label]) => (
              <div key={label} className="px-2 text-center md:border-l md:border-white/15 md:first:border-l-0">
                <dd className="font-display text-2xl font-extrabold text-white md:text-3xl"><CountUp value={value} /></dd>
                <dt className="text-sm text-white/70">{label}</dt>
              </div>
            ))}
          </dl>
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

      {/* All services, swipeable on phones */}
      <section className="section bg-mist">
        <div className="container-x">
          <SectionHeading eyebrow="Popular services" title="Pick a service, get a fixed price." action={<Link href="/free-quote" className="link-arrow">Get a quote <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
        </div>
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-8">
          {services.slice(0, 6).map((service) => (
            <div key={service.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-auto"><ServiceCard service={service} /></div>
          ))}
        </div>
      </section>

      <WipeReveal />

      {/* Offers */}
      {offers.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="Current offers" title="Specials running right now" action={<Link href="/offers" className="link-arrow">All offers <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {offers.slice(0, 3).map((offer, index) => <FadeIn key={offer.id} delay={index * 80}><OfferCard offer={offer} featured={index === 0} /></FadeIn>)}
            </div>
          </div>
        </section>
      )}

      {/* Videos */}
      <section className="section relative isolate overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid" aria-hidden />
        <div className="container-x">
          <p className="eyebrow text-sky"><Sparkle className="h-3 w-3 text-leaf" /> Watch us work</p>
          <h2 className="mt-3 max-w-3xl font-display text-[32px] font-extrabold leading-[1.08] md:text-5xl">See the clean, service by service.</h2>
          <p className="mt-4 max-w-2xl text-lg text-white/75">Short clips of carpets, lounges and homes coming back to life.</p>
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

      <ScrubGame />

      {/* Team */}
      <section className="section overflow-hidden bg-mist">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <FadeIn><TeamVisual photo={s.teamPhoto} /></FadeIn>
          <div>
            <SectionHeading eyebrow="Why Spotless NT" title="A local crew you’ll be happy to let in." lede="Uniformed, friendly and careful in your home. Look for the Spotless NT logo on our shirts." />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Uniformed & easy to spot", "Commercial-grade equipment", "Fixed price before we start", "Honest about tough stains"].map((item) => (
                <li key={item} className="flex items-center gap-3 rounded-2xl bg-mist p-3 font-semibold text-navy"><CheckCircle2 className="h-5 w-5 shrink-0 text-leaf-dark" aria-hidden /> {item}</li>
              ))}
            </ul>
            <Link href="/why-us" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 font-bold text-white hover:bg-navy-deep">Meet the team <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
        </div>
      </section>

      {/* How it works over a photo */}
      <section className="section relative isolate overflow-hidden text-white">
        <Photo stock={STOCK.crew} fill sizes="100vw" className="-z-20" />
        <div className="absolute inset-0 -z-10 bg-navy-deep/85" aria-hidden />
        <Bubbles className="-z-10" count={8} />
        <div className="container-x">
          <p className="eyebrow text-sky"><Sparkle className="h-3 w-3 text-leaf" /> How it works</p>
          <h2 className="mt-3 font-display text-[32px] font-extrabold leading-[1.08] md:text-5xl">Booked in four easy steps.</h2>
          <div className="mt-10 lg:mt-14"><ProcessPath /></div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Our promise" title="What you can count on, every visit." />
          <div className="mt-10"><Pillars /></div>
        </div>
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
