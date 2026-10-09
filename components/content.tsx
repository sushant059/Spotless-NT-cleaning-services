import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, Droplets, MapPin, PawPrint, ShieldCheck, Sparkles, Star, ThumbsUp } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { FadeIn } from "@/components/fade-in";
import { ServiceIcon } from "@/components/icons";
import { Sparkle } from "@/components/art/sparkle";
import { Technician } from "@/components/art/people";
import { BrandIcon } from "@/components/social";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { Faq, Review, Service, Settings } from "@/lib/types";
import { cn, filled, formatDisplayDate, safeHttpUrl } from "@/lib/utils";

export function PageHero({ eyebrow, title, lede, children, crumbs }: { eyebrow: string; title: string; lede: string; children?: React.ReactNode; crumbs?: { href: string; label: string }[] }) {
  return (
    <header className="relative overflow-hidden bg-hero text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
      <Sparkle className="pointer-events-none absolute right-[8%] top-10 h-10 w-10 text-sky" animated />
      <Sparkle className="pointer-events-none absolute right-[16%] top-28 h-5 w-5 text-white/70" animated />
      <div className="container-x relative pb-16 pt-12 md:pb-24 md:pt-16">
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
        <p className="eyebrow text-sky"><Sparkle className="h-3 w-3" /> {eyebrow}</p>
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
        <p className="eyebrow"><Sparkle className="h-3 w-3 text-leaf" /> {eyebrow}</p>
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
    <article className={cn("card flex h-full flex-col p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        {review.source === "google" && <BrandIcon name="google" className="h-5 w-5 text-[#4285F4]" />}
      </div>
      {review.source === "sample" && <p className="mt-3 inline-flex w-fit rounded-full bg-sun-soft px-2.5 py-0.5 text-xs font-bold text-[#8A5A00]">Sample — replace with real reviews</p>}
      <blockquote className="mt-4 flex-1 text-[17px] leading-relaxed text-ink">“{review.text}”</blockquote>
      <footer className="mt-6 flex items-center gap-3 border-t border-line pt-4">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-light font-display font-bold text-brand">{initials || "★"}</span>
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

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service.slug}`} className="group card flex h-full flex-col p-5 transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-light text-brand transition group-hover:bg-brand group-hover:text-white"><ServiceIcon name={service.icon} className="h-6 w-6" /></span>
        {filled(service.priceFrom) && <span className="chip bg-leaf-soft text-leaf-dark">From {service.priceFrom}</span>}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold text-navy">{service.title}</h3>
      <p className="mt-2 flex-1 text-[15px] text-slate">{service.summary}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand">View service <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden /></span>
    </Link>
  );
}

const CATEGORY_TINTS = ["from-brand to-navy", "from-[#2E9BEA] to-brand", "from-leaf-dark to-[#145214]", "from-navy-soft to-navy-deep"];

export function CategoryShowcase({ services }: { services: Service[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {SERVICE_CATEGORIES.map((category, index) => {
        const items = services.filter((service) => service.visible && service.category === category.id);
        if (!items.length) return null;
        return (
          <FadeIn key={category.id} delay={index * 80}>
            <article id={category.id} className="card h-full scroll-mt-28 overflow-hidden">
              <div className={cn("relative overflow-hidden bg-gradient-to-br p-6 text-white", CATEGORY_TINTS[index % CATEGORY_TINTS.length])}>
                <Sparkle className="absolute -right-4 -top-4 h-24 w-24 text-white/10" />
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur"><ServiceIcon name={category.icon} className="h-6 w-6" /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">{items.length} service{items.length === 1 ? "" : "s"}</p>
                    <h3 className="font-display text-2xl font-extrabold">{category.title}</h3>
                  </div>
                </div>
                <p className="mt-3 max-w-md text-white/80">{category.blurb}</p>
              </div>
              <ul className="divide-y divide-line">
                {items.map((service) => (
                  <li key={service.id}>
                    <Link href={`/services/${service.slug}`} className="group flex items-center gap-4 px-6 py-4 hover:bg-mist">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-light text-brand"><ServiceIcon name={service.icon} className="h-5 w-5" /></span>
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([Icon, title, text], index) => (
        <FadeIn key={title} delay={index * 60}>
          <article className="card h-full p-6">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-leaf-soft text-leaf-dark"><Icon className="h-6 w-6" aria-hidden /></span>
            <h3 className="mt-4 font-display text-xl font-bold text-navy">{title}</h3>
            <p className="mt-2 text-slate">{text}</p>
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
          <li className={cn("relative h-full rounded-card p-6", tone === "dark" ? "bg-white/[0.06] ring-1 ring-white/10" : "card")}>
            <span className={cn("font-display text-5xl font-extrabold", tone === "dark" ? "text-sky" : "text-brand/20")}>0{index + 1}</span>
            <h3 className={cn("mt-3 font-display text-xl font-bold", tone === "dark" ? "text-white" : "text-navy")}>{title}</h3>
            <p className={cn("mt-2", tone === "dark" ? "text-white/70" : "text-slate")}>{text}</p>
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
  if (filled(photo)) return <MediaImage src={photo} alt="The Spotless NT team in uniform" className={cn("h-full w-full rounded-card object-cover", className)} />;
  return (
    <div className={cn("relative grid grid-cols-3 items-center gap-2 overflow-hidden rounded-card bg-gradient-to-b from-sky-soft to-mist px-4 py-14", className)}>
      <Technician variant={1} className="translate-y-4" />
      <Technician variant={0} className="scale-110" />
      <Technician variant={2} className="translate-y-4" />
      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate">Illustration</span>
    </div>
  );
}

export function CtaBand({ settings }: { settings: Settings }) {
  return (
    <section className="section">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[36px] bg-hero p-8 text-white md:p-14">
          <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
          <Sparkle className="absolute right-10 top-10 h-12 w-12 text-sky" animated />
          <Sparkle className="absolute bottom-10 right-1/3 h-6 w-6 text-leaf" animated />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <h2 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">Let’s make it spotless.</h2>
              <p className="mt-4 max-w-xl text-lg text-white/75">Tell us what needs cleaning and get a fixed price, usually the same day. No call-out fee for a quote.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/free-quote" className="inline-flex min-h-14 items-center justify-center rounded-full bg-leaf-dark px-6 text-lg font-bold text-white hover:bg-[#1d6a19]">Get my free quote</Link>
              <button type="button" data-open-chat className="inline-flex min-h-14 items-center justify-center rounded-full bg-white px-6 text-lg font-bold text-navy hover:bg-brand-light">Chat with us now</button>
              <a href={`tel:${settings.phoneTel}`} className="text-center font-semibold text-white/80 hover:text-white">or call {settings.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
