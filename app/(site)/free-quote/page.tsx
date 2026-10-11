import type { Metadata } from "next";
import { CheckCircle2, MessageSquareText } from "lucide-react";
import { PageHero } from "@/components/content";
import { QuoteForm } from "@/components/forms/quote-form";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Free quote",
  description: "Get a free fixed quote for carpet, couch, mattress, rug or end-of-lease cleaning in Darwin.",
};

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const db = await getDb();
  const initial = db.services.some((item) => item.slug === service && item.visible) ? service : "";
  return (
    <>
      <PageHero image={STOCK.carpetAlt} eyebrow="Free quote" title="Get your fixed price." lede="A short form is enough. Add photos if a stain is easier to show than describe. We’ll call you with the price." crumbs={[{ href: "/free-quote", label: "Free quote" }]} />
      <section className="section pt-12">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            {["No call-out fee to get a price", "Fixed price agreed before we start", "Reference number sent to your email", "Promo codes applied when we call"].map((item) => (
              <p key={item} className="flex items-center gap-3 font-semibold text-navy"><CheckCircle2 className="h-6 w-6 text-leaf-dark" aria-hidden /> {item}</p>
            ))}
            <button type="button" data-open-chat className="card mt-6 flex w-full items-center gap-4 p-5 text-left transition hover:shadow-soft">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-white"><MessageSquareText className="h-5 w-5" aria-hidden /></span>
              <span><span className="block font-bold text-navy">Prefer to chat?</span><span className="text-sm text-slate">Our assistant asks the right questions for you.</span></span>
            </button>
          </div>
          <div className="card p-6 md:p-8">
            <QuoteForm services={byOrder(db.services).filter((item) => item.visible)} areas={db.settings.serviceAreas} settings={db.settings} initialService={initial} />
          </div>
        </div>
      </section>
    </>
  );
}
