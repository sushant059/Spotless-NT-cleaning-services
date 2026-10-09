import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { FaqList } from "@/components/content";
import { MediaImage } from "@/components/media-image";
import { SceneArt } from "@/components/scene-art";
import { getDb } from "@/lib/store";
import { siteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const service = db.services.find((item) => item.slug === slug && item.visible);
  if (!service) return { title: "Service" };
  return { title: service.title, description: service.summary };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const service = db.services.find((item) => item.slug === slug && item.visible);
  if (!service) notFound();
  const related = db.services.filter((item) => service.related.includes(item.slug) && item.visible);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: { "@type": "LocalBusiness", name: db.settings.businessName, telephone: db.settings.phoneTel },
    areaServed: "Darwin, Northern Territory",
    url: `${siteUrl()}/services/${service.slug}`,
  };
  return (
    <article className="bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-deep">Spotless NT</p>
            <h1 className="mt-3 text-[36px] font-bold leading-[1.15] md:text-[56px]">{service.title}</h1>
            <p className="mt-4 text-lg text-slate">{service.description}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={`/free-quote?service=${service.slug}`} className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-sun px-6 font-semibold text-ink">Get a quote</Link>
              <Link href={`/booking?service=${service.slug}`} className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-teal-deep px-6 font-semibold text-teal-deep">Book this service</Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-card shadow-card">
            {service.image ? <MediaImage src={service.image} alt="" className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3]"><SceneArt scene={service.slug} clean alt="" /></div>}
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2">
        <section className="rounded-card bg-white p-6 shadow-card">
          <h2 className="text-2xl font-bold">{"What's included"}</h2>
          <ul className="mt-4 space-y-3">{service.included.map((item) => <li key={item} className="flex gap-2"><Check className="mt-1 h-5 w-5 shrink-0 text-teal-deep" aria-hidden />{item}</li>)}</ul>
        </section>
        <section className="rounded-card bg-white p-6 shadow-card">
          <h2 className="text-2xl font-bold">Best for</h2>
          <ul className="mt-4 space-y-3">{service.bestFor.map((item) => <li key={item} className="flex gap-2"><Check className="mt-1 h-5 w-5 shrink-0 text-mint" aria-hidden />{item}</li>)}</ul>
        </section>
      </div>
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-[28px] font-bold">How this clean runs</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {service.process.map((step, index) => (
            <li key={step.title} className="rounded-card bg-white p-5 shadow-card"><p className="text-sm font-bold text-teal-deep">Step {index + 1}</p><h3 className="mt-1 text-xl font-bold">{step.title}</h3><p className="mt-2 text-slate">{step.detail}</p></li>
          ))}
        </ol>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-[28px] font-bold">Video</h2>
        <div className="mt-4 overflow-hidden rounded-card bg-white shadow-card">
          {service.videoUrl ? <video className="aspect-video w-full" controls preload="none" src={service.videoUrl} /> : <div className="aspect-video"><SceneArt scene={service.slug} clean alt="" /></div>}
          <p className="px-4 py-3 text-sm text-slate">{service.videoUrl ? "Job video" : "Illustrative preview until a real video is added."}</p>
        </div>
      </section>
      {service.faqs.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <h2 className="mb-4 text-[28px] font-bold">Questions about this service</h2>
          <FaqList faqs={service.faqs.map((faq, index) => ({ id: `${service.id}-${index}`, category: service.title, question: faq.question, answer: faq.answer, order: index }))} />
        </section>
      )}
      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="text-[28px] font-bold">Related services</h2>
          <ul className="mt-4 flex flex-wrap gap-3">{related.map((item) => <li key={item.id}><Link className="inline-flex min-h-11 items-center rounded-full bg-white px-4 font-semibold text-teal-deep shadow-card" href={`/services/${item.slug}`}>{item.title}</Link></li>)}</ul>
        </section>
      )}
    </article>
  );
}
