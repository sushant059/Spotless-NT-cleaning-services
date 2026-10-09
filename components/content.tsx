import Link from "next/link";
import { MediaImage } from "@/components/media-image";
import { Check, MapPin, PawPrint, ShieldCheck, Clock, BadgePercent, CalendarCheck } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { ServiceIcon } from "@/components/icons";
import { Wave } from "@/components/waves";
import type { Faq, Review, Service } from "@/lib/types";
import { filled, safeHttpUrl } from "@/lib/utils";

export function PageHero({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
  return (
    <header className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 md:pb-16 md:pt-20">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-deep">{eyebrow}</p>
        <h1 className="mt-3 max-w-4xl text-[36px] font-bold leading-[1.15] text-ink md:text-[56px]">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate">{lede}</p>
      </div>
      <Wave fill="#FFFBF0" />
    </header>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <p className="text-sun" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </p>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-card bg-white p-5 shadow-card">
      {review.source === "sample" && <p className="mb-2 inline-flex rounded-full bg-coral/20 px-3 py-1 text-xs font-bold text-ink">Sample — replace with real reviews</p>}
      <Stars rating={review.rating} />
      <p className="mt-3">{review.text}</p>
      <p className="mt-4 text-sm font-semibold">{review.name}</p>
      <p className="text-sm text-slate">{review.service} · {review.date}</p>
    </article>
  );
}

export function GoogleButtons({ google }: { google: string }) {
  const href = safeHttpUrl(google);
  if (!href) return null;
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <a className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-sun px-6 font-semibold text-ink" href={href} target="_blank" rel="noopener noreferrer">Read our Google reviews</a>
      <a className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-teal-deep px-6 font-semibold text-teal-deep" href={href} target="_blank" rel="noopener noreferrer">Leave a review</a>
    </div>
  );
}

const TRUST = [
  [ShieldCheck, "Commercial-grade equipment"],
  [Clock, "Quick drying"],
  [PawPrint, "Kid and pet safe products"],
  [CalendarCheck, "Same-day available"],
  [BadgePercent, "Fixed-price quotes"],
] as const;

export function TrustBar() {
  return (
    <section className="bg-cream" aria-label="What you can expect">
      <div className="mx-auto grid max-w-6xl gap-3 px-4 py-8 sm:grid-cols-2 lg:grid-cols-5">
        {TRUST.map(([Icon, label]) => (
          <div key={label} className="flex items-center gap-3 rounded-card bg-white px-4 py-3 shadow-card">
            <Icon className="h-6 w-6 shrink-0 text-teal-deep" aria-hidden />
            <p className="text-sm font-semibold">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ServiceCards({ services }: { services: Service[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.filter((service) => service.visible).map((service) => (
        <FadeIn key={service.id}>
          <Link href={`/services/${service.slug}`} className="flex h-full flex-col rounded-card bg-white p-5 shadow-card transition hover:-translate-y-0.5">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-sky text-teal-deep"><ServiceIcon name={service.icon} /></span>
            <h3 className="mt-4 text-xl font-bold">{service.title}</h3>
            <p className="mt-2 flex-1 text-slate">{service.summary}</p>
            <span className="mt-4 font-semibold text-teal-deep">View service</span>
          </Link>
        </FadeIn>
      ))}
    </div>
  );
}

export function Pillars() {
  const items = [
    ["Commercial-grade equipment", "Extractors and upholstery tools meant for regular cleaning work, not a hire-shop machine."],
    ["Pet-safe and kid-safe products", "We choose products with households in mind and tell you when a surface needs to stay clear while it dries."],
    ["Fixed pricing", "You hear the price before we start. If the job is bigger than described, we pause and agree the change."],
    ["Local NT team", "We live and work around Darwin, so the advice matches the humidity, not a southern winter."],
    ["Fast and flexible booking", "Morning calls often still have a same-day option. We say so plainly when the diary is full."],
    ["Honest results", "If a stain is set, or a rug should not be wetted, we tell you. Photos on this site that say Illustrative are examples, not past jobs."],
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(([title, text]) => (
        <article key={title} className="rounded-card bg-white p-5 shadow-card">
          <Check className="h-6 w-6 text-teal-deep" aria-hidden />
          <h3 className="mt-3 text-xl font-bold">{title}</h3>
          <p className="mt-2 text-slate">{text}</p>
        </article>
      ))}
    </div>
  );
}

export function Steps() {
  const steps = [
    ["1", "Get a quote", "Tell us the service, the size and the suburb. We call back with a fixed price."],
    ["2", "We clean", "We inspect, treat and extract, then show you the room before we pack up."],
    ["3", "Enjoy the fresh result", "Walk on it once it is dry. We leave you with a realistic drying time for the day."],
  ];
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {steps.map(([number, title, text]) => (
        <li key={number} className="rounded-card bg-white p-5 shadow-card">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-sun font-bold text-ink">{number}</span>
          <h3 className="mt-4 text-xl font-bold">{title}</h3>
          <p className="mt-2 text-slate">{text}</p>
        </li>
      ))}
    </ol>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-[#d7ebee] rounded-card bg-white px-5 shadow-card">
      {faqs.map((faq) => (
        <details key={faq.id} className="group py-4">
          <summary className="cursor-pointer list-none font-semibold marker:content-none [&::-webkit-details-marker]:hidden">{faq.question}</summary>
          <p className="mt-2 text-slate">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function AreaList({ areas }: { areas: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {areas.map((area) => <li key={area} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm"><MapPin className="h-3.5 w-3.5 text-teal" aria-hidden />{area}</li>)}
    </ul>
  );
}

export function TeamCard({ photo }: { photo: string }) {
  if (filled(photo)) return <MediaImage src={photo} alt="The Spotless NT team" className="h-full w-full rounded-card object-cover" />;
  return (
    <div className="flex h-full min-h-64 flex-col justify-end rounded-card bg-gradient-to-br from-teal-deep to-teal p-6 text-white">
      <div className="mb-6 h-28 w-24 rounded-t-full bg-[#09808F] ring-4 ring-white/30">
        <div className="mx-auto mt-16 h-12 w-20 rounded-t-2xl bg-white/90" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">Illustrative</p>
      <p className="mt-2 text-xl font-bold">Teal crew shirt, white logo on the chest.</p>
      <p className="mt-2 text-white/85">Add a real team photo in the admin gallery when you have one. Until then this card stands in.</p>
    </div>
  );
}
