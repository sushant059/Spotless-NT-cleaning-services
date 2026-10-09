import type { Metadata } from "next";
import { PageHero, ServiceCards } from "@/components/content";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cleaning services",
  description: "Carpet, couch, mattress, rug, upholstery, pet stain, emergency, end-of-lease and office cleaning around Darwin.",
};

export default async function ServicesPage() {
  const db = await getDb();
  return (
    <>
      <PageHero eyebrow="Services" title="What we clean" lede="Choose a service for what is included, who it suits, and a quote that already has the right job selected." />
      <section className="bg-cream px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl"><ServiceCards services={byOrder(db.services)} /></div>
      </section>
    </>
  );
}
