import type { Metadata } from "next";
import { CtaBand, PageHero } from "@/components/content";
import { ResultsGallery } from "@/components/results-gallery";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Before and after",
  description: "Before and after results from Spotless NT carpet, couch, mattress, rug and bond cleaning in Darwin.",
};

export default async function ResultsPage() {
  const db = await getDb();
  return (
    <>
      <PageHero image={STOCK.upholstery} eyebrow="Before & after" title="See the difference for yourself." lede="Drag each slider to compare. Filter by service to find a job like yours." crumbs={[{ href: "/results", label: "Before & after" }]} />
      <section className="section pt-12">
        <div className="container-x"><ResultsGallery results={byOrder(db.results)} services={byOrder(db.services)} /></div>
      </section>
      <CtaBand settings={db.settings} />
    </>
  );
}
