import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, Droplets, MapPin, PawPrint, ShieldCheck, Sparkles, Star, ThumbsUp } from "lucide-react";
import { Photo } from "@/components/photo";
import { FadeIn } from "@/components/fade-in";
import { ServiceIcon } from "@/components/icons";
import { Sparkle } from "@/components/art/sparkle";
import { BrandIcon } from "@/components/social";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { categoryStock, serviceStock, STOCK, type StockImage } from "@/lib/stock";
import type { Faq, Review, Service, Settings } from "@/lib/types";
import { cn, filled, formatDisplayDate, safeHttpUrl } from "@/lib/utils";

export function PageHero({ eyebrow, title, lede, children, crumbs, image = STOCK.living, src }: { eyebrow: string; title: string; lede: string; children?: React.ReactNode; crumbs?: { href: string; label: string }[]; image?: StockImage[]; src?: string }) {
  return (
    <header className="relative isolate overflow-hidden bg-navy-deep text-white">
      <Photo src={src} stock={image} fill priority sizes="100vw" className="-z-20 animate-kenburns" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy/40" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" aria-hidden />
      <Sparkle className="pointer-events-none absolute right-[8%] top-10 hidden h-10 w-10 text-sky md:block" animated />
      <div className="container-x relative pb-20 pt-12 md:pb-32 md:pt-20">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/60">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              {crumbs.map((crumb) => (
                <li key={crumb.href} className="flex items-center gap-1.5"><span aria-hidden>/</span><Link href={crumb.href} className="hover:text-white">{crumb.label}</Link></li>
              ))}
            </ol>
          </nav>
        )}
        <p className="eyebrow text-sky"><span className="h-0.5 w-5 rounded-full bg-current" aria-hidden /> {eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-[40px] font-extrabold leading-[1.04] md:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-white/75">{lede}</p>
        {children}
      </div>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute -bottom-px left-0 h-8 w-full md:h-14" aria-hidden><path d="M0 60V30C240 0 480 0 720 22s480 30 720 0v38Z" fill="#fff" /></svg>
    </header>
  );
}

export function SectionHeading({ eyebrow, title, lede, align = "left", action }: { eyebrow: string; title: string; lede?: string; align?: "left" | "center"; action?: React.ReactNode }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-6", align === "center" && "flex-col items-center text-center")}>
      <div className={cn(align === "center" && "flex flex-col items-center")}>
        <p className="eyebrow"><span className="h-0.5 w-5 rounded-full bg-current" aria-hidden /> {eyebrow}</p>
        <h2 className="h-section mt-3 max-w-3xl">{title}</h2>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5 text-sun", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star key={value} className={cn("h-4 w-4", value <= rating ? "fill-current" : "fill-transparent text-line")} aria-hidden />
      ))}
    </span>
  );
}

