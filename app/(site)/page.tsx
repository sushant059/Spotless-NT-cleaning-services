import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, MessageSquareText, Phone, ShieldCheck, Star, ThumbsUp } from "lucide-react";
import { CtaBand, FaqList, GoogleReviewButton, ReviewCard, SectionHeading, ServiceCard, Steps, TeamVisual } from "@/components/content";
import { FadeIn } from "@/components/fade-in";
import { SuburbChecker } from "@/components/home/interactive";
import { BackgroundVideo, Photo } from "@/components/photo";
import { OfferCard } from "@/components/offers";
import { whatsappHref } from "@/components/social";
import { serviceStock, STOCK, STOCK_CLIPS } from "@/lib/stock";
import { getDb } from "@/lib/store";
import { byOrder, filled } from "@/lib/utils";
import { isOfferLive } from "@/lib/validators";

const BOND_SLUG = "end-of-lease-and-bond-cleaning";

export default async function HomePage() {
  const db = await getDb();
  const s = db.settings;
  const offers = byOrder(db.offers).filter((offer) => isOfferLive(offer));
  const services = byOrder(db.services).filter((service) => service.visible);
  const reviews = byOrder(db.reviews).filter((review) => review.status === "approved").slice(0, 3);
  const faqs = byOrder(db.faqs).slice(0, 5);
  const bond = services.find((service) => service.slug === BOND_SLUG);
  // Admin can set the hero to their own photo, or to a video file, which then plays instead of the stock clip.
  const heroIsPhoto = filled(s.heroImage) && !/\.(mp4|webm|mov)(\?|$)/i.test(s.heroImage);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy-deep text-white">
        {heroIsPhoto ? (
          <Photo src={s.heroImage} fill priority sizes="100vw" className="-z-20" />
        ) : (
          <BackgroundVideo clip={STOCK_CLIPS[1]} src={s.heroImage} className="-z-20" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep/95 via-navy-deep/75 to-navy-deep/30" aria-hidden />
        <div className="container-x grid items-center gap-10 py-14 sm:py-20 lg:min-h-[640px] lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:py-24">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-leaf" /> Darwin & Palmerston · locally owned
            </p>
            <h1 className="mt-6 text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-[68px]">{s.heroHeadline}</h1>
            <p className="mt-5 max-w-xl text-lg text-white/80 md:text-xl">{s.heroSubtext}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/free-quote" className="press inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-leaf px-7 text-lg font-bold text-white transition hover:bg-leaf-dark">Get a free quote <ArrowRight className="h-5 w-5" aria-hidden /></Link>
              <button type="button" data-open-chat className="press inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-lg font-bold text-navy transition hover:bg-brand-light"><MessageSquareText className="h-5 w-5" aria-hidden /> Book in chat</button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px] font-medium text-white/85">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-leaf" aria-hidden /> Fixed price upfront</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-leaf" aria-hidden /> Kid & pet safe</span>
              <a href={`tel:${s.phoneTel}`} className="flex items-center gap-2 hover:text-white"><Phone className="h-5 w-5 text-leaf" aria-hidden /> {s.phoneDisplay}</a>
            </div>
          </div>

          {/* Photo collage with gentle motion */}
          <div className="relative mx-auto hidden h-[480px] w-full max-w-[520px] lg:block" aria-hidden>
            <div className="absolute right-0 top-0 h-[300px] w-[260px] animate-floaty overflow-hidden rounded-[28px] shadow-soft ring-4 ring-white/10">
              <Photo stock={STOCK.carpet} fill sizes="260px" />
            </div>
            <div className="absolute left-0 top-24 h-[260px] w-[230px] animate-floaty overflow-hidden rounded-[28px] shadow-soft ring-4 ring-white/10 [animation-delay:-2s]">
              <Photo stock={STOCK.sofa} fill sizes="230px" />
            </div>
            <div className="absolute bottom-0 right-10 h-[190px] w-[250px] animate-floaty overflow-hidden rounded-[28px] shadow-soft ring-4 ring-white/10 [animation-delay:-4s]">
              <Photo stock={STOCK.mattress} fill sizes="250px" />
            </div>
            <div className="absolute left-6 top-4 flex animate-pop items-center gap-2.5 rounded-2xl bg-white px-4 py-3 text-ink shadow-lift [animation-delay:.5s]">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-leaf-soft text-leaf-dark"><ShieldCheck className="h-5 w-5" /></span>
              <span className="text-sm font-bold leading-tight text-navy">Kid & pet safe<span className="block text-xs font-medium text-slate">products</span></span>
            </div>
            <div className="absolute bottom-12 left-2 flex animate-pop items-center gap-2.5 rounded-2xl bg-white px-4 py-3 text-ink shadow-lift [animation-delay:.9s]">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-light text-brand"><CalendarCheck className="h-5 w-5" /></span>
              <span className="text-sm font-bold leading-tight text-navy">Fixed quote<span className="block text-xs font-medium text-slate">before we start</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Our services" title="What can we clean for you?" lede="Carpets, lounges, mattresses, rentals and offices. Every job gets a fixed price before we start." action={<Link href="/services" className="link-arrow">All services <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />

          {/* Phones: compact cards */}
          <ul className="mt-8 grid gap-3 sm:hidden">
            {services.map((service, index) => (
              <li key={service.id}>
                <FadeIn from={index % 2 ? "right" : "left"}>
                  <Link href={`/services/${service.slug}`} className="card press flex items-center gap-3 p-2.5 pr-4">
                    <span className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] bg-mist"><Photo src={service.image} stock={serviceStock(service.slug)} fill sizes="72px" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold leading-snug text-navy">{service.title}</span>
                      <span className="mt-0.5 block line-clamp-1 text-sm text-slate">{service.summary}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-brand" aria-hidden />
                  </Link>
                </FadeIn>
              </li>
            ))}
          </ul>

          {/* Tablet and up: photo cards */}
          <div className="mt-10 hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <FadeIn key={service.id} from="zoom" delay={(index % 3) * 110}><ServiceCard service={service} /></FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Bond cleaning spotlight */}
      {bond && (
        <section className="section bg-sand">
          <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <FadeIn from="left">
              <div className="relative aspect-[4/3] overflow-hidden rounded-card shadow-soft">
                <Photo src={bond.image} stock={STOCK.bond} alt="An empty rental ready for inspection" fill sizes="(max-width: 1024px) 100vw, 50vw" />
                <div className="absolute bottom-4 left-4 flex animate-floaty items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-lift">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-leaf-soft text-leaf-dark"><CheckCircle2 className="h-5 w-5" aria-hidden /></span>
                  <span className="text-sm font-bold leading-tight text-navy">Inspection ready<span className="block text-xs font-medium text-slate">receipt for your agent</span></span>
                </div>
              </div>
            </FadeIn>
            <FadeIn from="right">
              <p className="eyebrow"><span className="h-0.5 w-5 rounded-full bg-current" aria-hidden /> Moving out?</p>
              <h2 className="h-section mt-3">Bond cleaning, done right.</h2>
              <p className="lede">Inspection-ready carpets for your rental hand-back, with a receipt and a short job note you can pass to the property manager.</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {["Hot-water extraction, every room you book", "Lounge & mattress add-ons", "Receipt & job note for the agent", "Timed for your hand-back day"].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-medium text-navy"><CheckCircle2 className="h-5 w-5 shrink-0 text-leaf" aria-hidden /> {item}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/free-quote?service=${bond.slug}`} className="press inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-navy px-6 font-bold text-white hover:bg-navy-deep">Quote my bond clean <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                <Link href={`/services/${bond.slug}`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-white px-6 font-bold text-navy hover:border-navy">What’s included</Link>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Why us */}
      <section className="section overflow-hidden">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <FadeIn from="left"><TeamVisual photo={s.teamPhoto} /></FadeIn>
          <div>
            <SectionHeading eyebrow="Why Territory Spotless" title="A local crew you’ll be happy to let in." lede="Uniformed, friendly and careful in your home. We work in Top End humidity every day, so our drying advice actually fits." />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
              {[
                [ShieldCheck, "Commercial-grade gear", "Truck-quality extractors, not a hire-shop machine."],
                [ThumbsUp, "Honest, fixed pricing", "You hear the price before we start."],
                [CalendarCheck, "Flexible times", "Early starts, Saturdays and same-day when free."],
                [Star, "Straight talk", "If a stain is permanent, we tell you up front."],
              ].map(([Icon, title, text], index) => {
                const I = Icon as typeof ShieldCheck;
                return (
                  <FadeIn key={title as string} from="zoom" delay={index * 90}>
                    <div className="card h-full p-4 transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-5">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-leaf-soft text-leaf-dark sm:h-11 sm:w-11"><I className="h-5 w-5" aria-hidden /></span>
                      <h3 className="mt-3 text-base font-bold leading-snug text-navy sm:mt-4 sm:text-lg">{title as string}</h3>
                      <p className="mt-1 text-sm text-slate sm:text-[15px]">{text as string}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-mist">
        <div className="container-x">
          <SectionHeading eyebrow="How it works" title="Booked in four easy steps." align="center" />
          <div className="mt-10"><Steps /></div>
        </div>
      </section>

      {/* Offers */}
      {offers.length > 0 && (
        <section className="section bg-sand">
          <div className="container-x">
            <SectionHeading eyebrow="Current offers" title="Specials running right now" action={<Link href="/offers" className="link-arrow">All offers <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {offers.slice(0, 3).map((offer, index) => <FadeIn key={offer.id} from="zoom" delay={index * 100}><OfferCard offer={offer} featured={index === 0} /></FadeIn>)}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="section">
        <div className="container-x">
          <SectionHeading
            eyebrow="Reviews"
            title={reviews.length ? "What Top End customers say" : "Had a clean with us?"}
            lede={reviews.length ? undefined : "We’re a new local business and every review helps. Tell other Darwin families how we went."}
            action={
              <div className="flex flex-wrap gap-3">
                <Link href="/reviews#write" className="inline-flex min-h-12 items-center rounded-full bg-navy px-5 font-semibold text-white hover:bg-navy-deep">Leave a review</Link>
                <GoogleReviewButton settings={s} />
              </div>
            }
          />
          {reviews.length > 0 && (
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {reviews.map((review, index) => <FadeIn key={review.id} from="zoom" delay={index * 100}><ReviewCard review={review} /></FadeIn>)}
            </div>
          )}
        </div>
      </section>

      {/* Areas */}
      <section className="section bg-mist">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Service area" title="Darwin, Palmerston & the rural area." lede="From the CBD to Humpty Doo. If you’re just outside, ask. We’ll give you a straight yes or no." />
            <div className="mt-6 flex flex-wrap gap-2">
              {s.serviceAreas.slice(0, 12).map((area) => <span key={area} className="chip border border-line bg-white text-navy">{area}</span>)}
              {s.serviceAreas.length > 12 && <span className="chip bg-brand-light text-brand">+{s.serviceAreas.length - 12} more</span>}
            </div>
          </div>
          <FadeIn from="right"><SuburbChecker areas={s.serviceAreas} /></FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
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
