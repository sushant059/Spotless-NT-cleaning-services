import type { Metadata } from "next";
import { CtaBand, PageHero } from "@/components/content";
import { FaqBrowser } from "@/components/faq-browser";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Drying times, pets, stains, bond paperwork, booking and payment for Territory Spotless cleaning in Darwin.",
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero image={STOCK.sofa} eyebrow="FAQs" title="Good questions, straight answers." lede="Search or browse by topic. If your job is unusual, just ask. That’s what the chat is for." crumbs={[{ href: "/faqs", label: "FAQs" }]} />
      <section className="section pt-12">
        <div className="container-x max-w-3xl"><FaqBrowser faqs={faqs} /></div>
      </section>
      <CtaBand settings={db.settings} />
    </>
  );
}
