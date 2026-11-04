import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, MapPin, MessageSquareText, Phone } from "lucide-react";
import { CtaBand, FaqList, PageHero, SectionHeading, ServiceCard } from "@/components/content";
import { REGION_LABEL, REGION_NOTE, areaSlug, findArea, nearbyAreas, regionOf } from "@/lib/areas";
import { getDb } from "@/lib/store";
import { STOCK } from "@/lib/stock";
import { byOrder, siteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ suburb: string }> }): Promise<Metadata> {
  const { suburb: slug } = await params;
  const db = await getDb();
  const suburb = findArea(db.settings.serviceAreas, slug);
  if (!suburb) return { title: "Service area" };
  return {
    title: `Cleaning Services in ${suburb} NT – Carpet, Couch & Bond Cleaning`,
    description: `Local carpet steam cleaning, couch and mattress cleaning, end of lease bond cleans and office cleaning in ${suburb}, NT. Fixed price before we start. Call ${db.settings.phoneDisplay} for a free quote.`,
    alternates: { canonical: `/areas/${slug}` },
  };
}

export default async function AreaPage({ params }: { params: Promise<{ suburb: string }> }) {
  const { suburb: slug } = await params;
  const db = await getDb();
  const s = db.settings;
  const suburb = findArea(s.serviceAreas, slug);
  if (!suburb) notFound();
  const region = regionOf(suburb);
  const services = byOrder(db.services).filter((service) => service.visible);
  const nearby = nearbyAreas(s.serviceAreas, suburb);
  const faqs = byOrder(db.faqs).slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Cleaning services in ${suburb}`,
    serviceType: "Carpet, upholstery, mattress, bond and office cleaning",
    areaServed: { "@type": "Place", name: `${suburb}, Northern Territory, Australia` },
    provider: { "@type": "LocalBusiness", name: s.businessName, telephone: s.phoneTel, url: siteUrl() },
    url: `${siteUrl()}/areas/${slug}`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero
        image={region === "rural" ? STOCK.living : region === "palmerston" ? STOCK.bond : STOCK.carpet}
        eyebrow={REGION_LABEL[region]}
        title={`Cleaning services in ${suburb}`}
        lede={`Carpet steam cleaning, couches, mattresses, rugs, bond cleans and offices across ${suburb}. Locally owned, fixed price before we start.`}
        crumbs={[{ href: "/areas", label: "Areas" }, { href: `/areas/${slug}`, label: suburb }]}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/free-quote" className="press inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-leaf px-7 text-lg font-bold text-white hover:bg-leaf-dark">Free quote in {suburb} <ArrowRight className="h-5 w-5" aria-hidden /></Link>
          <a href={`tel:${s.phoneTel}`} className="press inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-lg font-bold text-navy hover:bg-brand-light"><Phone className="h-5 w-5" aria-hidden /> {s.phoneDisplay}</a>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">Local to {suburb}</p>
            <h2 className="h-section mt-3">A cleaner home in {suburb}, without the hassle.</h2>
            <p className="lede">{REGION_NOTE[region]}</p>
            <p className="mt-4 text-slate">Tell us what needs cleaning, send a few photos if you like, and we’ll give you a fixed price before we start. No surprises on the day.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Fixed price before we start", "Kid & pet safe products", "Fast-drying methods for the Top End", "Locally owned & operated", "Bond-ready carpet cleaning with receipt", "Same-day when available"].map((item) => (
                <li key={item} className="flex items-start gap-2.5 font-medium text-navy"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-leaf-dark" aria-hidden />{item}</li>
              ))}
            </ul>
            <button type="button" data-open-chat className="press mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 font-bold text-white hover:bg-brand"><MessageSquareText className="h-5 w-5" aria-hidden /> Get a price in the chat</button>
          </div>
          <div className="card p-6">
            <p className="flex items-center gap-2 font-bold text-navy"><MapPin className="h-5 w-5 text-leaf-dark" aria-hidden /> We also clean near {suburb}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {nearby.map((area) => <Link key={area} href={`/areas/${areaSlug(area)}`} className="rounded-full bg-mist px-3.5 py-2 text-sm font-semibold text-navy ring-1 ring-line hover:bg-brand-light">{area}</Link>)}
              <Link href="/areas" className="rounded-full px-3.5 py-2 text-sm font-semibold text-brand hover:underline">All areas →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-mist">
        <div className="container-x">
          <SectionHeading eyebrow="Services" title={`What we clean in ${suburb}`} />
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
            {services.map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="section">
          <div className="container-x max-w-3xl">
            <SectionHeading eyebrow="FAQs" title="Good to know" />
            <div className="mt-8"><FaqList faqs={faqs} /></div>
          </div>
        </section>
      )}
      <CtaBand settings={s} />
    </>
  );
}
