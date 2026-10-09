import type { Metadata } from "next";
import { PageHero } from "@/components/content";
import { FaqBrowser } from "@/components/faq-browser";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Drying times, pets, stains, bond paperwork, booking and payment for Spotless NT cleaning in Darwin.",
};

export default async function FaqsPage() {
  const db = await getDb();
  const faqs = byOrder(db.faqs);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero eyebrow="FAQs" title="Good questions" lede="Short answers we are happy to repeat on the phone. If your job is unusual, ask — the form is there for that." />
      <section className="bg-cream px-4 py-12">
        <div className="mx-auto max-w-3xl"><FaqBrowser faqs={faqs} /></div>
      </section>
    </>
  );
}
