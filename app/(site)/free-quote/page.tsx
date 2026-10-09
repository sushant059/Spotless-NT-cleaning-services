import type { Metadata } from "next";
import { PageHero } from "@/components/content";
import { QuoteForm } from "@/components/forms/quote-form";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free quote",
  description: "Ask Spotless NT for a fixed quote on carpet, couch, mattress, rug or end-of-lease cleaning in Darwin.",
};

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const db = await getDb();
  const initial = db.services.some((item) => item.slug === service && item.visible) ? service : "";
  return (
    <>
      <PageHero eyebrow="Free quote" title="Tell us the job" lede="A short form is enough. Add photos if a stain or a sofa is easier to see than to describe. We email you a reference and call with the price." />
      <section className="bg-cream px-4 py-12">
        <div className="mx-auto max-w-xl">
          <QuoteForm services={byOrder(db.services)} areas={db.settings.serviceAreas} settings={db.settings} initialService={initial} />
        </div>
      </section>
    </>
  );
}
