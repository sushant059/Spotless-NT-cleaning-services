import type { Metadata } from "next";
import { PageHero } from "@/components/content";
import { ResultsGallery } from "@/components/results-gallery";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Before and after",
  description: "Illustrative before and after previews for Spotless NT. Real job photos replace them from the admin panel.",
};

export default async function ResultsPage() {
  const db = await getDb();
  return (
    <>
      <PageHero eyebrow="Results" title="Before and after" lede="Drag the handle to compare. Every starter image is marked illustrative until a real job photo replaces it." />
      <section className="bg-cream px-4 py-12">
        <div className="mx-auto max-w-6xl"><ResultsGallery results={byOrder(db.results)} services={db.services} /></div>
      </section>
    </>
  );
}
