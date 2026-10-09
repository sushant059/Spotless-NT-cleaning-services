import type { Metadata } from "next";
import { BookingForm } from "@/components/forms/booking-form";
import { PageHero } from "@/components/content";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book a clean",
  description: "Request a carpet, couch, mattress or bond clean in Darwin. We call to confirm the time and the fixed price.",
};

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const db = await getDb();
  const initial = db.services.some((item) => item.slug === service && item.visible) ? service : "";
  return (
    <>
      <PageHero eyebrow="Booking" title="Request a clean" lede="Choose the services, a preferred day and your address. We call to confirm. The time is not locked in until we say so." />
      <section className="bg-cream px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <BookingForm services={byOrder(db.services)} areas={db.settings.serviceAreas} blocked={db.blockedDates} settings={db.settings} initialService={initial} />
        </div>
      </section>
    </>
  );
}
