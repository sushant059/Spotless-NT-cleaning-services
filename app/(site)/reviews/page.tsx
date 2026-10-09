import type { Metadata } from "next";
import { GoogleButtons, PageHero, ReviewCard } from "@/components/content";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Reviews for Spotless NT Cleaning Services. Sample cards are labelled until real customer reviews replace them.",
};

export default async function ReviewsPage() {
  const db = await getDb();
  const reviews = byOrder(db.reviews).filter((review) => review.visible);
  return (
    <>
      <PageHero eyebrow="Reviews" title="What customers say" lede="Sample cards are labelled so they are not mistaken for real reviews. A Google link, once added in settings, is where new reviews should go." />
      <section className="bg-cream px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <GoogleButtons google={db.settings.google} />
          <div className="mt-8 grid gap-4 md:grid-cols-2">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
        </div>
      </section>
    </>
  );
}
