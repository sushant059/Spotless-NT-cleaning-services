import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, MessageSquareText, Phone, Tag } from "lucide-react";
import { BeforeAfter } from "@/components/before-after";
import { CtaBand, FaqList, PageHero, ReviewCard, SectionHeading, ServiceCard } from "@/components/content";
import { PhotoGallery } from "@/components/gallery";
import { Photo } from "@/components/photo";
import { VideoPlayer } from "@/components/video";
import { whatsappHref } from "@/components/social";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { getDb } from "@/lib/store";
import { serviceGalleryStock, serviceStock } from "@/lib/stock";
import { byOrder, cn, filled, siteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const service = db.services.find((item) => item.slug === slug && item.visible);
  if (!service) return { title: "Service" };
  return { title: `${service.title} in Darwin`, description: service.summary, openGraph: service.image ? { images: [service.image] } : undefined };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const service = db.services.find((item) => item.slug === slug && item.visible);
  if (!service) notFound();
  const category = SERVICE_CATEGORIES.find((item) => item.id === service.category);
  const related = byOrder(db.services).filter((item) => item.visible && item.slug !== service.slug && (service.related.includes(item.slug) || item.category === service.category)).slice(0, 3);
  const results = byOrder(db.results).filter((item) => item.serviceSlug === service.slug);
  const reviews = db.reviews.filter((review) => review.status === "approved" && review.service.toLowerCase() === service.title.toLowerCase()).slice(0, 2);
  const s = db.settings;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: { "@type": "LocalBusiness", name: s.businessName, telephone: s.phoneTel },
    areaServed: "Darwin, Northern Territory",
    url: `${siteUrl()}/services/${service.slug}`,
  };
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero image={serviceStock(service.slug)} src={service.image} eyebrow={category?.title ?? "Service"} title={service.title} lede={service.summary} crumbs={[{ href: "/services", label: "Services" }, ...(category ? [{ href: `/services#${category.id}`, label: category.title }] : []), { href: `/services/${service.slug}`, label: service.title }]}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={`/free-quote?service=${service.slug}`} className="inline-flex min-h-14 items-center justify-center rounded-full bg-leaf-dark px-7 font-bold text-white hover:bg-[#1d6a19]">Get a free quote</Link>
          <Link href={`/booking?service=${service.slug}`} className="inline-flex min-h-14 items-center justify-center rounded-full bg-white px-7 font-bold text-navy hover:bg-brand-light">Book this service</Link>
        </div>
      </PageHero>

      <div className="container-x grid gap-10 py-14 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-16">
          {/* Video */}
          <section aria-labelledby="video-heading">
            <h2 id="video-heading" className="sr-only">Video</h2>
            <div className="overflow-hidden rounded-card shadow-soft ring-1 ring-line">
              <VideoPlayer url={service.videoUrl} poster={service.image} title={`${service.title} by Spotless NT`} scene={service.slug} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="About this service" title="What to expect" />
            <p className="mt-4 text-lg leading-relaxed text-slate">{service.description}</p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="card p-6">
                <h3 className="font-display text-xl font-bold text-navy">What’s included</h3>
                <ul className="mt-4 space-y-3">{service.included.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-leaf-dark" aria-hidden />{item}</li>)}</ul>
              </div>
              <div className="card p-6">
                <h3 className="font-display text-xl font-bold text-navy">Perfect for</h3>
                <ul className="mt-4 space-y-3">{service.bestFor.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />{item}</li>)}</ul>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Our process" title="How the clean runs" />
            <ol className="mt-8 space-y-2">
              {service.process.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand font-display font-bold text-white">{index + 1}</span>
                    {index < service.process.length - 1 && <span className="mt-2 w-0.5 flex-1 rounded bg-line" aria-hidden />}
                  </div>
                  <div className="pb-6">
                    <h3 className="font-display text-xl font-bold text-navy">{step.title}</h3>
                    <p className="mt-1 text-slate">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <SectionHeading eyebrow="Before & after" title="Results" />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {(results.length ? results : [{ id: "placeholder", scene: service.slug, serviceSlug: service.slug, caption: `${service.title}, illustrative example`, beforeImage: "", afterImage: "", illustrative: true, order: 0 }]).map((item) => (
                <figure key={item.id}>
                  <BeforeAfter scene={item.scene || service.slug} beforeSrc={item.beforeImage} afterSrc={item.afterImage} beforeAlt={`Before: ${item.caption}`} afterAlt={`After: ${item.caption}`} />
                  <figcaption className="mt-2 text-sm font-semibold text-navy">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Gallery" title="Photos from the job" />
            <div className="mt-8">
              {service.gallery.length > 0 ? (
                <PhotoGallery images={service.gallery} title={service.title} />
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {serviceGalleryStock(service.slug).map((item, index) => (
                    <div key={item.id} className={cn("relative overflow-hidden rounded-2xl bg-mist", index === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square")}>
                      <Photo stock={[item]} alt={item.alt} fill sizes={index === 0 ? "(max-width: 768px) 100vw, 40vw" : "(max-width: 768px) 50vw, 20vw"} className="transition duration-700 hover:scale-105" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {reviews.length > 0 && (
            <section>
              <SectionHeading eyebrow="Reviews" title={`What customers say about ${service.title.toLowerCase()}`} />
              <div className="mt-8 grid gap-5 md:grid-cols-2">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
            </section>
          )}

          {service.faqs.length > 0 && (
            <section>
              <SectionHeading eyebrow="FAQs" title="Questions about this service" />
              <div className="mt-8"><FaqList faqs={service.faqs.map((faq, index) => ({ id: `${service.id}-${index}`, category: service.title, question: faq.question, answer: faq.answer, order: index }))} /></div>
            </section>
          )}
        </div>

        {/* Sticky side card */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card overflow-hidden">
            <div className="bg-navy p-6 text-white">
              <p className="text-sm font-semibold text-sky-soft">{category?.title}</p>
              <p className="mt-1 font-display text-2xl font-extrabold">{service.title}</p>
            </div>
            <dl className="divide-y divide-line px-6">
              <div className="flex items-center justify-between gap-3 py-4"><dt className="flex items-center gap-2 text-slate"><Tag className="h-4 w-4" aria-hidden /> Price</dt><dd className="font-bold text-navy">{filled(service.priceFrom) ? `From ${service.priceFrom}` : "Free fixed quote"}</dd></div>
              <div className="flex items-center justify-between gap-3 py-4"><dt className="flex items-center gap-2 text-slate"><Clock className="h-4 w-4" aria-hidden /> Time on site</dt><dd className="font-bold text-navy">{filled(service.duration) ? service.duration : "Confirmed with quote"}</dd></div>
            </dl>
            <div className="grid gap-3 p-6 pt-2">
              <Link href={`/free-quote?service=${service.slug}`} className="inline-flex min-h-12 items-center justify-center rounded-full bg-leaf-dark font-bold text-white hover:bg-[#1d6a19]">Get a free quote</Link>
              <button type="button" data-open-chat className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-light font-bold text-brand hover:bg-sky-soft"><MessageSquareText className="h-4 w-4" aria-hidden /> Book in chat</button>
              <a href={whatsappHref(s, `Hi Spotless NT, I'd like a quote for ${service.title.toLowerCase()}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-line font-bold text-navy hover:border-whatsapp">WhatsApp us</a>
              <a href={`tel:${s.phoneTel}`} className="mt-1 flex items-center justify-center gap-2 text-sm font-semibold text-slate hover:text-navy"><Phone className="h-4 w-4" aria-hidden /> {s.phoneDisplay}</a>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section bg-mist">
          <div className="container-x">
            <SectionHeading eyebrow="Pairs well with" title="Related services" action={<Link href="/services" className="link-arrow">All services <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
            <div className="mt-8 grid gap-5 md:grid-cols-3">{related.map((item) => <ServiceCard key={item.id} service={item} />)}</div>
          </div>
        </section>
      )}
      <CtaBand settings={s} />
    </article>
  );
}