export function ReviewCard({ review, className }: { review: Review; className?: string }) {
  const initials = review.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <article className={cn("card flex h-full min-w-0 flex-col p-5 sm:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        {review.source === "google" && <BrandIcon name="google" className="h-5 w-5 text-[#4285F4]" />}
      </div>
      {review.source === "sample" && <p className="mt-3 inline-flex w-fit rounded-full bg-sun-soft px-2.5 py-0.5 text-xs font-bold text-[#8A5A00]">Sample — replace with real reviews</p>}
      <blockquote className="mt-4 flex-1 text-[17px] leading-relaxed text-ink">“{review.text}”</blockquote>
      <footer className="mt-6 flex items-center gap-3 border-t border-line pt-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-light font-display font-bold text-brand">{initials || "★"}</span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 font-semibold text-navy">{review.name}{review.source === "customer" && <BadgeCheck className="h-4 w-4 text-leaf" aria-label="Verified customer" />}</span>
          <span className="block truncate text-sm text-slate">{[review.service, review.suburb, review.date && formatDisplayDate(review.date)].filter(Boolean).join(" · ")}</span>
        </span>
      </footer>
    </article>
  );
}

/** Google review buttons. Shown even before the Google Business profile exists, using a Maps search as a placeholder. */
export function GoogleReviewButton({ settings, className, label = "Review us on Google" }: { settings: Settings; className?: string; label?: string }) {
  const href = safeHttpUrl(settings.google) || `https://www.google.com/maps/search/${encodeURIComponent(`${settings.businessName} Darwin`)}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn("inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border-2 border-line bg-white px-5 font-semibold text-navy transition hover:border-[#4285F4]", className)}>
      <BrandIcon name="google" className="h-5 w-5 text-[#4285F4]" /> {label}
    </a>
  );
}

const TRUST = [
  [ShieldCheck, "Commercial-grade equipment"],
  [Droplets, "Fast-drying methods"],
  [PawPrint, "Kid & pet friendly products"],
  [CalendarCheck, "Same-day when available"],
  [ThumbsUp, "Fixed price before we start"],
  [MapPin, "Locally owned in Darwin"],
] as const;

export function TrustMarquee() {
  const row = [...TRUST, ...TRUST];
  return (
    <section className="overflow-hidden border-y border-line bg-mist py-4" aria-label="What you can expect">
      <ul className="flex w-max animate-marquee gap-10 pr-10 hover:[animation-play-state:paused]">
        {row.map(([Icon, label], index) => (
          <li key={`${label}-${index}`} className="flex shrink-0 items-center gap-2.5 font-semibold text-navy" aria-hidden={index >= TRUST.length}>
            <Icon className="h-5 w-5 text-leaf-dark" aria-hidden /> {label}
            <Sparkle className="ml-8 h-3 w-3 text-sky" />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ServiceCard({ service, className }: { service: Service; className?: string }) {
  return (
    <Link href={`/services/${service.slug}`} className={cn("group card flex h-full flex-col overflow-hidden transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lift", className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-mist">
        <Photo src={service.image} stock={serviceStock(service.slug)} alt={service.title} fill sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw" className="transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/50 via-transparent to-transparent" aria-hidden />
        <span className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/95 text-brand shadow-card"><ServiceIcon name={service.icon} className="h-5 w-5" /></span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold text-navy">{service.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[15px] text-slate">{service.summary}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand">View service <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden /></span>
      </div>
    </Link>
  );
}

export function CategoryShowcase({ services }: { services: Service[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {SERVICE_CATEGORIES.map((category, index) => {
        const items = services.filter((service) => service.visible && service.category === category.id);
        if (!items.length) return null;
        return (
          <FadeIn key={category.id} delay={index * 80}>
            <article id={category.id} className="card h-full scroll-mt-28 overflow-hidden">
              <div className="relative isolate flex min-h-[230px] flex-col justify-end overflow-hidden p-6 text-white md:min-h-[280px]">
                <Photo stock={categoryStock(category.id)} alt={category.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="-z-20" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-navy-deep/5" aria-hidden />
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur"><ServiceIcon name={category.icon} className="h-6 w-6" /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">{items.length} service{items.length === 1 ? "" : "s"}</p>
                    <h3 className="font-display text-2xl font-extrabold md:text-3xl">{category.title}</h3>
                  </div>
                </div>
                <p className="mt-3 max-w-md text-white/85">{category.blurb}</p>
              </div>
              <ul className="divide-y divide-line">
                {items.map((service) => (
                  <li key={service.id}>
                    <Link href={`/services/${service.slug}`} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-mist sm:px-6">
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mist"><Photo src={service.image} stock={serviceStock(service.slug)} fill sizes="56px" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-navy group-hover:text-brand">{service.title}</span>
                        <span className="block truncate text-sm text-slate">{service.summary}</span>
                      </span>
                      <ArrowRight className="h-5 w-5 shrink-0 text-brand transition group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          </FadeIn>
        );
      })}
    </div>
  );
}

export function Pillars() {
  const items = [
    [ShieldCheck, "Commercial-grade gear", "Truck-quality extractors and upholstery tools, not a hire-shop machine."],
    [PawPrint, "Safe for kids & pets", "Products chosen for family homes, with clear advice on when a room is ready."],
    [ThumbsUp, "Fixed, honest pricing", "You hear the price before we start. If the job changes, we agree it first."],
    [MapPin, "Top End locals", "We work in Darwin humidity every day, so our drying advice actually fits."],
    [CalendarCheck, "Flexible booking", "Early starts, Saturdays and same-day slots when the diary allows."],
    [Sparkles, "Straight talk on results", "If a stain is permanent we tell you up front, rather than over-promise."],
  ] as const;
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {items.map(([Icon, title, text], index) => (
        <FadeIn key={title} delay={index * 60}>
          <article className="card group flex h-full gap-4 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-soft sm:block sm:p-6">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-leaf-soft text-leaf-dark transition duration-500 group-hover:rotate-[8deg] group-hover:scale-110"><Icon className="h-6 w-6" aria-hidden /></span>
            <span className="block min-w-0">
              <h3 className="font-display text-lg font-bold text-navy sm:mt-4 sm:text-xl">{title}</h3>
              <p className="mt-1 text-[15px] text-slate sm:mt-2 sm:text-base">{text}</p>
            </span>
          </article>
        </FadeIn>
      ))}
    </div>
  );
}

export function Steps({ tone = "light" }: { tone?: "light" | "dark" }) {
  const steps = [
    ["Tell us the job", "Chat, call, WhatsApp or the quote form. Rooms, items and suburb is all we need."],
    ["Get a fixed price", "We confirm the price and a time that suits you. No surprises on the day."],
    ["We clean it properly", "Inspect, pre-treat, extract and groom, then walk you through the result."],
    ["Enjoy a fresher home", "Clear drying advice before we leave, and we follow up if anything's not right."],
  ];
  return (
    <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {steps.map(([title, text], index) => (
        <FadeIn key={title} delay={index * 80}>
          <li className={cn("relative flex h-full gap-4 rounded-card p-5 transition duration-300 hover:-translate-y-1 md:block md:p-6", tone === "dark" ? "bg-white/[0.06] ring-1 ring-white/10" : "card hover:shadow-lift")}>
            <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg font-extrabold md:h-12 md:w-12", tone === "dark" ? "bg-sky/20 text-sky" : "bg-brand-light text-brand")}>{index + 1}</span>
            <span className="block min-w-0">
              <h3 className={cn("font-display text-lg font-bold md:mt-4 md:text-xl", tone === "dark" ? "text-white" : "text-navy")}>{title}</h3>
              <p className={cn("mt-1 md:mt-2", tone === "dark" ? "text-white/70" : "text-slate")}>{text}</p>
            </span>
          </li>
        </FadeIn>
      ))}
    </ol>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <details key={faq.id} className="group card overflow-hidden open:shadow-soft">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-display text-lg font-bold text-navy [&::-webkit-details-marker]:hidden">
            {faq.question}
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-light text-brand transition group-open:rotate-45" aria-hidden>+</span>
          </summary>
          <p className="px-6 pb-6 text-slate">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function AreaList({ areas }: { areas: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {areas.map((area) => (
        <li key={area} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-sm text-navy"><MapPin className="h-3.5 w-3.5 text-leaf-dark" aria-hidden />{area}</li>
      ))}
    </ul>
  );
}

export function TeamVisual({ photo, className }: { photo: string; className?: string }) {
  return (
    <div className={cn("relative grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4", className)}>
      <div className="relative col-span-3 row-span-6 min-h-[340px] overflow-hidden rounded-card shadow-soft sm:min-h-[460px]">
        <Photo src={photo} stock={STOCK.team} alt="A Territory Spotless style cleaning crew" fill sizes="(max-width: 1024px) 60vw, 30vw" />
      </div>
      <div className="relative col-span-2 row-span-3 overflow-hidden rounded-card shadow-card">
        <Photo stock={STOCK.carpet} alt="Carpet cleaning in progress" fill sizes="(max-width: 1024px) 40vw, 20vw" />
      </div>
      <div className="relative col-span-2 row-span-3 overflow-hidden rounded-card shadow-card">
        <Photo stock={STOCK.sofa} alt="Sofa cleaning in progress" fill sizes="(max-width: 1024px) 40vw, 20vw" />
      </div>
      <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-soft sm:left-6">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-leaf-soft text-leaf-dark"><ShieldCheck className="h-6 w-6" aria-hidden /></span>
        <span><span className="block font-display font-extrabold text-navy">Uniformed & local</span><span className="text-sm text-slate">Darwin owned and operated</span></span>
      </div>
    </div>
  );
}

export function CtaBand({ settings }: { settings: Settings }) {
  return (
    <section className="section">
      <div className="container-x">
        <div className="relative isolate overflow-hidden rounded-[28px] p-7 text-white sm:p-10 md:p-14">
          <Photo stock={STOCK.living} fill sizes="100vw" className="-z-20" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep via-navy-deep/90 to-navy/60" aria-hidden />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <h2 className="font-display text-[34px] font-extrabold leading-tight md:text-5xl">Let’s make it spotless.</h2>
              <p className="mt-4 max-w-xl text-lg text-white/80">Tell us what needs cleaning and get a fixed price, usually the same day. No call-out fee for a quote.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/free-quote" className="inline-flex min-h-14 items-center justify-center rounded-full bg-leaf-dark px-6 text-lg font-bold text-white hover:bg-leaf">Get my free quote</Link>
              <button type="button" data-open-chat className="inline-flex min-h-14 items-center justify-center rounded-full bg-white px-6 text-lg font-bold text-navy hover:bg-brand-light">Chat with us now</button>
              <a href={`tel:${settings.phoneTel}`} className="text-center font-semibold text-white/85 hover:text-white">or call {settings.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
