import type { Metadata } from "next";
import { PageHero } from "@/components/content";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for quotes and bookings with Spotless NT Cleaning Services in the Northern Territory.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Terms" title="Terms of service" lede="These terms cover quote requests and cleaning booked with Spotless NT. They sit alongside the Australian Consumer Law." />
      <section className="bg-cream px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-4 rounded-card bg-white p-6 text-slate shadow-card">
          <p>A form, chat or phone enquiry is a request. It becomes a booking only when we confirm the price and the time with you. Reference codes help us find your request. They are not a tax invoice.</p>
          <p>Quotes are based on what you tell us and any photos you send. If the job is larger, more stained, or unsafe to clean as described, we will pause and agree a new price or decline the work before continuing.</p>
          <p>You are responsible for access, parking where it is reasonable, and moving small valuables. Tell us about loose dye, damage, water-sensitive floors and pets. We will tell you if we think cleaning could make a problem worse.</p>
          <p>Drying times are estimates. Humidity in the Northern Territory changes them. Keep people and pets off wet surfaces until they feel dry.</p>
          <p>Payment is due after the clean, by a method we have confirmed with you. Please cancel or move a booking as early as you can. If we have already travelled, a travel fee may apply and we will say so when the booking is confirmed.</p>
          <p>End-of-lease paperwork is a receipt and a short job note. It is not a guarantee that a property manager will release a bond.</p>
          <p>Promo codes are only valid when they are active in our system and we confirm them with the quote. Nothing in these terms limits rights you have under the Australian Consumer Law that cannot be excluded.</p>
          <p>Questions: regmisusanth94@gmail.com or 0401 647 545.</p>
        </div>
      </section>
    </>
  );
}
